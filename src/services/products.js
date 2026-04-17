"use server";

import { cache } from 'react';

// ============================================================================
// THE PRINTIFY ENGINE (Pure URL Fix)
// ============================================================================

const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_TOKEN = process.env.PRINTIFY_API_TOKEN;

// REMOVED query parameters. Purest endpoint possible.
const PRINTIFY_URL = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`;

const HEADERS = {
  'Authorization': `Bearer ${PRINTIFY_TOKEN}`,
  'Content-Type': 'application/json'
};

const MAIN_CATEGORIES = ['men', 'women', 'unisex', 'kids', 'accessories', 'home', 'collection'];

function capitalize(str) {
  return str && typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ----------------------------------------------------------------------------
// THE TRANSLATOR
// ----------------------------------------------------------------------------
function translateToWooCommerce(p) {
  const activeVariants = p.variants ? p.variants.filter(v => v.is_enabled) : [];
  const lowestPrice = activeVariants.length > 0 
    ? Math.min(...activeVariants.map(v => v.price)) / 100 
    : 0;

  const formattedPrice = `$${lowestPrice.toFixed(2)}`;

  const attributes = (p.options || []).map(opt => ({
    name: opt.name,
    options: (opt.values || []).map(val => val.title),
    terms: (opt.values || []).map(val => ({ name: val.title }))
  }));

  const variations = activeVariants.map(variant => {
    const varAttributes = (variant.options || []).map(optId => {
      let attrName = "";
      let attrValue = "";
      (p.options || []).forEach(opt => {
        const foundVal = (opt.values || []).find(v => v.id === optId);
        if (foundVal) {
          attrName = opt.name;
          attrValue = foundVal.title;
        }
      });
      return { name: attrName, option: attrValue, value: attrValue };
    });

    const varImage = (p.images || []).find(img => (img.variant_ids || []).includes(variant.id));

    return {
      id: variant.id,
      price: variant.price / 100,
      price_html: `$${(variant.price / 100).toFixed(2)}`,
      attributes: varAttributes,
      image: varImage ? { src: varImage.src } : null
    };
  });

  const pTags = (p.tags || []).map(t => typeof t === 'string' ? t.toLowerCase().trim() : '');
  let parents = pTags.filter(t => MAIN_CATEGORIES.includes(t));
  if (parents.length === 0) parents = ['collection']; 

  const categories = [];
  pTags.forEach(tag => {
      if(tag) categories.push({ slug: tag.replace(/\s+/g, '-') });
  });
  parents.forEach(parent => {
      if(parent) categories.push({ slug: parent.replace(/\s+/g, '-') });
  });

  return {
    id: p.id,
    name: p.title || "Unnamed Product",
    slug: p.title ? p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `product-${p.id}`,
    description: p.description || "",
    short_description: p.description ? p.description.substring(0, 150) + "..." : "",
    price: lowestPrice,
    price_html: formattedPrice,
    images: (p.images || []).map(img => ({ src: img.src })),
    attributes: attributes,
    variations: variations,
    categories: categories,
    raw_tags: pTags
  };
}

// ----------------------------------------------------------------------------
// THE API FETCH
// ----------------------------------------------------------------------------
export const fetchAllProducts = cache(async () => {
  if (!PRINTIFY_SHOP_ID || !PRINTIFY_TOKEN) {
    console.error("Missing Printify Keys!");
    return [];
  }

  // LOGGING THE URL: This will tell us if PRINTIFY_SHOP_ID is undefined in Vercel
  console.log("Attempting to fetch from:", PRINTIFY_URL);

  try {
    const res = await fetch(PRINTIFY_URL, { headers: HEADERS, cache: 'no-store' });
    
    if (!res.ok) {
       // Deep error logging
       const errText = await res.text();
       console.error(`Printify API Error details: Status ${res.status}, Message: ${errText}`);
       throw new Error(`Printify API Error: ${res.status}`);
    }
    
    const data = await res.json();
    const allProducts = data.data || [];
    
    return allProducts.map(translateToWooCommerce);
  } catch (error) {
    console.error("Fetch function failed:", error);
    return [];
  }
});

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
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