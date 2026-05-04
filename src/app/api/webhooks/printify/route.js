import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const payload = await request.json();

    // 🕵️ THE X-RAY: Log the exact payload so we can see what Printify is sending
    console.log("📦 RAW PRINTIFY PAYLOAD:", JSON.stringify(payload, null, 2));

    // 1. Basic Verification (Loosened to accept different Printify formats)
    if (!payload || !payload.type) {
      console.log("❌ Rejected: No payload type found.");
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const eventType = payload.type;

    // ==========================================
    // 🔴 PRODUCT PUBLISHING INTERCEPTOR
    // ==========================================
    if (eventType === 'product:publish:started' || eventType === 'shop:product:publish:started') {
      
      // Safely extract the ID (Printify sometimes puts it in data.id, resource.id, or just id)
      const printifyProductId = payload.data?.id || payload.resource?.id || payload.id;

      if (!printifyProductId) {
         console.log("❌ Could not find Product ID in this payload.");
         return NextResponse.json({ error: "Missing Product ID" }, { status: 400 });
      }

      console.log(`▶️ Intercepted Publish Event for Product ID: ${printifyProductId}. Sending Success Receipt...`);

      try {
        const publishRes = await fetch(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products/${printifyProductId}/publishing_succeeded.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            external: {
              id: `etho-${printifyProductId}`, 
              handle: `https://ethohaiti.com/product/${printifyProductId}` 
            }
          })
        });

        if (publishRes.ok) {
          console.log(`✅ Automated Success Receipt sent for Product ${printifyProductId}!`);
          return NextResponse.json({ success: true, message: "Product unlocked in Printify" }, { status: 200 });
        } else {
          const errText = await publishRes.text();
          console.error("❌ Failed to auto-unlock product:", errText);
          return NextResponse.json({ error: "Failed to unlock Printify product" }, { status: 500 });
        }
      } catch (err) {
        console.error("❌ System error during auto-unlock:", err);
        return NextResponse.json({ error: "System error unlocking product" }, { status: 500 });
      }
    }

    // ==========================================
    // 🟢 EXISTING: ORDER TRACKING LOGIC
    // ==========================================
    
    // If it's an order event, it MUST have data.id. If not, safely ignore it instead of throwing a 400 error.
    if (!payload.data || !payload.data.id) {
       console.log("⚠️ Ignored: Event did not match expected order format.");
       return NextResponse.json({ success: true, message: "Ignored unhandled event type" }, { status: 200 });
    }

    const printifyOrderId = payload.data.id;
    const shipments = payload.data.shipments || [];

    // Determine our frontend status based on Printify's exact event signal
    let newStatus = 'processing'; // default fallback
    
    if (eventType === 'order:sent-to-production') {
      newStatus = 'in production';
    } else if (eventType === 'order:canceled' || payload.data?.status === 'canceled') {
      newStatus = 'cancelled';
    } else if (eventType === 'order:shipment:delivered') {
      newStatus = 'delivered';
    } else if (eventType === 'order:shipment:created' || payload.data?.status === 'shipped') {
      newStatus = 'shipped';
    } else {
      newStatus = payload.data?.status === 'canceled' ? 'cancelled' : (payload.data?.status || 'processing');
    }

    // Initialize Supabase Admin
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch the existing order from your database
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('items')
      .eq('printify_order_id', printifyOrderId)
      .single();

    if (fetchError || !order) {
      console.error(`⚠️ Order not found in DB for Printify ID: ${printifyOrderId}`);
      return NextResponse.json({ success: true, message: "Order not found, skipped." }, { status: 200 });
    }

    // The Split-Shipment Matcher
    let packages = [];
    if (shipments.length > 0 && Array.isArray(order.items)) {
      packages = shipments.map(shipment => {
        const matchedItems = order.items.filter(cartItem => 
          shipment.line_items.some(sItem => 
            sItem.variant_id === cartItem.variationId || sItem.product_id === cartItem.id
          )
        );

        const pkgStatus = shipment.delivered_at ? 'delivered' : 'shipped';

        return {
          status: pkgStatus,
          carrier: shipment.carrier,
          tracking_number: shipment.number,
          url: shipment.url,
          shipped_at: shipment.shipped_at || null,
          delivered_at: shipment.delivered_at || null,
          items: matchedItems.length > 0 ? matchedItems : shipment.line_items 
        };
      });
    }

    // Update the Database!
    const updateData = { status: newStatus };
    if (packages.length > 0) {
      updateData.packages = packages;
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('printify_order_id', printifyOrderId);

    if (updateError) {
      console.error("Database Update Error:", updateError);
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Handled ${eventType} successfully` }, { status: 200 });

  } catch (error) {
    console.error("Printify Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}