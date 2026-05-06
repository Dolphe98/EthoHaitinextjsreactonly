import { NextResponse } from 'next/server';

// ==========================================
// PAYPAL LIVE ENVIRONMENT SETUP
// ==========================================
const base = "https://api-m.paypal.com";
const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE;
const clientSecret = process.env.PAYPAL_SECRET_LIVE;

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

    if (!order.id) {
      console.error("PayPal Error Response:", order);
      return NextResponse.json({ error: "Failed to generate Order ID from PayPal." }, { status: 500 });
    }

    return NextResponse.json({ id: order.id });
  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}