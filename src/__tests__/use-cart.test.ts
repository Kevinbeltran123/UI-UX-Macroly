// Tests for src/hooks/use-cart.ts — period scaling
// PERIOD-03: useCart returns goals.protein * purchaseDays
// PERIOD-04: computeProgress with scaled goals returns correct %
// VALIDATION.md: tasks 1-W0-06, 1-W0-07

describe("useCart — period scaling (PERIOD-03, PERIOD-04)", () => {
  describe("scaledGoals", () => {
    it.todo("with purchaseDays=2, returns goals.protein * 2");
    it.todo("with purchaseDays=1 (default), returns unmodified goals");
    it.todo("scales all four macros: protein, carbs, fat, calories");
  });

  describe("computeProgress integration", () => {
    it.todo("returns 50% when totals.protein = half of scaledGoal.protein");
    it.todo("caps at 100% — Math.min(current / scaled, 1)");
  });
});
