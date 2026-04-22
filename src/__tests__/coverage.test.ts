// Tests for recurring order coverage formula — PERIOD-08
// Formula: Math.floor(Math.min(p/pGoal, c/cGoal, f/fGoal))
// VALIDATION.md: task 1-W0-10

const computeCoverage = (
  totals: { protein: number; carbs: number; fat: number },
  dailyGoals: { protein: number; carbs: number; fat: number },
) =>
  Math.floor(
    Math.min(
      totals.protein / (dailyGoals.protein || 1),
      totals.carbs / (dailyGoals.carbs || 1),
      totals.fat / (dailyGoals.fat || 1),
    ),
  );

describe("coverage formula (PERIOD-08)", () => {
  it("returns 0 when cart is empty", () => {
    expect(computeCoverage({ protein: 0, carbs: 0, fat: 0 }, { protein: 150, carbs: 250, fat: 65 })).toBe(0);
  });

  it("returns the binding constraint (lowest macro ratio)", () => {
    // protein covers 3 days, carbs covers 2 days, fat covers 4 days → binding = 2
    expect(computeCoverage(
      { protein: 450, carbs: 500, fat: 260 },
      { protein: 150, carbs: 250, fat: 65 },
    )).toBe(2);
  });

  it("floors the result (1.9 days → 1)", () => {
    // protein: 285/150 = 1.9 → floor = 1
    expect(computeCoverage({ protein: 285, carbs: 500, fat: 260 }, { protein: 150, carbs: 250, fat: 65 })).toBe(1);
  });

  it("handles zero goals gracefully (division-by-zero guard via || 1)", () => {
    expect(computeCoverage({ protein: 100, carbs: 100, fat: 100 }, { protein: 0, carbs: 0, fat: 0 })).toBe(100);
  });
});
