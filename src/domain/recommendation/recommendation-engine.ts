import type { Product } from "@/domain/catalog/product";
import type { CartTotals } from "@/domain/cart/cart-summary";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";

export type RecommendedProduct = Product & {
  reason: string;
  score: number;
};

type Macro = "protein" | "carbs" | "fat";

const REASON_BY_MACRO: Record<Macro, string> = {
  protein: "Te falta proteina",
  carbs: "Completa tus carbos",
  fat: "Anade grasas saludables",
};

/**
 * Compute the gap between current cart and goals as a fraction (0..1).
 * 0 = goal met, 1 = nothing eaten yet.
 */
const computeGap = (current: number, goal: number): number => {
  if (goal <= 0) return 0;
  return Math.max(0, Math.min(1, (goal - current) / goal));
};

/**
 * Find the macro with the largest gap. Returns the macro name + gap value.
 */
const findBiggestGap = (totals: CartTotals, goals: MacroGoals): { macro: Macro; gap: number } => {
  const gaps: Array<{ macro: Macro; gap: number }> = [
    { macro: "protein", gap: computeGap(totals.protein, goals.protein) },
    { macro: "carbs", gap: computeGap(totals.carbs, goals.carbs) },
    { macro: "fat", gap: computeGap(totals.fat, goals.fat) },
  ];
  return gaps.reduce((max, g) => (g.gap > max.gap ? g : max));
};

/**
 * Score a product by how well it fills the dominant gap.
 * Higher score = better recommendation.
 *
 * Strategy: weight each macro by its remaining gap, multiply by the product's contribution.
 * This favors products that target the macro the user needs most.
 */
const scoreProduct = (product: Product, totals: CartTotals, goals: MacroGoals): number => {
  const proteinGap = computeGap(totals.protein, goals.protein);
  const carbsGap = computeGap(totals.carbs, goals.carbs);
  const fatGap = computeGap(totals.fat, goals.fat);

  return product.protein * proteinGap + product.carbs * carbsGap + product.fat * fatGap;
};

/**
 * Recommend top N products to fill macro gaps.
 *
 * If cart is empty, recommends balanced products (highest combined macros).
 * If cart has items, scores products by how well they fill the biggest macro gap.
 *
 * Migrated from prototipo `getRecommendations(cart, goals)`.
 */
export const recommend = (
  products: readonly Product[],
  totals: CartTotals,
  goals: MacroGoals,
  limit = 6,
): RecommendedProduct[] => {
  const dominant = findBiggestGap(totals, goals);
  const reason = dominant.gap > 0.1 ? REASON_BY_MACRO[dominant.macro] : "Recomendado para ti";

  return [...products]
    .map((p) => ({
      ...p,
      reason,
      score: scoreProduct(p, totals, goals),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
