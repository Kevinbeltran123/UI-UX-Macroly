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

  it("with scaled goals (protein=300) scores differently than unscaled (protein=150)", () => {
    const high = makeProduct("high", 80, 5, 2);
    const reg = makeProduct("reg", 20, 50, 20);
    const scaledGoals: MacroGoals = { protein: 300, carbs: 500, fat: 130, calories: 4370 };
    const resultScaled = recommend([high, reg], emptyTotals, scaledGoals, 2);
    const resultUnscaled = recommend([high, reg], emptyTotals, standardGoals, 2);
    // With doubled goals, the protein gap is the same proportionally but scores still differ
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
});
