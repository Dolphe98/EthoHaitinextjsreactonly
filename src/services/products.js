"use server";

// ============================================================================
// THE PRINTIFY ENGINE (Server-Side Only)
// This safely fetches from Printify and translates it into WooCommerce format.
// ============================================================================

const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_TOKEN = process.env.PRINTIFY_API_TOKEN;
const PRINTIFY_URL = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`;

const HEADERS = {
  'Authorization': `Bearer ${PRINTIFY_TOKEN}`,
  'Content-Type': 'application/json'
};

// ----------------------------------------------------------------------------
// THE TRANSLATOR: Converts Printify JSON into WooCommerce JSON
// ----------------------------------------------------------------------------
function translateToWooCommerce(p) {
  // 1. Find the lowest active price
  const activeVariants = p.variants.filter(v => v.is_enabled);
  const lowestPrice = activeVariants.length > 0 
    ? Math.min(...activeVariants.map(v => v.price)) / 100 
    : 0;

  const formattedPrice = `$${lowestPrice.toFixed(2)}`;

  // 2. Map Attributes (Color, Size)
  const attributes = p.options.map(opt => ({
    name: opt.name,
    options: opt.values.map(val => val.title),
    terms: opt.values.map(val => ({ name: val.title })) // Needed for UI mapping
  }));

  // 3. Map Variations (The specific combinations like "Red - Large")
  const variations = activeVariants.map(variant => {
    const varAttributes = variant.options.map(optId => {
      let attrName = "";
      let attrValue = "";
      p.options.forEach(opt => {
        const foundVal = opt.values.find(v => v.id === optId);
        if (foundVal) {
          attrName = opt.name;
          attrValue = foundVal.title;
        }
      });
      return { name: attrName, option: attrValue, value: attrValue };
    });

    // Find the specific image for this variant
    const varImage = p.images.find(img => img.variant_ids.includes(variant.id));

    return {
      id: variant.id, // CRUCIAL: This goes to PayPal and Printify later
      price: variant.price / 100,
      price_html: `$${(variant.price / 100).toFixed(2)}`,
      attributes: varAttributes,
      image: varImage ? { src: varImage.src } : null
    };
  });

  // 4. Map Categories from Printify Tags
  const categories = p.tags.map((tag, index) => ({
    id: index + 100,
    name: tag,
    slug: tag.toLowerCase().replace(/\s+/g, '-'),
    parent: 0
  }));

  // 5. Return the exact structure the UI components expect
  return {
    id: p.id,
    name: p.title,
    slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    description: p.description,
    short_description: p.description.substring(0, 150) + "...",
    price: lowestPrice,
    price_html: formattedPrice,
    images: p.images.map(img => ({ src: img.src })),
    attributes: attributes,
    variations: variations,
    categories: categories,
    raw_tags: p.tags
  };
}

// ----------------------------------------------------------------------------
// API FETCH FUNCTIONS
// ----------------------------------------------------------------------------

export async function fetchAllProducts() {
  if (!PRINTIFY_SHOP_ID || !PRINTIFY_TOKEN) {
    console.error("CRITICAL: Missing Printify Environment Variables.");
    return [];
  }

  try {
    // Revalidate every 60 seconds so price changes update quickly
    const res = await fetch(PRINTIFY_URL, { headers: HEADERS, next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Printify API Error: ${res.status}`);
    
    const data = await res.json();
    
    // Pass the Printify array through our Translator
    return data.data.map(translateToWooCommerce);
  } catch (error) {
    console.error("Error fetching from Printify:", error);
    return [];
  }
}

// Used by product/[slug]/page.js
export async function fetchProductBySlug(slug) {
  const products = await fetchAllProducts();
  return products.filter(p => p.slug === slug);
}

// Used by category/[slug]/page.js
export async function fetchProductsByCategory(categorySlug) {
  const products = await fetchAllProducts();
  return products.filter(p => p.categories.some(c => c.slug === categorySlug));
}

// Used by Header, Footer, and CategoryGrid to build menus
export async function fetchAllCategories() {
  const products = await fetchAllProducts();
  const uniqueTags = new Set();
  
  products.forEach(p => {
    p.raw_tags.forEach(tag => uniqueTags.add(tag));
  });

  const categories = [];
  let idCounter = 1;

  // We make a fake hierarchy so your dropdown menus still work perfectly
  uniqueTags.forEach(tag => {
    categories.push({
      id: idCounter++,
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
      parent: 0,
      count: 1
    });
  });

  return categories;
}

// Used by search/page.jsx
export async function fetchSearchResults(query, limit = 20) {
  const products = await fetchAllProducts();
  const lowerQuery = query.toLowerCase();
  
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) || 
    p.description.toLowerCase().includes(lowerQuery) ||
    p.raw_tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  ).slice(0, limit);
}