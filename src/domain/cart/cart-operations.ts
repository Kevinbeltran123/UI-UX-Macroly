import type { Product } from "@/domain/catalog/product";
import type { CartItem } from "./cart-summary";

/**
 * Add a product to cart, incrementing qty if it already exists.
 * Migrated from prototipo `addToCart()`.
 */
export const addToCart = (items: readonly CartItem[], product: Product): CartItem[] => {
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    return items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
  }
  return [...items, { ...product, qty: 1 }];
};

/**
 * Remove one unit of a product. If qty drops to 0, remove the item entirely.
 * Migrated from prototipo `rmFromCart()`.
 */
export const removeFromCart = (items: readonly CartItem[], productId: string): CartItem[] => {
  const item = items.find((i) => i.id === productId);
  if (!item) return [...items];
  if (item.qty > 1) {
    return items.map((i) => (i.id === productId ? { ...i, qty: i.qty - 1 } : i));
  }
  return items.filter((i) => i.id !== productId);
};

/**
 * Set the quantity of an item directly. qty <= 0 removes it.
 */
export const updateQuantity = (
  items: readonly CartItem[],
  productId: string,
  qty: number,
): CartItem[] => {
  if (qty <= 0) return items.filter((i) => i.id !== productId);
  return items.map((i) => (i.id === productId ? { ...i, qty } : i));
};

export const clearCart = (): CartItem[] => [];
