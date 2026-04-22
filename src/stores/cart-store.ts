"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/domain/catalog/product";
import type { CartItem, CartTotals } from "@/domain/cart/cart-summary";
import { addToCart, removeFromCart, clearCart } from "@/domain/cart/cart-operations";
import { computeCartTotals } from "@/domain/cart/cart-summary";

type CartState = {
  items: CartItem[];
  totals: CartTotals;
  purchaseDays: number;       // D-06, PERIOD-07
  lastUpdated: string;        // FIX-01
  add: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
  loadItems: (items: CartItem[]) => void;
  setPurchaseDays: (days: number) => void;   // D-06, security T-1-01
  setLastUpdated: (date: string) => void;    // FIX-01
};

const recalc = (items: CartItem[]) => ({
  items,
  totals: computeCartTotals(items),
});

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totals: computeCartTotals([]),
      purchaseDays: 1,                         // D-04: default is 1 day
      lastUpdated: new Date().toDateString(),  // FIX-01: tracks the cart's creation date
      add: (product) => set((state) => recalc(addToCart(state.items, product))),
      remove: (productId) => set((state) => recalc(removeFromCart(state.items, productId))),
      clear: () => set(recalc(clearCart())),   // D-11: does NOT reset purchaseDays
      loadItems: (items) => set(recalc(items)),
      setPurchaseDays: (days) => {
        // T-1-01: allowlist validation — reject values outside [1,2,3,5,7]
        const VALID_DAYS = [1, 2, 3, 5, 7] as const;
        if (!VALID_DAYS.includes(days as typeof VALID_DAYS[number])) return;
        set({ purchaseDays: days });
      },
      setLastUpdated: (date) => set({ lastUpdated: date }),
    }),
    {
      name: "macroly-cart",
      onRehydrateStorage: () => (state, error) => {
        // FIX-01: TTL check — clear cart if day has changed
        // Source: RESEARCH.md Pattern 1; Zustand v5 docs (Context7 verified)
        // CRITICAL: outer fn receives pre-hydration state; inner callback receives post-hydration state
        if (error || !state) return;
        // T-1-03: re-validate purchaseDays from localStorage through allowlist
        state.setPurchaseDays(state.purchaseDays);
        const today = new Date().toDateString();
        if (state.lastUpdated !== today) {
          state.clear();              // D-11: clear() does NOT reset purchaseDays
          state.setLastUpdated(today);
        }
      },
    },
  ),
);
