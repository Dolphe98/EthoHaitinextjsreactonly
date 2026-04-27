import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import OrderReceipt from '@/emails/OrderReceipt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    // 1. Fetch the exact order from your database
    const { data: order, error: sbError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (sbError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 2. Re-calculate the math for the receipt
    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);
    const totalPaid = Number(order.total);
    // If the total paid is less than the subtotal, we know a promo code was used
    const discountAmount = subtotal > totalPaid ? (subtotal - totalPaid).toFixed(2) : "0.00";

    // 3. Format the customer name
    const address = order.shipping_address || {};
    const firstName = address.first_name || address.firstName || 'Valued Customer';

    // 4. Fire the email via Resend
    await resend.emails.send({
      from: 'EthoHaiti <sakpase@ethohaiti.com>',
      to: [order.checkout_email],
      subject: `Receipt for Order #${orderId.substring(0,6).toUpperCase()}`,
      react: OrderReceipt({
        orderId: orderId,
        customerName: firstName,
        items: items,
        subtotal: subtotal.toFixed(2),
        discount: discountAmount,
        total: totalPaid.toFixed(2),
        shippingAddress: address,
        date: new Date(order.created_at).toLocaleDateString()
      })
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Receipt API Error:", error);
    return NextResponse.json({ error: "Failed to send receipt." }, { status: 500 });
  }
}