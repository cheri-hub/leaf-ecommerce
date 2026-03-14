"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (productId: string) => {
        set((state) => {
          if (state.items.includes(productId)) {
            return { items: state.items.filter((id) => id !== productId) };
          }
          return { items: [...state.items, productId] };
        });
      },

      has: (productId: string) => get().items.includes(productId),

      clear: () => set({ items: [] }),
    }),
    {
      name: "leaf-wishlist",
    },
  ),
);
