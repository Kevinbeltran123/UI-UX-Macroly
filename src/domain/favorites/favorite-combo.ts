import type { CartItem, CartTotals } from "@/domain/cart/cart-summary";

export type FavoriteCombo = {
  id: string;
  userId: string;
  name: string;
  items: CartItem[];
  totals: CartTotals;
  createdAt: string;
};

/**
 * Auto-generated combo name when the user does not specify one.
 * Pattern: "Combo #N" where N is the next sequential number.
 */
export const nextComboName = (existing: readonly FavoriteCombo[]): string =>
  `Combo #${existing.length + 1}`;
