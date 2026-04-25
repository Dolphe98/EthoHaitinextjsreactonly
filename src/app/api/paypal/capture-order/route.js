import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import OrderReceipt from '@/emails/OrderReceipt';

const { 
  NEXT_PUBLIC_PAYPAL_CLIENT_ID, 
  PAYPAL_CLIENT_SECRET,
  PRINTIFY_SHOP_ID,
  PRINTIFY_API_TOKEN,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY, // We use the Service key for secure backend-only writes
  RESEND_API_KEY
} = process.env;

const base = "https://api-m.sandbox.paypal.com"; 

// Initialize Supabase Admin Client & Resend
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

async function generateAccessToken() {
  const auth = Buffer.from(NEXT_PUBLIC_PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
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
    // MANAGER FIX: Grab the promoCode and shippingAddress sent from our updated checkout page
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
      
      // A. Extract the details
      const shipping = data.purchase_units[0].shipping;
      const payer = data.payer;
      const totalPaid = data.purchase_units[0].payments.captures[0].amount.value;
      
      const fullName = shipping.name.full_name.split(' ');
      const firstName = fullName[0];
      const lastName = fullName.slice(1).join(' ') || 'Customer';
      const finalEmail = userEmail || payer.email_address;

      // B. Translate Cart Items to Printify's exact format
      const line_items = cart.map(item => ({
        product_id: item.id,
        variant_id: item.variationId,
        quantity: item.quantity
      }));

      // C. Tell Printify to make the shirts
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
            phone: "0000000000",
            country: shipping.address.country_code,
            region: shipping.address.admin_area_1 || '',
            address1: shipping.address.address_line_1,
            address2: shipping.address.address_line_2 || '',
            city: shipping.address.admin_area_2 || '',
            zip: shipping.address.postal_code
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
        shipping_address: shipping.address,
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
        // Calculate subtotal and discount for the email display
        const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);
        const discountAmount = promoCode ? (subtotal * 0.10).toFixed(2) : "0.00";

        await resend.emails.send({
          from: 'EthoHaiti <sakpase@ethohaiti.com>', // MUST be verified in Resend Dashboard
          to: [finalEmail],
          subject: 'Order Confirmed: Your EthoHaiti gear is in the works. 🇭🇹',
          react: OrderReceipt({
            orderId: orderID,
            customerName: firstName,
            items: cart,
            subtotal: subtotal.toFixed(2),
            discount: discountAmount,
            total: totalPaid,
            shippingAddress: shippingAddress // Passed from frontend state
          })
        });
      } catch (emailError) {
        // We log the error but don't crash the checkout process
        console.error("Failed to send receipt email:", emailError);
      }

      // Return success to the frontend for the redirect
      return NextResponse.json({ status: "COMPLETED", orderID: orderID, email: finalEmail });
    }

    // If payment failed, return the failure data
    return NextResponse.json(data);

  } catch (error) {
    console.error("Fulfillment Pipeline Error:", error);
    return NextResponse.json({ error: "Failed to process order." }, { status: 500 });
  }
}