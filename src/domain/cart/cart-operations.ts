import type { Product } from "@/domain/catalog/product";
import type { CartItem } from "./cart-summary";

/**
 * Add a product to cart with a given portion (0.25, 0.5, 0.75, 1).
 * Items with the same product ID but different portions are separate entries.
 */
export const addToCart = (
  items: readonly CartItem[],
  product: Product,
  portion = 1,
): CartItem[] => {
  const existing = items.find((i) => i.id === product.id && i.portion === portion);
  if (existing) {
    return items.map((i) =>
      i.id === product.id && i.portion === portion ? { ...i, qty: i.qty + 1 } : i,
    );
  }
  return [...items, { ...product, qty: 1, portion }];
};

/**
 * Remove one unit of a product+portion combo. If qty drops to 0, remove entirely.
 */
export const removeFromCart = (
  items: readonly CartItem[],
  productId: string,
  portion?: number,
): CartItem[] => {
  const item = items.find(
    (i) => i.id === productId && (portion === undefined || i.portion === portion),
  );
  if (!item) return [...items];
  if (item.qty > 1) {
    return items.map((i) =>
      i.id === productId && i.portion === item.portion ? { ...i, qty: i.qty - 1 } : i,
    );
  }
  return items.filter((i) => !(i.id === productId && i.portion === item.portion));
};

export const clearCart = (): CartItem[] => [];

/**
 * Human-readable portion label.
 */
export const portionLabel = (portion: number): string => {
  if (portion === 1) return "";
  if (portion === 0.75) return "3/4";
  if (portion === 0.5) return "1/2";
  if (portion === 0.25) return "1/4";
  return `${Math.round(portion * 100)}%`;
};
