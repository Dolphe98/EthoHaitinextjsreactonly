import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { orderId, itemId, itemIndex, userId, isGuest, phone } = await request.json();

    if (!orderId || itemIndex === undefined) {
      return NextResponse.json({ error: "Missing order ID or item index" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Fetch the order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 2. The 6-Hour Security Check (Prevents hackers from changing their browser clock)
    const hoursSinceOrder = (new Date() - new Date(order.created_at)) / (1000 * 60 * 60);
    if (hoursSinceOrder > 6) {
      return NextResponse.json({ error: "The 6-hour cancellation window has expired." }, { status: 403 });
    }

    // 3. Security Auth Check
    if (!isGuest && userId) {
      // Logged in user must own the order
      if (order.user_id !== userId) return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    } else if (isGuest) {
      // Guest MUST provide a matching phone number
      if (!phone) return NextResponse.json({ error: "Phone number is mandatory to verify cancellation." }, { status: 400 });
      
      // Clean both numbers to just digits to ensure a perfect match
      const dbPhone = order.shipping_address?.phone?.replace(/\D/g, '') || '';
      const inputPhone = phone.replace(/\D/g, '');
      
      if (!dbPhone || dbPhone !== inputPhone) {
        return NextResponse.json({ error: "The phone number does not match the one used at checkout." }, { status: 403 });
      }
    }

    // 4. Handle Line-Item Cancellation
    let items = Array.isArray(order.items) ? [...order.items] : [];
    
    // Ensure the item exists
    if (!items[itemIndex]) {
      return NextResponse.json({ error: "Item not found in order." }, { status: 404 });
    }
    
    // Ensure it isn't already cancelled
    if (items[itemIndex].status === 'cancelled' || items[itemIndex].status === 'canceled') {
      return NextResponse.json({ error: "This item is already cancelled." }, { status: 400 });
    }

    // Mark the specific line item as cancelled
    items[itemIndex].status = 'cancelled';

    // Check if ALL items in the order are now cancelled
    const isWholeOrderCancelled = items.every(i => i.status === 'cancelled' || i.status === 'canceled');

    // 5. Sync with Printify
    if (order.printify_order_id && process.env.PRINTIFY_SHOP_ID && process.env.PRINTIFY_API_TOKEN) {
      try {
        if (isWholeOrderCancelled) {
          // If ALL items are cancelled, cancel the entire order in Printify
          await fetch(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders/${order.printify_order_id}/cancel.json`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: "Canceled by customer" })
          });
        } else {
          // Partial Cancellation: PUT request to update Printify with ONLY the remaining items
          const remainingPrintifyItems = items
            .filter(i => i.status !== 'cancelled' && i.status !== 'canceled')
            .map(i => ({
              variant_id: i.variationId, // Ensure this aligns with your Printify variant format
              quantity: i.quantity
            }));

          await fetch(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders/${order.printify_order_id}.json`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              line_items: remainingPrintifyItems 
            })
          });
        }
      } catch (printifyErr) {
        console.error("Failed to sync cancellation with Printify:", printifyErr);
        // We continue to update the database so the UI reflects the user's intent.
      }
    }

    // 6. Update the Database
    const updatePayload = { items: items };
    
    // If every single item is now cancelled, update the top-level order status too
    if (isWholeOrderCancelled) {
      updatePayload.status = 'cancelled';
    }

    await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    // Alert the frontend about the success, and notify if the whole order was cancelled so it can update its UI state
    return NextResponse.json({ 
      success: true, 
      message: "Item cancelled successfully.", 
      isWholeOrderCancelled 
    }, { status: 200 });

  } catch (error) {
    console.error("Cancellation Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}