import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { address, cart } = await request.json();
    const PRINTIFY_TOKEN = process.env.PRINTIFY_API_KEY || process.env.PRINTIFY_API_TOKEN;
    const SHOP_ID = process.env.PRINTIFY_SHOP_ID;

    if (!PRINTIFY_TOKEN || !SHOP_ID) {
      return NextResponse.json({ error: "Missing Printify Env Variables" }, { status: 500 });
    }

    // Format the cart items for Printify
    const line_items = cart.map(item => ({
      product_id: item.id,
      variant_id: item.variationId,
      quantity: item.quantity
    }));

    // Build the exact payload
    const printifyPayload = {
      address_to: {
        first_name: address.first_name || "Customer",
        last_name: address.last_name || "Name",
        address1: address.address_1,
        address2: address.address_2 || "",
        city: address.city,
        country: address.country || "US",
        region: address.state,
        zip: address.postcode
      },
      line_items: line_items
    };

    // Ping Printify's calculator
    const response = await fetch(`https://api.printify.com/v1/shops/${SHOP_ID}/calculator.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRINTIFY_TOKEN}`
      },
      body: JSON.stringify(printifyPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Could not calculate exact shipping." }, { status: 400 });
    }

    // Printify returns the cost in cents (e.g., 450 = $4.50). We convert it to dollars.
    const costInDollars = (data.standard / 100).toFixed(2);

    return NextResponse.json({ shippingCost: costInDollars }, { status: 200 });

  } catch (error) {
    console.error("Calculate Shipping Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}