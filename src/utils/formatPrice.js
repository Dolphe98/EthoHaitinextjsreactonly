/**
 * Formats a number or string as a USD currency string.
 * @param {number|string} price - The price to format.
 * @returns {string} - Formatted price, e.g., "$24.99".
 */
export function formatPrice(price) {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericPrice);
}

/**
 * Strips HTML tags from WooCommerce price_html and returns clean text.
 * @param {string} html - The WooCommerce price HTML.
 * @returns {string} - Clean price text.
 */
export function formatPriceFromHTML(html) {
  if (!html) return '';
  
  // Remove all HTML tags and decode common entities
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '-').trim();
}