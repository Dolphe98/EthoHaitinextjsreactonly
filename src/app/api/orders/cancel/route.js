import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { orderId, userId, isGuest, phone } = await request.json();

    if (!orderId) return NextResponse.json({ error: "Missing order ID" }, { status: 400 });

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

    // 4. Halt Printify Production!
    if (order.printify_order_id && process.env.PRINTIFY_SHOP_ID && process.env.PRINTIFY_API_TOKEN) {
      try {
        await fetch(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders/${order.printify_order_id}/cancel.json`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason: "Canceled by customer" })
        });
      } catch (printifyErr) {
        console.error("Failed to cancel in Printify (might already be cancelled):", printifyErr);
        // We continue anyway to ensure the local database updates
      }
    }

    // 5. Update Database to Cancelled
    await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', orderId);

    return NextResponse.json({ success: true, message: "Order cancelled successfully." }, { status: 200 });

  } catch (error) {
    console.error("Cancellation Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}