import type { Product } from "@/domain/catalog/product";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";

export type CartItem = Product & { qty: number };

export type CartTotals = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  price: number;
  itemCount: number;
};

const ZERO: CartTotals = {
  protein: 0,
  carbs: 0,
  fat: 0,
  calories: 0,
  price: 0,
  itemCount: 0,
};

export const computeCartTotals = (items: readonly CartItem[]): CartTotals =>
  items.reduce<CartTotals>(
    (acc, item) => ({
      protein: acc.protein + item.protein * item.qty,
      carbs: acc.carbs + item.carbs * item.qty,
      fat: acc.fat + item.fat * item.qty,
      calories: acc.calories + item.calories * item.qty,
      price: acc.price + item.price * item.qty,
      itemCount: acc.itemCount + item.qty,
    }),
    ZERO,
  );

export const computeProgress = (totals: CartTotals, goals: MacroGoals) => ({
  protein: Math.min((totals.protein / goals.protein) * 100, 100),
  carbs: Math.min((totals.carbs / goals.carbs) * 100, 100),
  fat: Math.min((totals.fat / goals.fat) * 100, 100),
  calories: Math.min((totals.calories / goals.calories) * 100, 100),
});

export const findOverages = (totals: CartTotals, goals: MacroGoals) => ({
  protein: totals.protein > goals.protein,
  carbs: totals.carbs > goals.carbs,
  fat: totals.fat > goals.fat,
  calories: totals.calories > goals.calories,
});
