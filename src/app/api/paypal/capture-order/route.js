import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import OrderReceipt from '@/emails/OrderReceipt';

// Notice: Removed the old hardcoded PayPal keys from here
const { 
  PRINTIFY_SHOP_ID,
  PRINTIFY_API_TOKEN,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY, // We use the Service key for secure backend-only writes
  RESEND_API_KEY
} = process.env;

// ==========================================
// PAYPAL LIVE ENVIRONMENT SETUP
// ==========================================
const base = "https://api-m.paypal.com";
const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE;
const clientSecret = process.env.PAYPAL_SECRET_LIVE;


// Initialize Supabase Admin Client & Resend
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

async function generateAccessToken() {
  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal credentials for the current environment.");
  }
  
  const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await response.json();
  return data.access_token;
}

export async function POST(req) {
  try {
    // MANAGER FIX: Grab the custom shippingAddress sent from our frontend checkout page
    const { orderID, cart, userId, userEmail, promoCode, shippingAddress } = await req.json();
    const accessToken = await generateAccessToken();

    // 1. CAPTURE THE MONEY
    const response = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    // 2. IF PAYMENT SUCCESSFUL -> TRIGGER THE AUTOMATION PIPELINE
    if (data.status === "COMPLETED") {
      
      // ==========================================
      // A. EXTRACT DETAILS (FORCING CUSTOM ADDRESS)
      // ==========================================
      const customAddress = shippingAddress || {};
      const totalPaid = data.purchase_units[0].payments.captures[0].amount.value;
      
      // Safely parse Name from custom address first
      let firstName = 'Valued';
      let lastName = 'Customer';
      if (customAddress.fullName) {
        const parts = customAddress.fullName.trim().split(' ');
        firstName = parts[0] || 'Valued';
        lastName = parts.slice(1).join(' ') || 'Customer';
      } else if (customAddress.first_name) {
        firstName = customAddress.first_name;
        lastName = customAddress.last_name || '';
      }
      
      const finalEmail = userEmail || customAddress.email || data.payer?.email_address;
      const finalPhone = customAddress.phone || "0000000000";

      // B. Translate Cart Items to Printify's exact format
      const line_items = cart.map(item => ({
        product_id: item.id,
        variant_id: item.variationId,
        quantity: item.quantity
      }));

      // C. Tell Printify to make the shirts using YOUR REAL address, not PayPal's
      const printifyRes = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          external_id: orderID,
          label: `ETH-${orderID.substring(0,6)}`,
          line_items: line_items,
          shipping_method: 1,
          send_shipping_notification: true,
          address_to: {
            first_name: firstName,
            last_name: lastName,
            email: finalEmail,
            phone: finalPhone,
            country: customAddress.country || 'US',
            region: customAddress.state || '',
            address1: customAddress.address_1 || '',
            address2: customAddress.address_2 || '',
            city: customAddress.city || '',
            zip: customAddress.postcode || ''
          }
        })
      });

      const printifyOrder = await printifyRes.json();

      // D. Save the Order to Supabase for the User's Dashboard
      const orderDataToSave = {
        id: orderID,
        user_id: userId || null,
        status: 'processing',
        total: totalPaid,
        printify_order_id: printifyOrder.id || null,
        shipping_address: customAddress, // MANAGER FIX: Save the REAL address to the DB
        items: cart,
        checkout_email: finalEmail
      };
      await supabase.from('orders').insert(orderDataToSave);

      // ==========================================
      // E. SAVE REFERRAL DATA (IF PROMO CODE USED)
      // ==========================================
      if (promoCode) {
        await supabase.from('referrals').insert({
          order_id: orderID,
          promo_code: promoCode,
          order_total: totalPaid
        });
      }

      // ==========================================
      // F. FIRE THE RECEIPT EMAIL VIA RESEND
      // ==========================================
      try {
        const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);
        const discountAmount = promoCode ? (subtotal * 0.10).toFixed(2) : "0.00";

        await resend.emails.send({
          from: 'EthoHaiti <sakpase@ethohaiti.com>', 
          to: [finalEmail],
          subject: 'Order Confirmed: Your EthoHaiti gear is in the works. 🇭🇹',
          react: OrderReceipt({
            orderId: orderID,
            customerName: firstName,
            items: cart,
            subtotal: subtotal.toFixed(2),
            discount: discountAmount,
            total: totalPaid,
            shippingAddress: customAddress // MANAGER FIX: Email gets the real address too
          })
        });
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
      }

      return NextResponse.json({ status: "COMPLETED", orderID: orderID, email: finalEmail });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Fulfillment Pipeline Error:", error);
    return NextResponse.json({ error: "Failed to process order." }, { status: 500 });
  }
}