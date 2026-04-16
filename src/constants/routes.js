export const ROUTES = {
  HOME: "/",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ACCOUNT: "/account",
  SEARCH: "/search",
  category: (slug) => `/category/${slug}`,
  product: (slug) => `/product/${slug}`,
  order: (id) => `/orders/${id}`
};