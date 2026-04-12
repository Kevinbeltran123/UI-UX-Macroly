import type { Product } from "@/domain/catalog/product";
import type { CartItem } from "./cart-summary";

export const addToCart = (items: readonly CartItem[], product: Product): CartItem[] => {
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    return items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
  }
  return [...items, { ...product, qty: 1 }];
};

export const removeFromCart = (items: readonly CartItem[], productId: string): CartItem[] => {
  const item = items.find((i) => i.id === productId);
  if (!item) return [...items];
  if (item.qty > 1) {
    return items.map((i) => (i.id === productId ? { ...i, qty: i.qty - 1 } : i));
  }
  return items.filter((i) => i.id !== productId);
};

export const clearCart = (): CartItem[] => [];
