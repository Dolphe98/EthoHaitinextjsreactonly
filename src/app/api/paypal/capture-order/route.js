import { NextResponse } from 'next/server';

const { NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
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
    const { orderID } = await req.json();
    const accessToken = await generateAccessToken();

    const response = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to capture PayPal order:", error);
    return NextResponse.json({ error: "Failed to capture order." }, { status: 500 });
  }
}