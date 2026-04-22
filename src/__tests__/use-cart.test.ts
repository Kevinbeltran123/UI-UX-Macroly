// Tests for src/hooks/use-cart.ts — PERIOD-03, PERIOD-04
// VALIDATION.md: 1-W0-06, 1-W0-07

import { renderHook } from "@testing-library/react";
import { act } from "react";
import { useCart } from "@/hooks/use-cart";
import { useCartStore } from "@/stores/cart-store";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";

const baseGoals: MacroGoals = { protein: 150, carbs: 250, fat: 65, calories: 2185 };

beforeEach(() => {
  act(() => {
    useCartStore.setState({ items: [], purchaseDays: 1 });
  });
});

describe("useCart — period scaling (PERIOD-03, PERIOD-04)", () => {
  describe("scaledGoals", () => {
    it("with purchaseDays=2, returns goals.protein * 2", () => {
      act(() => { useCartStore.setState({ purchaseDays: 2 }); });
      const { result } = renderHook(() => useCart(baseGoals));
      expect(result.current.goals.protein).toBe(300); // 150 * 2
    });

    it("with purchaseDays=1 (default), returns unmodified goals", () => {
      act(() => { useCartStore.setState({ purchaseDays: 1 }); });
      const { result } = renderHook(() => useCart(baseGoals));
      expect(result.current.goals.protein).toBe(150);
      expect(result.current.goals.carbs).toBe(250);
      expect(result.current.goals.fat).toBe(65);
    });

    it("scales all four macros: protein, carbs, fat, calories", () => {
      act(() => { useCartStore.setState({ purchaseDays: 3 }); });
      const { result } = renderHook(() => useCart(baseGoals));
      expect(result.current.goals.protein).toBe(450);
      expect(result.current.goals.carbs).toBe(750);
      expect(result.current.goals.fat).toBe(195);
      expect(result.current.goals.calories).toBe(6555);
    });

    it("exposes purchaseDays from the hook", () => {
      act(() => { useCartStore.setState({ purchaseDays: 5 }); });
      const { result } = renderHook(() => useCart(baseGoals));
      expect(result.current.purchaseDays).toBe(5);
    });
  });
});
