// Tests for src/domain/catalog/compatibility.ts — PERIOD-05
// VALIDATION.md: task 1-W0-08

import { checkCompatibility, exceededMacros } from "@/domain/catalog/compatibility";
import type { Product } from "@/domain/catalog/product";
import type { CartTotals } from "@/domain/cart/cart-summary";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";

// Helper: minimal Product shape with all required fields
const makeProduct = (protein: number, carbs: number, fat: number): Product => ({
  id: "test-product",
  name: "Test Product",
  brand: null,
  weight: null,
  imageUrl: null,
  price: 5000,
  protein,
  carbs,
  fat,
  calories: protein * 4 + carbs * 4 + fat * 9,
  categoryId: null,
  rating: null,
});

const makeTotals = (protein: number, carbs: number, fat: number): CartTotals => ({
  protein,
  carbs,
  fat,
  calories: protein * 4 + carbs * 4 + fat * 9,
  price: 0,
  itemCount: 1,
});

const makeGoals = (protein: number, carbs: number, fat: number): MacroGoals => ({
  protein,
  carbs,
  fat,
  calories: protein * 4 + carbs * 4 + fat * 9,
});

describe("checkCompatibility — PERIOD-05", () => {
  it("returns 'fits' when totals + product macros are well below daily goals", () => {
    // totals.protein(50) + product.protein(30) = 80 — well below goal(150), < 90% of 150 = 135
    const product = makeProduct(30, 10, 5);
    const totals = makeTotals(50, 100, 20);
    const goals = makeGoals(150, 250, 65);
    expect(checkCompatibility(product, totals, goals)).toBe("fits");
  });

  it("returns 'tight' when result is above 90% but not over the goal", () => {
    // totals.protein(100) + product.protein(40) = 140 — above 90% of 150 (135) but <= 150
    const product = makeProduct(40, 5, 2);
    const totals = makeTotals(100, 50, 15);
    const goals = makeGoals(150, 250, 65);
    expect(checkCompatibility(product, totals, goals)).toBe("tight");
  });

  it("returns 'exceeds' when product would push totals over goals", () => {
    // totals.protein(130) + product.protein(80) = 210 > goal(150)
    const product = makeProduct(80, 10, 5);
    const totals = makeTotals(130, 100, 20);
    const goals = makeGoals(150, 250, 65);
    expect(checkCompatibility(product, totals, goals)).toBe("exceeds");
  });

  it("with period-scaled goals (protein=300), same cart+product that exceeded unscaled now fits or is tight", () => {
    // totals.protein(130) + product.protein(80) = 210
    // With unscaled goal(150): exceeds. With scaled goal(300): 210 < 300, and 210 > 270 (90%) is false → "fits"
    const product = makeProduct(80, 10, 5);
    const totals = makeTotals(130, 100, 20);
    const scaledGoals = makeGoals(300, 500, 130); // 2× scaled
    const result = checkCompatibility(product, totals, scaledGoals);
    expect(["fits", "tight"]).toContain(result);
    // 210 < 300 (not exceeds) and 210 < 270 (90% of 300) → "fits"
    expect(result).toBe("fits");
  });
});

describe("exceededMacros — PERIOD-05", () => {
  it("lists macro names that are exceeded", () => {
    // protein: 130 + 80 = 210 > 150 → exceeded
    const product = makeProduct(80, 10, 5);
    const totals = makeTotals(130, 100, 20);
    const goals = makeGoals(150, 250, 65);
    const exceeded = exceededMacros(product, totals, goals);
    expect(exceeded).toContain("proteína");
  });

  it("returns empty array when nothing is exceeded", () => {
    // all within goals: protein 20+10=30<150, carbs 30+5=35<250, fat 10+2=12<65
    const product = makeProduct(10, 5, 2);
    const totals = makeTotals(20, 30, 10);
    const goals = makeGoals(150, 250, 65);
    expect(exceededMacros(product, totals, goals)).toEqual([]);
  });

  it("lists all three macros when all are exceeded", () => {
    const product = makeProduct(100, 200, 50);
    const totals = makeTotals(100, 200, 50);
    const goals = makeGoals(150, 250, 65);
    const exceeded = exceededMacros(product, totals, goals);
    expect(exceeded).toContain("proteína");
    expect(exceeded).toContain("carbos");
    expect(exceeded).toContain("grasas");
    expect(exceeded).toHaveLength(3);
  });

  it("with scaled goals (protein=300), product+totals that exceed unscaled goal no longer exceed", () => {
    // protein: 130 + 80 = 210 — exceeds 150 but NOT 300
    const product = makeProduct(80, 10, 5);
    const totals = makeTotals(130, 50, 20);
    const scaledGoals = makeGoals(300, 500, 130);
    expect(exceededMacros(product, totals, scaledGoals)).toEqual([]);
  });
});
