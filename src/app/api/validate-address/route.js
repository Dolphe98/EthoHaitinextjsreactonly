import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const address = await request.json();

    // 1. Grab your standard Printify credentials (checking both common names)
    const PRINTIFY_TOKEN = process.env.PRINTIFY_API_KEY || process.env.PRINTIFY_API_TOKEN;
    const SHOP_ID = process.env.PRINTIFY_SHOP_ID;

    if (!PRINTIFY_TOKEN || !SHOP_ID) {
      console.error("Missing Printify Env Variables");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // 2. AUTO-FETCH A DUMMY PRODUCT
    // We ask Printify for just 1 product from your store so we don't have to hardcode IDs
    const productRes = await fetch(`https://api.printify.com/v1/shops/${SHOP_ID}/products.json?limit=1`, {
      headers: { 'Authorization': `Bearer ${PRINTIFY_TOKEN}` }
    });
    
    if (!productRes.ok) {
       return NextResponse.json({ error: "Could not connect to Printify catalog to validate address." }, { status: 500 });
    }

    const productData = await productRes.json();
    if (!productData.data || productData.data.length === 0) {
        return NextResponse.json({ error: "Your Printify store has no products to validate against." }, { status: 500 });
    }

    // Extract the IDs automatically from the first product found
    const dummyProductId = productData.data[0].id;
    const dummyVariantId = productData.data[0].variants[0].id;

    // 3. Build the Printify Shipping Calculator Payload
    const printifyPayload = {
      address_to: {
        first_name: address.first_name || "Customer",
        last_name: address.last_name || "Name",
        address1: address.address_1,
        address2: address.address_2 || "",
        city: address.city,
        country: address.country, // e.g., "US"
        region: address.state,    // e.g., "FL"
        zip: address.postcode
      },
      line_items: [
        {
          product_id: dummyProductId,
          variant_id: dummyVariantId,
          quantity: 1
        }
      ]
    };

    // 4. Ping the Printify Shipping Calculator
    const response = await fetch(`https://api.printify.com/v1/shops/${SHOP_ID}/calculator.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRINTIFY_TOKEN}`
      },
      body: JSON.stringify(printifyPayload)
    });

    const data = await response.json();

    // 5. Handle Printify's Verdict
    if (!response.ok) {
      console.error("Printify Validation Failed:", data);
      
      let errorMessage = "This address is invalid for shipping.";
      if (data.errors && data.errors.reason) {
        errorMessage = data.errors.reason;
      } else if (data.message) {
        errorMessage = data.message;
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 6. Address is 100% valid
    return NextResponse.json({ success: true, message: "Address is valid!" }, { status: 200 });

  } catch (error) {
    console.error("Address Validation Route Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}