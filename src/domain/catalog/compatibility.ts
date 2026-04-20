import type { Product } from "./product";
import type { CartTotals } from "@/domain/cart/cart-summary";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";

export type Compatibility = "fits" | "tight" | "exceeds";

/**
 * Check if adding a product would exceed any macro goal.
 * - "fits": all macros stay within goals
 * - "tight": within goals but one macro goes above 90%
 * - "exceeds": at least one macro goes over the goal
 */
export const checkCompatibility = (
  product: Product,
  totals: CartTotals,
  goals: MacroGoals,
): Compatibility => {
  const newP = totals.protein + product.protein;
  const newC = totals.carbs + product.carbs;
  const newF = totals.fat + product.fat;

  if (newP > goals.protein || newC > goals.carbs || newF > goals.fat) return "exceeds";
  if (newP > goals.protein * 0.9 || newC > goals.carbs * 0.9 || newF > goals.fat * 0.9) return "tight";
  return "fits";
};

/**
 * Which specific macros would be exceeded by adding this product.
 */
export const exceededMacros = (
  product: Product,
  totals: CartTotals,
  goals: MacroGoals,
): string[] => {
  const exceeded: string[] = [];
  if (totals.protein + product.protein > goals.protein) exceeded.push("proteína");
  if (totals.carbs + product.carbs > goals.carbs) exceeded.push("carbos");
  if (totals.fat + product.fat > goals.fat) exceeded.push("grasas");
  return exceeded;
};

/**
 * Find products that cover the same primary macro but don't exceed the limiting macro.
 * Example: user needs carbs but fat is near limit → suggest carb products with low fat.
 */
export const findAlternatives = (
  targetProduct: Product,
  allProducts: readonly Product[],
  totals: CartTotals,
  goals: MacroGoals,
  limit = 3,
): Product[] => {
  const dominated = dominantMacro(targetProduct);

  return allProducts
    .filter((p) => p.id !== targetProduct.id)
    .filter((p) => dominantMacro(p) === dominated)
    .filter((p) => checkCompatibility(p, totals, goals) !== "exceeds")
    .sort((a, b) => {
      const aVal = macroValue(a, dominated);
      const bVal = macroValue(b, dominated);
      return bVal - aVal;
    })
    .slice(0, limit);
};

type MacroType = "protein" | "carbs" | "fat";

const dominantMacro = (p: Product): MacroType => {
  if (p.protein >= p.carbs && p.protein >= p.fat) return "protein";
  if (p.carbs >= p.protein && p.carbs >= p.fat) return "carbs";
  return "fat";
};

const macroValue = (p: Product, macro: MacroType): number => {
  if (macro === "protein") return p.protein;
  if (macro === "carbs") return p.carbs;
  return p.fat;
};
