import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { fetchAllProducts } from '@/services/products';

export async function POST(request) {
  try {
    // 1. Basic Security: Ensure only YOU can trigger this sync
    const body = await request.json();
    if (body.secret !== 'ethohaiti-sync-2024') {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    console.log("Starting Catalog Sync from Printify to Supabase...");

    // 2. Fetch the massive catalog from Printify using your existing engine
    const printifyProducts = await fetchAllProducts();

    if (!printifyProducts || printifyProducts.length === 0) {
      return NextResponse.json({ error: 'No products returned from Printify.' }, { status: 400 });
    }

    // 3. Format the data to match our Supabase columns perfectly
    const formattedProducts = printifyProducts.map(product => ({
      id: product.id,
      title: product.name || product.title,
      slug: product.slug || product.id,
      description: product.description || '',
      price: parseFloat(product.price) || 0,
      price_html: product.price_html || '',
      images: product.images || [],
      categories: product.categories || [],
      variants: product.variants || [],
      options: product.options || [],
      visible: product.visible !== false // Default to true unless explicitly hidden
    }));

    // 4. Initialize Supabase
    const supabase = createClient();

    // 5. Upsert (Insert or Update) the data into Supabase
    // 'onConflict: id' means if the product already exists, it will UPDATE it instead of duplicating it!
    const { data, error } = await supabase
      .from('products')
      .upsert(formattedProducts, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Database Error:", error);
      throw error;
    }

    console.log(`Successfully synced ${formattedProducts.length} products!`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${formattedProducts.length} products to Supabase!`,
      count: formattedProducts.length
    });

  } catch (error) {
    console.error('Catalog Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}