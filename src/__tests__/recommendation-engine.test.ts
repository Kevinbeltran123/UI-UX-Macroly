// Tests for src/domain/recommendation/recommendation-engine.ts — PERIOD-06
// VALIDATION.md: task 1-W0-09

import { describe, it, expect } from "vitest";
import { recommend } from "@/domain/recommendation/recommendation-engine";
import type { Product } from "@/domain/catalog/product";
import type { CartTotals } from "@/domain/cart/cart-summary";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";

const makeProduct = (
  id: string,
  protein: number,
  carbs: number,
  fat: number,
  price = 5000,
  dietaryTags: string[] = [],
  mealContext: 'any' | 'breakfast' | 'lunch' | 'dinner' = 'any',
): Product => ({
  id,
  name: `Product ${id}`,
  brand: null,
  weight: null,
  imageUrl: null,
  price,
  protein,
  carbs,
  fat,
  calories: protein * 4 + carbs * 4 + fat * 9,
  categoryId: null,
  rating: null,
  dietaryTags,
  mealContext,
});

const emptyTotals: CartTotals = {
  protein: 0,
  carbs: 0,
  fat: 0,
  calories: 0,
  price: 0,
  itemCount: 0,
};

const standardGoals: MacroGoals = {
  protein: 150,
  carbs: 250,
  fat: 65,
  calories: 2185,
};

