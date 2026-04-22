import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const payload = await request.json();

    // 1. Verify this is actually a payload from Printify
    if (!payload.type || !payload.data || !payload.data.id) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const eventType = payload.type; // e.g., 'order:canceled', 'order:sent-to-production', 'order:shipment:created'
    const printifyOrderId = payload.data.id;
    const shipments = payload.data.shipments || [];

    // 2. Determine our frontend status based on Printify's exact event signal
    let newStatus = 'processing'; // default fallback
    
    if (eventType === 'order:sent-to-production') {
      newStatus = 'in production';
    } else if (eventType === 'order:canceled' || payload.data.status === 'canceled') {
      newStatus = 'cancelled';
    } else if (eventType === 'order:shipment:delivered') {
      newStatus = 'delivered';
    } else if (eventType === 'order:shipment:created' || payload.data.status === 'shipped') {
      newStatus = 'shipped';
    } else {
      // If it's a general update, safely normalize Printify's text
      newStatus = payload.data.status === 'canceled' ? 'cancelled' : payload.data.status;
    }

    // 3. Initialize Supabase Admin (Bypasses RLS to safely update the database)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 4. Fetch the existing order from your database to get the rich item data
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('items')
      .eq('printify_order_id', printifyOrderId)
      .single();

    if (fetchError || !order) {
      console.error("Order not found in DB for Printify ID:", printifyOrderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 5. The Split-Shipment Matcher
    // Match Printify's boring item IDs to your actual cart items to keep the images/names intact
    let packages = [];
    
    if (shipments.length > 0 && Array.isArray(order.items)) {
      packages = shipments.map(shipment => {
        
        const matchedItems = order.items.filter(cartItem => 
          shipment.line_items.some(sItem => 
            sItem.variant_id === cartItem.variationId || sItem.product_id === cartItem.id
          )
        );

        // Dynamically flag the specific package as delivered if Printify provides a delivery timestamp
        const pkgStatus = shipment.delivered_at ? 'delivered' : 'shipped';

        return {
          status: pkgStatus,
          carrier: shipment.carrier,
          tracking_number: shipment.number,
          url: shipment.url,
          shipped_at: shipment.shipped_at || null,
          delivered_at: shipment.delivered_at || null,
          items: matchedItems.length > 0 ? matchedItems : shipment.line_items // Fallback
        };
      });
    }

    // 6. Update the Database!
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

    // 7. Respond OK so Printify knows we got it
    return NextResponse.json({ success: true, message: `Handled ${eventType} successfully` }, { status: 200 });

  } catch (error) {
    console.error("Printify Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}