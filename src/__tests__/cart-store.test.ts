// Tests for src/stores/cart-store.ts — FIX-01 + PERIOD-07
// VALIDATION.md: 1-W0-01, 1-W0-02, 1-W0-03

import { useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/domain/cart/cart-summary";

// Minimal CartItem fixture satisfying all required Product fields
const makeItem = (id: string): CartItem => ({
  id,
  name: "Test Product",
  brand: null,
  weight: null,
  imageUrl: null,
  price: 10,
  protein: 20,
  carbs: 30,
  fat: 5,
  calories: 245,
  categoryId: null,
  rating: null,
  qty: 1,
});

// Reset store between tests using setState back to initial values
beforeEach(() => {
  useCartStore.setState({
    items: [],
    totals: useCartStore.getState().totals,
    purchaseDays: 1,
    lastUpdated: new Date().toDateString(),
  });
});

describe("useCartStore", () => {
  describe("clear()", () => {
    it("resets items to [] but does NOT reset purchaseDays (D-11)", () => {
      useCartStore.setState({ purchaseDays: 5 });
      useCartStore.getState().clear();
      expect(useCartStore.getState().items).toEqual([]);
      expect(useCartStore.getState().purchaseDays).toBe(5);
    });
  });

  describe("setPurchaseDays() — T-1-01 security control", () => {
    it.each([1, 2, 3, 5, 7])("accepts valid value %i", (days) => {
      useCartStore.getState().setPurchaseDays(days);
      expect(useCartStore.getState().purchaseDays).toBe(days);
    });

    it.each([0, 4, 6, 8, -1, 100])("rejects invalid value %i (stays unchanged)", (days) => {
      useCartStore.setState({ purchaseDays: 1 });
      useCartStore.getState().setPurchaseDays(days);
      expect(useCartStore.getState().purchaseDays).toBe(1);
    });
  });

  describe("setLastUpdated()", () => {
    it("stores the date string", () => {
      useCartStore.getState().setLastUpdated("Mon Apr 21 2026");
      expect(useCartStore.getState().lastUpdated).toBe("Mon Apr 21 2026");
    });
  });

  describe("onRehydrateStorage TTL (FIX-01)", () => {
    it("clears cart when lastUpdated is a past date", () => {
      const storedState = {
        ...useCartStore.getState(),
        lastUpdated: "Mon Apr 21 2026",  // past date
        items: [makeItem("p1")],
        purchaseDays: 5,
      };
      useCartStore.setState(storedState);
      // Invoke the inner callback via Zustand v5 persist API (replaces broken _persist access)
      const { onRehydrateStorage } = useCartStore.persist.getOptions();
      const callback = onRehydrateStorage?.();
      callback?.(useCartStore.getState(), undefined);
      expect(useCartStore.getState().items).toEqual([]);
      expect(useCartStore.getState().purchaseDays).toBe(5);
    });

    it("preserves purchaseDays after TTL clear (D-11)", () => {
      useCartStore.setState({ purchaseDays: 7, lastUpdated: "Mon Apr 21 2026" });
      useCartStore.getState().clear();
      expect(useCartStore.getState().purchaseDays).toBe(7);
    });
  });
});
