import type { Product } from "@/domain/catalog/product";
import type { CartTotals } from "@/domain/cart/cart-summary";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";

export type RecommendedProduct = Product & {
  reason: string;
  score: number;
};

type Macro = "protein" | "carbs" | "fat";

const REASON_BY_MACRO: Record<Macro, string> = {
  protein: "Te falta proteína",
  carbs: "Completa tus carbos",
  fat: "Añade grasas saludables",
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
 * Pre-filters by dietary restrictions before scoring — hard exclusion for allergen safety.
 *
 * Signature is additive: Phase 3 appends maxBudget?, Phase 4 appends mealContext?
 * Migrated from prototipo `getRecommendations(cart, goals)`.
 */
export const recommend = (
  products: readonly Product[],
  totals: CartTotals,
  goals: MacroGoals,
  limit = 6,
  restrictions: string[] = [], // Phase 2 (DIET-08) — defaults [] for backward compat
  maxBudget?: number,           // Phase 3 (PRICE-03) — undefined = budget mode off (D-09)
): RecommendedProduct[] => {
  // Step 1: Dietary restrictions pre-filter — hard exclusion for allergen safety (DIET-07, unchanged)
  const compatible =
    restrictions.length === 0
      ? products
      : products.filter((p) => restrictions.every((r) => p.dietaryTags.includes(r)));

  // Step 2: Budget hard filter — remove products that don't fit remaining budget (PRICE-03, D-08 step 1)
  // Guard: maxBudget <= 0 is treated as undefined (T-3-02: avoids division by zero in blend formula)
  const budgetActive = maxBudget !== undefined && maxBudget > 0;
  const budgetFiltered = budgetActive
    ? compatible.filter((p) => p.price <= (maxBudget - totals.price))
    : compatible;

  const dominant = findBiggestGap(totals, goals);
  const reason = dominant.gap > 0.1 ? REASON_BY_MACRO[dominant.macro] : "Recomendado para ti";

  // Step 3: Score with optional price-blend (PRICE-04, D-08 step 2)
  // Blend formula: macroScore * (1 - price/remaining) — cheaper products with similar macros rank higher
  // Denominator is remaining budget (not full maxBudget) so scores reflect affordability within what's left
  const remaining = budgetActive ? maxBudget! - totals.price : 0;
  const scored = [...budgetFiltered].map((p) => {
    const macroScore = scoreProduct(p, totals, goals);
    const score = budgetActive
      ? macroScore * (1 - p.price / remaining)  // D-08: remaining > 0 guaranteed by hard filter above
      : macroScore;
    return { ...p, reason, score };
  });

  const sorted = scored.sort((a, b) => b.score - a.score).slice(0, limit);

  // Step 4: Badge top-1 AFTER slice — mutation is the last step (D-10, D-11; anti-Pitfall 4)
  if (budgetActive && sorted.length > 0) {
    sorted[0] = { ...sorted[0], reason: "Mejor relación proteína/precio" };
  }

  return sorted;
};
