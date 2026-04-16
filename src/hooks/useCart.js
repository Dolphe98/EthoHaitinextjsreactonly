"use client";

import { useCartStore } from '@/store/cartStore';

export function useCart() {
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // Calculate total number of items in the cart
  const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  // Calculate total price by parsing the value safely
  const totalPrice = cart.reduce((total, item) => {
    let itemPrice = Number(item.price);
    
    if (isNaN(itemPrice) || itemPrice === 0) {
      if (item.price_html) {
        // Strip HTML tags and isolate the numeric value (e.g., "$24.99" -> 24.99)
        const cleanText = item.price_html.replace(/<[^>]*>?/gm, '');
        const numericMatch = cleanText.match(/[\d.]+/);
        itemPrice = numericMatch ? Number(numericMatch[0]) : 0;
      } else {
        itemPrice = 0;
      }
    }
    return total + (itemPrice * (item.quantity || 1));
  }, 0);

  return {
    cart,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity
  };
}