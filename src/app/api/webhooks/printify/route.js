import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const payload = await request.json();

    // 1. Verify this is actually a payload from Printify
    if (!payload.type || !payload.data || !payload.data.id) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const printifyOrderId = payload.data.id;
    const newStatus = payload.data.status; // e.g., 'processing', 'shipped'
    const shipments = payload.data.shipments || [];

    // 2. Initialize Supabase Admin (Bypasses RLS to safely update the database)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 3. Fetch the existing order from your database to get the rich item data
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('items')
      .eq('printify_order_id', printifyOrderId)
      .single();

    if (fetchError || !order) {
      console.error("Order not found in DB for Printify ID:", printifyOrderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 4. The Split-Shipment Matcher
    // Match Printify's boring item IDs to your actual cart items to keep the images/names intact
    let packages = [];
    
    if (shipments.length > 0 && Array.isArray(order.items)) {
      packages = shipments.map(shipment => {
        
        const matchedItems = order.items.filter(cartItem => 
          shipment.line_items.some(sItem => 
            sItem.variant_id === cartItem.variationId || sItem.product_id === cartItem.id
          )
        );

        return {
          status: 'shipped',
          carrier: shipment.carrier,
          tracking_number: shipment.number,
          url: shipment.url,
          shipped_at: shipment.shipped_at,
          items: matchedItems.length > 0 ? matchedItems : shipment.line_items // Fallback
        };
      });
    }

    // 5. Update the Database!
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

    // 6. Respond OK so Printify knows we got it
    return NextResponse.json({ success: true, message: "Order updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Printify Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}