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

    // 3. THE FIX: Format the customer address (Handle the Array bug safely!)
    let rawAddress = order.shipping_address || {};
    if (Array.isArray(rawAddress) && rawAddress.length > 0) {
      rawAddress = rawAddress[0];
    }
    const address = rawAddress;

    const customerName = address.fullName || `${address.first_name || ''} ${address.last_name || ''}`.trim() || 'Valued Customer';
    
    // 4. THE FIX: Safely extract the email so Resend doesn't crash
    const finalEmail = order.checkout_email || address.email;
    if (!finalEmail) {
      console.error("No email address found to send receipt to for order:", orderId);
      return NextResponse.json({ error: "No email address found for this order." }, { status: 400 });
    }

    // 5. Fire the email via Resend
    const { data, error: resendError } = await resend.emails.send({
      from: 'EthoHaiti <sakpase@ethohaiti.com>',
      to: [finalEmail],
      subject: `Receipt for Order #${orderId.substring(0,8).toUpperCase()}`,
      react: OrderReceipt({
        orderId: `Order #${orderId.substring(0, 8).toUpperCase()}`,
        paymentMethod: order.payment_method_title || order.payment_method || "Online Payment",
        customerName: customerName,
        items: items,
        subtotal: subtotal.toFixed(2),
        shipping: "0.00", 
        taxes: "0.00",
        discount: discountAmount,
        total: totalPaid.toFixed(2),
        shippingAddress: address, // Now it is safely an object, not an array
        date: new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      })
    });

    // If Resend kicks back an error (like an unverified domain), throw it so we can log it
    if (resendError) {
      throw resendError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Receipt API Error:", error);
    return NextResponse.json({ error: "Failed to send receipt." }, { status: 500 });
  }
}