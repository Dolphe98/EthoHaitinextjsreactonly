import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_TOKEN = process.env.PRINTIFY_API_TOKEN;

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.secret !== 'ethohaiti-sync-2024') {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    let allProducts = [];
    let currentPage = 1;
    let lastPage = 1;

    // 1. Fetch RAW data directly from Printify
    do {
      const url = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50&page=${currentPage}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${PRINTIFY_TOKEN}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      allProducts = [...allProducts, ...(data.data || [])];
      lastPage = data.last_page || 1;
      currentPage++;
    } while (currentPage <= lastPage);

    // 2. Format it to perfectly match our Supabase Columns
    const formattedProducts = allProducts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.id, 
      description: p.description,
      price: p.variants?.[0]?.price || 0,
      price_html: '',
      images: p.images || [],
      categories: p.tags || [], // We save the raw tags into the categories column
      variants: p.variants || [],
      options: p.options || [],
      visible: p.visible !== false
    }));

    // 3. Save to Supabase
    const supabase = createClient();
    const { error } = await supabase.from('products').upsert(formattedProducts, { onConflict: 'id' });
    if (error) throw error;

    return NextResponse.json({ success: true, count: formattedProducts.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}