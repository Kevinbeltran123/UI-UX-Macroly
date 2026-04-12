import type { CartItem, CartTotals } from "@/domain/cart/cart-summary";

export type OrderStatus = "pending" | "paid" | "delivered" | "failed";

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totals: CartTotals;
  status: OrderStatus;
  wompiTransactionId: string | null;
  createdAt: string;
};
