"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlist = create(
  persist(
    (set, get) => ({
      wishlist: [], 

      // Action: Add an item to the wishlist
      addToWishlist: (product) => {
        const currentList = get().wishlist;
        
        // Prevent adding duplicates
        const exists = currentList.find((item) => item.id === product.id);
        
        if (!exists) {
          set({ wishlist: [...currentList, product] });
        }
      },

      // Action: Remove an item
      removeFromWishlist: (productId) => {
        set({ wishlist: get().wishlist.filter((item) => item.id !== productId) });
      },
      
      // Check if an item is currently in the list (useful for turning the heart icon red)
      isInWishlist: (productId) => {
        return get().wishlist.some((item) => item.id === productId);
      },
      
      // Action: Clear the whole list
      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'ethohaiti-wishlist', // The name of the saved data in the browser
    }
  )
);