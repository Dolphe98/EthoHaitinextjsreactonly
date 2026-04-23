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
                ? { ...item, quantity: item.quantity + (product.quantity || 1) } 
                : item
            ),
          });
        } else {
          // If it's new, add it to the array with quantity 1
          set({ cart: [...cart, { ...product, quantity: product.quantity || 1 }] });
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

      // ==========================================
      // NEW: DEFERRED CONFIGURATION ACTIONS
      // ==========================================

      // 1. Inline Variant Updater (For Cart Dropdowns)
      updateCartItemVariants: (cartItemId, newColor, newSize) => {
        set({
          cart: get().cart.map((item) => {
            if (item.cartItemId === cartItemId) {
              let newVariationId = item.variationId;
              let newImage = item.image;
              let newPriceHtml = item.price_html;
              let newPrice = item.price;
              
              // If the item has the raw product data attached, find the exact new variant!
              if (item.productData && Array.isArray(item.productData.variations)) {
                const matchedVar = item.productData.variations.find(v => {
                  const matchesColor = newColor ? v.attributes.some(a => a.name.toLowerCase().includes('color') && (a.value === newColor || a.option === newColor)) : true;
                  const matchesSize = newSize ? v.attributes.some(a => a.name.toLowerCase().includes('size') && (a.value === newSize || a.option === newSize)) : true;
                  return matchesColor && matchesSize;
                });
                
                if (matchedVar) {
                  newVariationId = matchedVar.id;
                  
                  // Live Image Swap
                  if (matchedVar.image?.src) newImage = matchedVar.image.src;
                  else if (matchedVar.image) newImage = matchedVar.image;
                  
                  // Live Price Update (Crucial for 2XL/3XL pricing differences)
                  if (matchedVar.price_html) newPriceHtml = matchedVar.price_html;
                  if (matchedVar.prices?.price) {
                    newPrice = Number(matchedVar.prices.price) / 100;
                  } else if (matchedVar.price) {
                    newPrice = Number(matchedVar.price);
                  }
                }
              }
              
              return { 
                ...item, 
                selectedColor: newColor || null, 
                selectedSize: newSize || null,
                variationId: newVariationId,
                image: newImage,
                price_html: newPriceHtml,
                price: newPrice
              };
            }
            return item;
          })
        });
      },

      // 2. Duplicate Cart Item (For the "Add another style/size" split button)
      duplicateCartItem: (cartItemId) => {
        const cart = get().cart;
        const itemToClone = cart.find(item => item.cartItemId === cartItemId);
        
        if (itemToClone) {
          // Find the base price and base image to reset the clone
          let basePrice = itemToClone.productData?.price || itemToClone.price;
          let baseImage = itemToClone.productData?.images?.[0]?.src || itemToClone.image;

          if (itemToClone.productData?.prices?.price) {
            basePrice = Number(itemToClone.productData.prices.price) / 100;
          }

          const clonedItem = {
            ...itemToClone,
            cartItemId: `${itemToClone.id}-${Date.now()}`, // Fresh ID so it doesn't stack
            quantity: 1, // Start fresh at 1
            selectedColor: null, // Wipe color to trigger "Action Required"
            selectedSize: null, // Wipe size to trigger "Action Required"
            variationId: null, 
            price: basePrice, 
            image: baseImage 
          };
          
          // Insert the clone right underneath the original item
          const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
          const newCart = [...cart];
          newCart.splice(itemIndex + 1, 0, clonedItem);

          set({ cart: newCart });
        }
      },

      // 3. Overwrite Cart Item (For the Product Page "Edit Mode")
      overwriteCartItem: (cartItemId, updatedItemData) => {
        set({
          cart: get().cart.map((item) =>
            item.cartItemId === cartItemId 
              ? { ...item, ...updatedItemData } // Merge the fully configured data into this slot
              : item
          ),
        });
      },

      // Action: Clear the whole cart (used after successful checkout)
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'ethohaiti-cart', // The name of the saved data in the browser
    }
  )
);