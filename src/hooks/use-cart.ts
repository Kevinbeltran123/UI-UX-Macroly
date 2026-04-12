"use client";

import { useCartStore } from "@/stores/cart-store";
import { computeProgress, findOverages } from "@/domain/cart/cart-summary";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";
import { DEFAULT_GOALS } from "@/domain/nutrition/macro-goals";

/**
 * Convenience hook that combines cart state with macro progress.
 */
export const useCart = (goals: MacroGoals = DEFAULT_GOALS) => {
  const { items, totals, add, remove, clear, loadItems } = useCartStore();
  const progress = computeProgress(totals, goals);
  const overages = findOverages(totals, goals);

  return { items, totals, progress, overages, add, remove, clear, loadItems, goals };
};
