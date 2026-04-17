"use server";

import { cache } from 'react';

// ============================================================================
// THE PRINTIFY ENGINE v2.0 (High Performance & Auto-Categorization)
// ============================================================================

const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_TOKEN = process.env.PRINTIFY_API_TOKEN;

// We force the limit to 100 to get your whole catalog in one single, fast request
const PRINTIFY_URL = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?limit=100`;

const HEADERS = {
  'Authorization': `Bearer ${PRINTIFY_TOKEN}`,
  'Content-Type': 'application/json'
};

// These are your "Parent" categories. Any tag that matches these becomes a Main menu item.
// All other tags on a shirt will automatically become Subcategories under these parents.
const MAIN_CATEGORIES = ['men', 'women', 'unisex', 'kids', 'accessories', 'home', 'collection'];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ----------------------------------------------------------------------------
// THE TRANSLATOR
// ----------------------------------------------------------------------------
function translateToWooCommerce(p) {
  // 1. Find the lowest active price
  const activeVariants = p.variants.filter(v => v.is_enabled);
  const lowestPrice = activeVariants.length > 0 
    ? Math.min(...activeVariants.map(v => v.price)) / 100 
    : 0;

  const formattedPrice = `$${lowestPrice.toFixed(2)}`;

  // 2. Map Attributes
  const attributes = p.options.map(opt => ({
    name: opt.name,
    options: opt.values.map(val => val.title),
    terms: opt.values.map(val => ({ name: val.title }))
  }));

  // 3. Map Variations
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

    const varImage = p.images.find(img => img.variant_ids.includes(variant.id));

    return {
      id: variant.id,
      price: variant.price / 100,
      price_html: `$${(variant.price / 100).toFixed(2)}`,
      attributes: varAttributes,
      image: varImage ? { src: varImage.src } : null
    };
  });

  // 4. Map Categories (Ensure the product responds to both its Parent and Child slugs)
  const pTags = p.tags.map(t => t.toLowerCase().trim());
  let parents = pTags.filter(t => MAIN_CATEGORIES.includes(t));
  if (parents.length === 0) parents = ['collection']; // Fallback if you forgot to tag it Men/Women

  const categories = [];
  pTags.forEach(tag => categories.push({ slug: tag.replace(/\s+/g, '-') }));
  parents.forEach(parent => categories.push({ slug: parent.replace(/\s+/g, '-') }));

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
    raw_tags: pTags
  };
}

// ----------------------------------------------------------------------------
// THE REACT CACHED FETCH (Prevents Computer Freezing!)
// ----------------------------------------------------------------------------
export const fetchAllProducts = cache(async () => {
  if (!PRINTIFY_SHOP_ID || !PRINTIFY_TOKEN) return [];

  try {
    // Next.js will cache this response for 60 seconds
    const res = await fetch(PRINTIFY_URL, { headers: HEADERS, next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Printify API Error: ${res.status}`);
    
    const data = await res.json();
    
    // STRICT FILTER: Only return products that are visible and have active variants!
    const activeProducts = data.data.filter(p => p.visible !== false && p.variants.some(v => v.is_enabled));
    
    return activeProducts.map(translateToWooCommerce);
  } catch (error) {
    console.error("Error fetching from Printify:", error);
    return [];
  }
});

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS (These now run instantly from memory, no extra API calls!)
// ----------------------------------------------------------------------------

export async function fetchProductBySlug(slug) {
  const products = await fetchAllProducts();
  return products.filter(p => p.slug === slug);
}

export async function fetchProductsByCategory(categorySlug) {
  const products = await fetchAllProducts();
  return products.filter(p => p.categories.some(c => c.slug === categorySlug));
}

// ----------------------------------------------------------------------------
// THE SMART CATEGORY BUILDER
// ----------------------------------------------------------------------------
export async function fetchAllCategories() {
  const products = await fetchAllProducts();
  
  const parentsMap = new Map();
  const subsMap = new Map();
  let idCounter = 1;

  products.forEach(p => {
    const productParents = p.raw_tags.filter(t => MAIN_CATEGORIES.includes(t));
    const productSubs = p.raw_tags.filter(t => !MAIN_CATEGORIES.includes(t));

    if (productParents.length === 0) productParents.push('collection');

    // Build the Parent -> Child Hierarchy automatically
    productParents.forEach(parentName => {
       if (!parentsMap.has(parentName)) {
           parentsMap.set(parentName, { 
             id: idCounter++, 
             name: capitalize(parentName), 
             slug: parentName, 
             parent: 0, 
             count: 0 
           });
       }
       parentsMap.get(parentName).count++;

       const parentId = parentsMap.get(parentName).id;

       productSubs.forEach(subName => {
          const subKey = `${parentId}-${subName}`;
          if (!subsMap.has(subKey)) {
              subsMap.set(subKey, { 
                id: idCounter++, 
                name: capitalize(subName), 
                slug: subName.replace(/\s+/g, '-'), 
                parent: parentId, 
                count: 0 
              });
          }
          subsMap.get(subKey).count++;
       });
    });
  });

  return [...Array.from(parentsMap.values()), ...Array.from(subsMap.values())];
}

export async function fetchSearchResults(query, limit = 20) {
  const products = await fetchAllProducts();
  const lowerQuery = query.toLowerCase();
  
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) || 
    p.description.toLowerCase().includes(lowerQuery) ||
    p.raw_tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  ).slice(0, limit);
}