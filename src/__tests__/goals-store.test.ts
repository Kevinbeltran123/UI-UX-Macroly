// Tests for src/stores/goals-store.ts + src/domain/nutrition/macro-goals.ts — FIX-02
// VALIDATION.md: task 1-W0-04

import { vi, beforeEach, describe, it, expect } from "vitest";

// Mock the Supabase client module BEFORE importing the store
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "test-uid-123" } },
      })),
    },
    from: vi.fn((table: string) => {
      if (table === "macro_goals") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: { protein: 160, carbs: 300, fat: 70 },
              })),
            })),
          })),
        };
      }
      // profiles table — returns dietary_restrictions
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { dietary_restrictions: ["vegano", "sin_gluten"] },
            })),
          })),
        })),
      };
    }),
  })),
}));

import { buildGoals, DEFAULT_GOALS } from "@/domain/nutrition/macro-goals";
import { useGoalsStore } from "@/stores/goals-store";

beforeEach(() => {
  useGoalsStore.setState({ goals: DEFAULT_GOALS, restrictions: [], loading: false });
});

describe("buildGoals — Atwater formula (FIX-02 prerequisite)", () => {
  it("derives calories correctly: protein*4 + carbs*4 + fat*9", () => {
    const result = buildGoals({ protein: 160, carbs: 300, fat: 70 });
    // 160*4 + 300*4 + 70*9 = 640 + 1200 + 630 = 2470
    expect(result.calories).toBe(2470);
  });

  it("passes through protein, carbs, fat unchanged", () => {
    const result = buildGoals({ protein: 160, carbs: 300, fat: 70 });
    expect(result.protein).toBe(160);
    expect(result.carbs).toBe(300);
    expect(result.fat).toBe(70);
  });

  it("DEFAULT_GOALS.calories matches Atwater formula for DEFAULT_GOALS values", () => {
    const derived = buildGoals({ protein: 150, carbs: 250, fat: 65 });
    expect(derived.calories).toBe(DEFAULT_GOALS.calories);
  });
});

describe("useGoalsStore — FIX-02", () => {
  it("initial state is DEFAULT_GOALS with loading:false", () => {
    const { goals, loading } = useGoalsStore.getState();
    expect(goals).toEqual(DEFAULT_GOALS);
    expect(loading).toBe(false);
  });

  it("fetchGoals sets loading:true then loading:false on completion", async () => {
    const loadingStates: boolean[] = [];
    const unsub = useGoalsStore.subscribe((state) => {
      loadingStates.push(state.loading);
    });
    await useGoalsStore.getState().fetchGoals();
    unsub();
    // Should have seen loading:true at some point
    expect(loadingStates).toContain(true);
    // Should end with loading:false
    expect(useGoalsStore.getState().loading).toBe(false);
  });

  it("fetchGoals stores buildGoals(data) result — calories derived, not from DB", async () => {
    await useGoalsStore.getState().fetchGoals();
    const { goals } = useGoalsStore.getState();
    // Mock returns protein:160, carbs:300, fat:70
    expect(goals.protein).toBe(160);
    expect(goals.carbs).toBe(300);
    expect(goals.fat).toBe(70);
    // Calories must be derived via Atwater (160*4+300*4+70*9 = 2470)
    expect(goals.calories).toBe(2470);
  });

  it("fetchGoals populates restrictions from profiles query (DIET-06)", async () => {
    await useGoalsStore.getState().fetchGoals();
    const { restrictions } = useGoalsStore.getState();
    expect(restrictions).toEqual(["vegano", "sin_gluten"]);
  });

  it("fetchGoals populates both goals and restrictions in one call (DIET-06)", async () => {
    await useGoalsStore.getState().fetchGoals();
    const { goals, restrictions } = useGoalsStore.getState();
    expect(goals.protein).toBe(160);
    expect(restrictions).toEqual(["vegano", "sin_gluten"]);
  });

  it("initial restrictions state is empty array (DIET-06)", () => {
    const { restrictions } = useGoalsStore.getState();
    expect(restrictions).toEqual([]);
  });
});
