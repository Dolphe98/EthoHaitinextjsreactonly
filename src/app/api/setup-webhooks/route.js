import { NextResponse } from 'next/server';

export async function GET() {
  const { PRINTIFY_API_TOKEN, PRINTIFY_SHOP_ID } = process.env;
  
  // THE FIX: ADDED www. SO VERCEL DOESN'T REJECT THE WEBHOOK
  const webhookUrl = "https://www.ethohaiti.com/api/webhooks/printify";

  // Registering all events at once to the new WWW url
  const topics = [
    "order:updated", 
    "order:sent-to-production",
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
      message: "WWW Bridge built successfully!", 
      details: results 
    });

  } catch (error) {
    console.error("Webhook Setup Error:", error);
    return NextResponse.json({ error: "Failed to build bridge." }, { status: 500 });
  }
}