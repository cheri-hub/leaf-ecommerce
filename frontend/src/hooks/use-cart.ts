"use client";

import { useCartStore } from "@/stores/cart-store";

export function useCart() {
  return useCartStore();
}
