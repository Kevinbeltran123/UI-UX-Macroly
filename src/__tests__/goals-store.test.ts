// Tests for src/stores/goals-store.ts + src/domain/nutrition/macro-goals.ts
// FIX-02: useGoalsStore fetches real goals from Supabase
// VALIDATION.md: task 1-W0-04

describe("buildGoals", () => {
  it.todo("derives calories using Atwater formula: protein*4 + carbs*4 + fat*9");
  it.todo("returns DEFAULT_GOALS.calories when given DEFAULT_GOALS inputs");
});

describe("useGoalsStore", () => {
  it.todo("initial state is DEFAULT_GOALS with loading:false");
  it.todo("fetchGoals sets loading:true then loading:false on completion");
  it.todo("fetchGoals stores buildGoals(data) result — calories derived, not read from DB");
  it.todo("fetchGoals does nothing when user is not authenticated");
});
