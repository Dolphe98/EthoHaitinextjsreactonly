import { NextResponse } from 'next/server';

const { NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

// Switch to "https://api-m.paypal.com" when you go live
const base = "https://api-m.sandbox.paypal.com"; 

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
    const { total } = await req.json();

    // MANAGER FIX: Security block to prevent zero, negative, or invalid totals
    if (!total || isNaN(total) || total <= 0) {
      console.error("Invalid total received:", total);
      return NextResponse.json({ error: "Invalid cart total." }, { status: 400 });
    }

    const accessToken = await generateAccessToken();

    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              // Formats the discounted total perfectly for PayPal (e.g., "45.00")
              value: parseFloat(total).toFixed(2),
            },
          },
        ],
      }),
    });

    const order = await response.json();
    return NextResponse.json({ id: order.id });
  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}