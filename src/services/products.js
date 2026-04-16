import { getProducts, getProduct, getCategories } from '../lib/woocommerce';

export async function fetchProductBySlug(slug) {
  return getProduct(slug);
}

export async function fetchProductsByCategory(categoryId, perPage = 12) {
  return getProducts({ category: categoryId, per_page: perPage });
}

export async function fetchSearchResults(query, perPage = 20) {
  return getProducts({ search: query, per_page: perPage });
}

export async function fetchSimilarProducts(product, count = 3) {
  if (!product || !product.categories || product.categories.length === 0) {
    return [];
  }

  try {
    const currentCatId = product.categories[0].id;
    
    const allCats = await getCategories({ per_page: 100 });
    const currentCat = allCats.find(c => c.id === currentCatId);
    
    const targetCategoryId = (currentCat && currentCat.parent !== 0) ? currentCat.parent : currentCatId;
    
    const simData = await getProducts({ category: targetCategoryId, per_page: 10 });
    
    if (Array.isArray(simData)) {
      const filtered = simData.filter(p => p.id !== product.id);
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }
    return [];
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }
}