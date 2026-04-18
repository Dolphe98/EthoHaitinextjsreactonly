"use server";

import { cache } from 'react';

// ============================================================================
// THE PRINTIFY ENGINE v5.0 (Bulletproof Apostrophes & Unique Slugs)
// ============================================================================

const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_TOKEN = process.env.PRINTIFY_API_TOKEN;
const PRINTIFY_URL = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?limit=99`;

const HEADERS = {
  'Authorization': `Bearer ${PRINTIFY_TOKEN}`,
  'Content-Type': 'application/json'
};

// THE STRICT DICTIONARY
const MAIN_CATEGORIES = [
  "men's clothing", "women's clothing", "accessories", "collection"
];

// Helper to make URLs clean (e.g. "Men's Clothing" -> "mens-clothing")
const slugify = (text) => {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/&#8217;|&#39;|['"]/g, '') // Remove apostrophes entirely first
    .replace(/[^a-z0-9]+/g, '-')       // Turn spaces/symbols into dashes
    .replace(/(^-|-$)+/g, '');         // Trim dashes from ends
};

function capitalize(str) {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Helper to fix weird apostrophes from Printify's text editor
function decodeHtml(html) {
  if (!html) return "";
  return html
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&");
}

// ----------------------------------------------------------------------------
// THE TRANSLATOR
// ----------------------------------------------------------------------------
function translateToWooCommerce(p) {
  const activeVariants = p.variants || [];
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

  // ==========================================================================
  // THE SNIPER v2: Bulletproof Apostrophe & HTML handling
  // ==========================================================================
  let rawDesc = p.description || "";
  let decodedDesc = decodeHtml(rawDesc);
  let pTags = [];

  const catRegex = /Categories:\s*([^<\n]+)/i; 
  const match = decodedDesc.match(catRegex);

  if (match && match[1]) {
      // 1. Extract the categories
      pTags = match[1].split(',').map(s => s.trim().toLowerCase());
      
      // 2. SNIPER: Delete the secret text from the description!
      rawDesc = rawDesc.replace(/<p>[^<]*Categories:\s*[^<]*<\/p>/gi, ''); 
      rawDesc = rawDesc.replace(/Categories:\s*([^<\n]+)/gi, ''); 
  }

  // Build the Parent/Child relationship
  let parents = pTags.filter(t => MAIN_CATEGORIES.includes(t));
  if (parents.length === 0) {
    parents = ['collection']; 
    pTags.push('collection'); 
  }

  const categories = [];
  const parentSlugs = parents.map(p => slugify(p));
  
  // Add Base Parent Slugs
  parentSlugs.forEach(ps => categories.push({ slug: ps }));
  
  // Add COMPOUNDED SLUGS (This keeps Men and Women separate!)
  pTags.forEach(tag => {
      if(tag && !MAIN_CATEGORIES.includes(tag)) {
          const subSlug = slugify(tag);
          categories.push({ slug: subSlug });
          parentSlugs.forEach(ps => categories.push({ slug: `${ps}-${subSlug}` }));
      }
  });

  return {
    id: p.id,
    name: decodeHtml(p.title) || "Unnamed Product",
    slug: p.title ? slugify(p.title) : `product-${p.id}`,
    description: rawDesc.trim(), 
    short_description: rawDesc ? rawDesc.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..." : "",
    price: lowestPrice,
    price_html: formattedPrice,
    images: (p.images || []).map(img => ({ src: img.src })),
    attributes: attributes,
    variations: variations,
    categories: categories,
    raw_tags: pTags
  };
}

export async function fetchAllProducts() {
  if (!PRINTIFY_SHOP_ID || !PRINTIFY_TOKEN) return [];

  try {
    const res = await fetch(PRINTIFY_URL, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`Printify API Error`);
    
    const data = await res.json();
    const allProducts = data.data || [];
    
    // MANAGER FIX: We removed the 'is_enabled' check so unpublished Printify products still show up!
    const activeProducts = allProducts.filter(p => p.variants && p.variants.length > 0);
    return activeProducts.map(translateToWooCommerce);
  } catch (error) {
    return [];
  }
}

export async function fetchProductBySlug(slug) {
  const products = await fetchAllProducts();
  return products.filter(p => p.slug === slug);
}

export async function fetchProductsByCategory(categorySlug) {
  const products = await fetchAllProducts();
  return products.filter(p => p.categories.some(c => c.slug === categorySlug));
}

export async function fetchAllCategories() {
  const products = await fetchAllProducts();
  
  const parentsMap = new Map();
  const subsMap = new Map();
  let idCounter = 1;

  products.forEach(p => {
    const productParents = p.raw_tags.filter(t => MAIN_CATEGORIES.includes(t));
    const productSubs = p.raw_tags.filter(t => !MAIN_CATEGORIES.includes(t));

    let currentParents = productParents.length > 0 ? productParents : ['collection'];

    currentParents.forEach(parentName => {
       const parentSlug = slugify(parentName);
       
       if (!parentsMap.has(parentName)) {
           parentsMap.set(parentName, { 
             id: idCounter++, 
             name: capitalize(parentName), 
             slug: parentSlug, 
             parent: 0, 
             count: 0 
           });
       }
       parentsMap.get(parentName).count++;

       const parentId = parentsMap.get(parentName).id;

       productSubs.forEach(subName => {
          const subSlug = slugify(subName);
          const subKey = `${parentId}-${subName}`;
          
          if (!subsMap.has(subKey)) {
              subsMap.set(subKey, { 
                id: idCounter++, 
                name: capitalize(subName), 
                slug: `${parentSlug}-${subSlug}`, // UNIQUE COMPOUND SLUG!
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