import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null, // The JWT Bouncer Token
      user: null,  // User details (email, name, etc.)
      lastActivity: null, // Phase 4: Tracks last interaction timestamp
      
      // Action: Log the user in and start the clock
      login: (token, user) => set({ token, user, lastActivity: Date.now() }),
      
      // Action: Log the user out and clear the clock
      logout: () => set({ token: null, user: null, lastActivity: null }),

      // Action: Update the clock when they interact
      updateActivity: () => set({ lastActivity: Date.now() }),
    }),
    {
      name: 'ethohaiti-auth', // Saves to browser LocalStorage
    }
  )
);