import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [], // The array holding all added items

      // Action: Add an item to the cart
      addToCart: (product) => {
        const cart = get().cart;
        
        // Check if the exact item (same ID AND same variation ID) is already in the cart
        const existingItem = cart.find(
          (item) => 
            item.id === product.id && 
            item.variationId === product.variationId && // <-- CRUCIAL FOR PRINTIFY
            item.selectedSize === product.selectedSize && 
            item.selectedColor === product.selectedColor
        );

        if (existingItem) {
          // If it exists, just increase the quantity
          set({
            cart: cart.map((item) =>
              item === existingItem 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            ),
          });
        } else {
          // If it's new, add it to the array with quantity 1
          set({ cart: [...cart, { ...product, quantity: 1 }] });
        }
      },

      // Action: Remove an item completely
      removeFromCart: (cartItemId) => {
        set({ cart: get().cart.filter((item) => item.cartItemId !== cartItemId) });
      },
      
      // Action: Update quantity
      updateQuantity: (cartItemId, newQty) => {
        if (newQty <= 0) {
          get().removeFromCart(cartItemId);
        } else {
          set({
            cart: get().cart.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
            ),
          });
        }
      },

      // Action: Clear the whole cart (used after successful checkout)
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'ethohaiti-cart', // The name of the saved data in the browser
    }
  )
);