describe("recommend() — period-scaled goals (PERIOD-06)", () => {
  it("returns top N products sorted by gap score", () => {
    const p1 = makeProduct("p1", 50, 20, 10);
    const p2 = makeProduct("p2", 10, 5, 2);
    const p3 = makeProduct("p3", 40, 15, 8);
    const result = recommend([p1, p2, p3], emptyTotals, standardGoals, 2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("p1");
    expect(result[1].id).toBe("p3");
  });

  it("with scaled goals (protein=300), partial cart produces different scores than unscaled", () => {
    const high = makeProduct("high", 80, 5, 2);
    const reg = makeProduct("reg", 20, 50, 20);
    // Use a partially-filled cart so gap fractions differ between scaled and unscaled goals
    // Standard protein gap: (150-60)/150 = 0.6  |  Scaled protein gap: (300-60)/300 = 0.8
    const partialCart: CartTotals = { protein: 60, carbs: 0, fat: 0, calories: 240, price: 0, itemCount: 1 };
    const scaledGoals: MacroGoals = { protein: 300, carbs: 500, fat: 130, calories: 4370 };
    const resultScaled = recommend([high, reg], partialCart, scaledGoals, 2);
    const resultUnscaled = recommend([high, reg], partialCart, standardGoals, 2);
    // Gap fractions differ when cart is partially filled → scores genuinely differ
    expect(resultScaled[0].score).not.toBe(resultUnscaled[0].score);
  });

  it("returns empty array when products array is empty", () => {
    expect(recommend([], emptyTotals, standardGoals, 6)).toEqual([]);
  });

  it("includes a reason string in each RecommendedProduct", () => {
    const p = makeProduct("a", 30, 10, 5);
    const result = recommend([p], emptyTotals, standardGoals, 6);
    expect(result[0].reason).toBeDefined();
    expect(typeof result[0].reason).toBe("string");
    expect(result[0].reason.length).toBeGreaterThan(0);
  });

  describe("recommend() — DIET-07/08 restriction filter", () => {
    it("with restrictions=['vegano'], filters out products not tagged vegano", () => {
      const vegano = makeProduct("v", 30, 10, 5, 5000, ["vegano"]);
      const nonVegano = makeProduct("nv", 40, 10, 5, 5000, []);
      const result = recommend([vegano, nonVegano], emptyTotals, standardGoals, 6, ["vegano"]);
      expect(result.map((p) => p.id)).toContain("v");
      expect(result.map((p) => p.id)).not.toContain("nv");
    });

    it("with empty restrictions, returns all products (backward compat — default param)", () => {
      const products = [makeProduct("a", 30, 10, 5), makeProduct("b", 20, 20, 10)];
      expect(recommend(products, emptyTotals, standardGoals, 6, [])).toHaveLength(2);
      expect(recommend(products, emptyTotals, standardGoals, 6)).toHaveLength(2);
    });

    it("with multiple restrictions, only products matching ALL pass", () => {
      const both = makeProduct("both", 30, 10, 5, 5000, ["vegano", "sin_gluten"]);
      const onlyVegano = makeProduct("v", 30, 10, 5, 5000, ["vegano"]);
      const result = recommend([both, onlyVegano], emptyTotals, standardGoals, 6, ["vegano", "sin_gluten"]);
      expect(result.map((p) => p.id)).toEqual(["both"]);
    });

    it("returns empty array when no products match restrictions", () => {
      const nonVegano = makeProduct("nv", 40, 10, 5, 5000, []);
      expect(recommend([nonVegano], emptyTotals, standardGoals, 6, ["vegano"])).toEqual([]);
    });

    it("alto_proteico follows the same uniform exclusion logic as other restrictions", () => {
      const tagged = makeProduct("hp", 40, 5, 2, 5000, ["alto_proteico"]);
      const untagged = makeProduct("reg", 20, 20, 10, 5000, []);
      const result = recommend([tagged, untagged], emptyTotals, standardGoals, 6, ["alto_proteico"]);
      expect(result.map((p) => p.id)).toEqual(["hp"]);
    });
  });

  describe("recommend() — PRICE-03/04/05 budget mode", () => {
    it("hard filter: removes products where price > (maxBudget - totals.price)", () => {
      // maxBudget=100000, totals.price=15000 → remaining=85000
      // p_cheap: price=20000 → 20000 <= 85000 → passes
      // p_expensive: price=90000 → 90000 > 85000 → filtered out
      const p_cheap = makeProduct("cheap", 40, 10, 5, 20000);
      const p_expensive = makeProduct("expensive", 50, 12, 6, 90000);
      const partialCart: CartTotals = { protein: 0, carbs: 0, fat: 0, calories: 0, price: 15000, itemCount: 1 };
      const result = recommend([p_cheap, p_expensive], partialCart, standardGoals, 6, [], 100000);
      expect(result.map((p) => p.id)).toContain("cheap");
      expect(result.map((p) => p.id)).not.toContain("expensive");
    });

    it("blend score: cheaper product with similar macros ranks above pricier one", () => {
      // Both have the same protein/carbs/fat — macroScores are equal
      // p_cheap: price=10000 → blend = macroScore * (1 - 10000/100000) = macroScore * 0.9
      // p_pricey: price=50000 → blend = macroScore * (1 - 50000/100000) = macroScore * 0.5
      const p_cheap = makeProduct("cheap", 30, 10, 5, 10000);
      const p_pricey = makeProduct("pricey", 30, 10, 5, 50000);
      const result = recommend([p_cheap, p_pricey], emptyTotals, standardGoals, 6, [], 100000);
      expect(result[0].id).toBe("cheap");
    });

    it("budget inactive (undefined): scores identical to non-budget call", () => {
      const p1 = makeProduct("p1", 50, 20, 10, 5000);
      const p2 = makeProduct("p2", 10, 5, 2, 3000);
      const withBudget = recommend([p1, p2], emptyTotals, standardGoals, 6, [], undefined);
      const withoutBudget = recommend([p1, p2], emptyTotals, standardGoals, 6, []);
      expect(withBudget.map((p) => p.id)).toEqual(withoutBudget.map((p) => p.id));
      expect(withBudget[0].score).toBe(withoutBudget[0].score);
    });

    it("top-1 badge: result[0].reason === 'Mejor relación proteína/precio' when budget active", () => {
      const p1 = makeProduct("p1", 50, 20, 10, 10000);
      const p2 = makeProduct("p2", 30, 10, 5, 5000);
      const result = recommend([p1, p2], emptyTotals, standardGoals, 6, [], 100000);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].reason).toBe("Mejor relación proteína/precio");
    });

    it("returns empty array when all products exceed remaining budget", () => {
      // maxBudget=50000, totals.price=40000 → remaining=10000
      // all products cost more than 10000
      const p1 = makeProduct("p1", 50, 20, 10, 15000);
      const p2 = makeProduct("p2", 30, 10, 5, 20000);
      const almostFullCart: CartTotals = { protein: 0, carbs: 0, fat: 0, calories: 0, price: 40000, itemCount: 2 };
      const result = recommend([p1, p2], almostFullCart, standardGoals, 6, [], 50000);
      expect(result).toHaveLength(0);
    });

    it("maxBudget=0 is treated as undefined — no budget filtering applied (T-3-02 guard)", () => {
      const p1 = makeProduct("p1", 50, 20, 10, 5000);
      const p2 = makeProduct("p2", 10, 5, 2, 3000);
      const withZeroBudget = recommend([p1, p2], emptyTotals, standardGoals, 6, [], 0);
      const withoutBudget = recommend([p1, p2], emptyTotals, standardGoals, 6, []);
      expect(withZeroBudget.map((p) => p.id)).toEqual(withoutBudget.map((p) => p.id));
      // No badge on top-1 when budget is 0 (treated as inactive)
      expect(withZeroBudget[0].reason).not.toBe("Mejor relación proteína/precio");
    });
  });

  describe("recommend() — MEAL-05 meal context filter", () => {
    it("with mealContext='breakfast', filters out non-breakfast products", () => {
      // lunch and dinner products should be excluded; breakfast product survives
      const breakfast = makeProduct("b", 30, 10, 5, 5000, [], 'breakfast');
      const lunch = makeProduct("l", 40, 10, 5, 5000, [], 'lunch');
      const dinner = makeProduct("d", 35, 10, 5, 5000, [], 'dinner');
      const result = recommend([breakfast, lunch, dinner], emptyTotals, standardGoals, 6, [], undefined, 'breakfast');
      expect(result.map((p) => p.id)).toContain("b");
      expect(result.map((p) => p.id)).not.toContain("l");
      expect(result.map((p) => p.id)).not.toContain("d");
    });

    it("products tagged 'any' always pass the meal filter (D-06 pass-through)", () => {
      // 'any' products appear in all meal contexts
      const anyProduct = makeProduct("any", 30, 10, 5, 5000, [], 'any');
      const lunch = makeProduct("l", 40, 10, 5, 5000, [], 'lunch');
      const result = recommend([anyProduct, lunch], emptyTotals, standardGoals, 6, [], undefined, 'breakfast');
      expect(result.map((p) => p.id)).toContain("any");
      expect(result.map((p) => p.id)).not.toContain("l");
    });

    it("mealContext=undefined returns all products (no filter — backward compat)", () => {
      const breakfast = makeProduct("b", 30, 10, 5, 5000, [], 'breakfast');
      const lunch = makeProduct("l", 40, 10, 5, 5000, [], 'lunch');
      const result = recommend([breakfast, lunch], emptyTotals, standardGoals, 6, [], undefined, undefined);
      expect(result).toHaveLength(2);
    });

    it("mealContext='any' returns all products (same as no filter — D-05)", () => {
      const breakfast = makeProduct("b", 30, 10, 5, 5000, [], 'breakfast');
      const lunch = makeProduct("l", 40, 10, 5, 5000, [], 'lunch');
      const result = recommend([breakfast, lunch], emptyTotals, standardGoals, 6, [], undefined, 'any');
      expect(result).toHaveLength(2);
    });

    it("returns empty array when no products match the meal filter", () => {
      const lunch = makeProduct("l", 40, 10, 5, 5000, [], 'lunch');
      const dinner = makeProduct("d", 35, 10, 5, 5000, [], 'dinner');
      const result = recommend([lunch, dinner], emptyTotals, standardGoals, 6, [], undefined, 'breakfast');
      expect(result).toEqual([]);
    });

    it("meal filter stacks with restrictions filter (both applied independently)", () => {
      // Product must pass restrictions AND meal context to survive
      const ok = makeProduct("ok", 30, 10, 5, 5000, ["vegano"], 'breakfast');
      const wrongMeal = makeProduct("wm", 30, 10, 5, 5000, ["vegano"], 'lunch');
      const wrongTag = makeProduct("wt", 30, 10, 5, 5000, [], 'breakfast');
      const result = recommend([ok, wrongMeal, wrongTag], emptyTotals, standardGoals, 6, ["vegano"], undefined, 'breakfast');
      expect(result.map((p) => p.id)).toEqual(["ok"]);
    });

    it("meal filter stacks with budget filter (both applied independently)", () => {
      // maxBudget=20000, totals.price=0 → remaining=20000
      // p_ok: price=10000, mealContext='breakfast' → passes both filters
      // p_expensive: price=25000, mealContext='breakfast' → fails budget filter
      // p_wrong_meal: price=10000, mealContext='lunch' → fails meal filter
      const p_ok = makeProduct("ok", 30, 10, 5, 10000, [], 'breakfast');
      const p_expensive = makeProduct("exp", 35, 10, 5, 25000, [], 'breakfast');
      const p_wrong_meal = makeProduct("wm", 40, 10, 5, 10000, [], 'lunch');
      const result = recommend([p_ok, p_expensive, p_wrong_meal], emptyTotals, standardGoals, 6, [], 20000, 'breakfast');
      expect(result.map((p) => p.id)).toEqual(["ok"]);
    });
  });
});
