import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const { 
  NEXT_PUBLIC_PAYPAL_CLIENT_ID, 
  PAYPAL_CLIENT_SECRET,
  PRINTIFY_SHOP_ID,
  PRINTIFY_API_TOKEN,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY // We use the Service key for secure backend-only writes
} = process.env;

const base = "https://api-m.sandbox.paypal.com"; 

// Initialize Supabase Admin Client
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
    // We grab the cart and user details sent from the frontend
    const { orderID, cart, userId, userEmail } = await req.json();
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

    // 2. IF PAYMENT SUCCESSFUL -> TRIGGER AUTOMATION
    if (data.status === "COMPLETED") {
      
      // A. Extract the Shipping Address PayPal gave us
      const shipping = data.purchase_units[0].shipping;
      const payer = data.payer;
      
      const fullName = shipping.name.full_name.split(' ');
      const firstName = fullName[0];
      const lastName = fullName.slice(1).join(' ') || 'Customer';

      // B. Translate Cart Items to Printify's exact format
      const line_items = cart.map(item => ({
        product_id: item.id,
        variant_id: item.variationId, // This is why we saved variationId in Phase 2!
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
          external_id: orderID, // Cross-reference with PayPal
          label: `ETH-${orderID.substring(0,6)}`, // Short custom order number
          line_items: line_items,
          shipping_method: 1, // Standard shipping
          send_shipping_notification: true,
          address_to: {
            first_name: firstName,
            last_name: lastName,
            email: userEmail || payer.email_address,
            phone: "0000000000", // Required field, placeholder if blank
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
      if (userId) {
        await supabase.from('orders').insert({
          id: orderID,
          user_id: userId,
          status: 'processing',
          total: data.purchase_units[0].payments.captures[0].amount.value,
          printify_order_id: printifyOrder.id || null,
          shipping_address: shipping.address,
          items: cart
        });
      }

      // E. Return ultimate success to the frontend
      return NextResponse.json({ status: "COMPLETED", orderID: orderID });
    }

    // If payment failed, return the failure data
    return NextResponse.json(data);

  } catch (error) {
    console.error("Fulfillment Pipeline Error:", error);
    return NextResponse.json({ error: "Failed to process order." }, { status: 500 });
  }
}