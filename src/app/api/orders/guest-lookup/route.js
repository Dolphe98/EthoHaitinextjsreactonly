import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { orderId, email } = await request.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Initialize Supabase with the SERVICE ROLE KEY to securely bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // YOU MUST ADD THIS TO VERCEL
    );

    // 2. Query the specific order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 3. The Vault Door: Verify the email perfectly matches
    if (order.checkout_email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized. Email does not match this order." }, { status: 403 });
    }

    // 4. Redact the street address before sending it to the browser to prevent scraping
    const safeOrder = {
      ...order,
      shipping_address: {
        city: order.shipping_address?.city || 'City hidden',
        state: order.shipping_address?.state || 'State hidden',
        country: order.shipping_address?.country || 'US',
        is_redacted: true
      }
    };

    return NextResponse.json({ order: safeOrder }, { status: 200 });

  } catch (error) {
    console.error("Guest Lookup Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}