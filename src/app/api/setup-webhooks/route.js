import { NextResponse } from 'next/server';

export async function GET() {
  const { PRINTIFY_API_TOKEN, PRINTIFY_SHOP_ID } = process.env;
  
  // Your live webhook receiver URL
  const webhookUrl = "https://ethohaiti.com/api/webhooks/printify";

  try {
    // Tell Printify to send us the master "Update" signal (which includes cancellations)
    const res = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/webhooks.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: "order:updated",
        url: webhookUrl
      })
    });
    
    const data = await res.json();

    return NextResponse.json({ 
      message: "Order Update & Cancellation bridge built successfully!", 
      details: data 
    });

  } catch (error) {
    console.error("Webhook Setup Error:", error);
    return NextResponse.json({ error: "Failed to build bridge." }, { status: 500 });
  }
}