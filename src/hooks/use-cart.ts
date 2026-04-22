"use client";

import { useCartStore } from "@/stores/cart-store";
import { computeProgress, findOverages } from "@/domain/cart/cart-summary";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";
import { DEFAULT_GOALS } from "@/domain/nutrition/macro-goals";

/**
 * Convenience hook that combines cart state with macro progress.
 * Goals are period-scaled: scaledGoals = rawGoals × purchaseDays (D-07).
 * Domain functions (computeProgress, findOverages) stay period-agnostic — they
 * always receive the already-scaled values.
 */
export const useCart = (goals: MacroGoals = DEFAULT_GOALS) => {
  const { items, totals, add, remove, clear, loadItems, purchaseDays } = useCartStore();

  // D-07: period scaling at hook level — NOT inside domain functions
  const scaledGoals: MacroGoals = {
    protein: goals.protein * purchaseDays,
    carbs: goals.carbs * purchaseDays,
    fat: goals.fat * purchaseDays,
    calories: goals.calories * purchaseDays,
  };

  const progress = computeProgress(totals, scaledGoals);
  const overages = findOverages(totals, scaledGoals);

  return { items, totals, progress, overages, add, remove, clear, loadItems, goals: scaledGoals, purchaseDays };
};
