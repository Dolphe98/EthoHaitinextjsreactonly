import { createOrder } from '../lib/woocommerce';

export function formatOrderPayload(cartItems, customerData) {
  const line_items = cartItems.map(item => ({
    product_id: item.id,
    variation_id: item.variation_id || undefined,
    quantity: item.quantity || 1
  }));

  return {
    payment_method: customerData.payment_method || 'bacs',
    payment_method_title: customerData.payment_method_title || 'Direct Bank Transfer',
    set_paid: false,
    billing: {
      first_name: customerData.firstName || '',
      last_name: customerData.lastName || '',
      address_1: customerData.address1 || '',
      address_2: customerData.address2 || '',
      city: customerData.city || '',
      state: customerData.state || '',
      postcode: customerData.postcode || '',
      country: customerData.country || 'US',
      email: customerData.email || '',
      phone: customerData.phone || ''
    },
    shipping: {
      first_name: customerData.firstName || '',
      last_name: customerData.lastName || '',
      address_1: customerData.address1 || '',
      address_2: customerData.address2 || '',
      city: customerData.city || '',
      state: customerData.state || '',
      postcode: customerData.postcode || '',
      country: customerData.country || 'US'
    },
    line_items: line_items
  };
}

export async function createWooOrder(cartItems, customerData) {
  const payload = formatOrderPayload(cartItems, customerData);
  return createOrder(payload);
}