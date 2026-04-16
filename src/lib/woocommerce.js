export const WOO_BASE = "https://backend.ethohaiti.com/wp-json/wc/store/v1";
export const WOO_REST_BASE = "https://backend.ethohaiti.com/wp-json/wc/v3";

export async function wooFetch(endpoint) {
  const res = await fetch(`${WOO_BASE}${endpoint}`, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error(`WooCommerce API Error: ${res.statusText}`);
  }
  return res.json();
}

export async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/products?${query}` : '/products';
  return wooFetch(endpoint);
}

export async function getCategories(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/products/categories?${query}` : '/products/categories';
  return wooFetch(endpoint);
}

export async function getProduct(slug) {
  const products = await getProducts({ slug });
  return products.length > 0 ? products[0] : null;
}

export async function createOrder(orderData) {
  const res = await fetch(`${WOO_REST_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error(`WooCommerce Order Error: ${res.statusText}`);
  }
  return res.json();
}