// Tests for src/domain/favorites/favorite-combo.ts
// FIX-03: nextComboName replaces inline Combo #N logic in carrito/page.tsx
// VALIDATION.md: task 1-W0-05

import { nextComboName } from "@/domain/favorites/favorite-combo";
import type { FavoriteCombo } from "@/domain/favorites/favorite-combo";

const makeCombo = (id: string): FavoriteCombo => ({
  id,
  userId: "user-1",
  name: `Combo #${id}`,
  items: [],
  totals: { protein: 0, carbs: 0, fat: 0, calories: 0, price: 0, itemCount: 0 },
  createdAt: new Date().toISOString(),
});

describe("nextComboName", () => {
  it("returns 'Combo #1' when there are no existing combos", () => {
    expect(nextComboName([])).toBe("Combo #1");
  });

  it("returns 'Combo #3' when there are 2 existing combos", () => {
    const existing = [makeCombo("1"), makeCombo("2")];
    expect(nextComboName(existing)).toBe("Combo #3");
  });

  it("is pure — repeated calls with same input return same output", () => {
    const existing = [makeCombo("1")];
    expect(nextComboName(existing)).toBe(nextComboName(existing));
  });
});
