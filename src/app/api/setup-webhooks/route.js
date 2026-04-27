import { NextResponse } from 'next/server';

export async function GET() {
  const { PRINTIFY_API_TOKEN, PRINTIFY_SHOP_ID } = process.env;
  
  // Your live webhook receiver URL
  const webhookUrl = "https://ethohaiti.com/api/webhooks/printify";

  // The exact events Printify needs to tell us about
  const topics = [
    "order:sent-to-production",
    "order:canceled",
    "order:shipment:created",
    "order:shipment:delivered"
  ];

  const results = [];

  try {
    for (const topic of topics) {
      const res = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/webhooks.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topic,
          url: webhookUrl
        })
      });
      
      const data = await res.json();
      results.push({ topic, status: res.status, response: data });
    }

    return NextResponse.json({ 
      message: "Webhook bridge built successfully!", 
      details: results 
    });

  } catch (error) {
    console.error("Webhook Setup Error:", error);
    return NextResponse.json({ error: "Failed to build bridge." }, { status: 500 });
  }
}