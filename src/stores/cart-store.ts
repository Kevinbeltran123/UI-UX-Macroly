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

  add: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
  loadItems: (items: CartItem[]) => void;
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

      add: (product) =>
        set((state) => recalc(addToCart(state.items, product))),

      remove: (productId) =>
        set((state) => recalc(removeFromCart(state.items, productId))),

      clear: () => set(recalc(clearCart())),

      loadItems: (items) => set(recalc(items)),
    }),
    { name: "macroly-cart" },
  ),
);
