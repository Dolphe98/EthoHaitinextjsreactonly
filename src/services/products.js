"use server";

// ============================================================================
// THE PRINTIFY ENGINE v9.0 (Parallel Fetching & Static Generation Ready)
// ============================================================================

const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_TOKEN = process.env.PRINTIFY_API_TOKEN;

const HEADERS = {
  'Authorization': `Bearer ${PRINTIFY_TOKEN}`,
  'Content-Type': 'application/json'
};

const MAIN_CATEGORIES = [
  "men's clothing", "women's clothing", "accessories", "collection"
];

const slugify = (text) => {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/&#8217;|&#39;|['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

function capitalize(str) {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function decodeHtml(html) {
  if (!html) return "";
  return html
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&");
}

function translateToWooCommerce(p) {
  const activeVariants = (p.variants || []).filter(variant => variant.is_enabled);
  const lowestPrice = activeVariants.length > 0 
    ? Math.min(...activeVariants.map(v => v.price)) / 100 
    : 0;

  const formattedPrice = `$${lowestPrice.toFixed(2)}`;

  // 1. Gather every option ID that is ACTUALLY used by an active variant
  const activeOptionIds = new Set();
  activeVariants.forEach(variant => {
    (variant.options || []).forEach(optId => activeOptionIds.add(optId));
  });

  // 2. Filter the massive Printify blueprint list against our active options
  const attributes = (p.options || [])
    .map(opt => {
      // Keep only the values (colors/sizes) that exist in our Set
      const validValues = (opt.values || []).filter(val => activeOptionIds.has(val.id));

      return {
        name: opt.name,
        options: validValues.map(val => val.title),
        terms: validValues.map(val => ({ name: val.title }))
      };
    })
    // 3. Clean up: Remove the attribute entirely if no active values exist
    .filter(attr => attr.options.length > 0);

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

  let rawDesc = p.description || "";
  let decodedDesc = decodeHtml(rawDesc);
  let pTags = [];

  const catRegex = /Categories:\s*([^<\n]+)/i; 
  const match = decodedDesc.match(catRegex);

  if (match && match[1]) {
      pTags = match[1].split(',').map(s => s.trim().toLowerCase());
      rawDesc = rawDesc.replace(/<p>[^<]*Categories:\s*[^<]*<\/p>/gi, ''); 
      rawDesc = rawDesc.replace(/Categories:\s*([^<\n]+)/gi, ''); 
  }

  let parents = pTags.filter(t => MAIN_CATEGORIES.includes(t));
  if (parents.length === 0) {
    parents = ['collection']; 
    pTags.push('collection'); 
  }

  const categories = [];
  const parentSlugs = parents.map(p => slugify(p));
  
  parentSlugs.forEach(ps => categories.push({ slug: ps }));
  
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
    // MANAGER FIX: Keep the variant_ids so we can filter by color!
    images: (p.images || []).map(img => ({ src: img.src, variant_ids: img.variant_ids || [] })),
    attributes: attributes,
    variations: variations,
    categories: categories,
    raw_tags: pTags
  };
}

export async function fetchAllProducts() {
  if (!PRINTIFY_SHOP_ID || !PRINTIFY_TOKEN) return [];

  try {
    const firstPageUrl = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50&page=1`;
    const firstRes = await fetch(firstPageUrl, { 
      headers: HEADERS, 
      next: { revalidate: 3600 } 
    });
    
    if (!firstRes.ok) throw new Error(`Printify API Error: ${firstRes.status}`);
    
    const firstData = await firstRes.json();
    let allProducts = firstData.data || [];
    const lastPage = firstData.last_page || 1;

    if (lastPage > 1) {
      const fetchPromises = [];
      for (let i = 2; i <= lastPage; i++) {
        const url = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50&page=${i}`;
        fetchPromises.push(
          fetch(url, { headers: HEADERS, next: { revalidate: 3600 } })
            .then(res => res.json())
            .then(data => data.data || [])
        );
      }
      const remainingPagesData = await Promise.all(fetchPromises);
      remainingPagesData.forEach(pageProducts => {
        allProducts = [...allProducts, ...pageProducts];
      });
    }
    
    const activeProducts = allProducts.filter(p => p.variants && p.variants.length > 0);
    return activeProducts.map(translateToWooCommerce);
    
  } catch (error) {
    console.error("Fetch failed:", error);
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
                slug: `${parentSlug}-${subSlug}`,
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