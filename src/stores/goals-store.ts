"use client";

import { create } from "zustand";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";
import { DEFAULT_GOALS, buildGoals } from "@/domain/nutrition/macro-goals";

type GoalsState = {
  goals: MacroGoals;
  restrictions: string[]; // Phase 2 (DIET-06) — dietary restrictions loaded with goals
  budget: number | null;  // Phase 3 (PRICE-02) — null = no budget active (D-06)
  loading: boolean;
  fetchGoals: () => Promise<void>;
};

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: DEFAULT_GOALS,
  restrictions: [], // Phase 2 (DIET-06) — empty until fetchGoals() loads from profiles
  budget: null,  // Phase 3 (PRICE-02) — empty until fetchGoals() loads from profiles
  loading: false,
  fetchGoals: async () => {
    set({ loading: true });
    try {
      // Dynamic import keeps the store tree-shakeable; avoids top-level import of supabase
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;
      const user = data.user;
      // T-1-02: defense-in-depth — .eq() ensures we only read own rows (RLS also enforces at DB level)
      // D-04: Promise.allSettled (not Promise.all) — goals and restrictions are independent;
      // a failed profiles query must NOT discard successfully fetched macro goals (Pitfall 5)
      const [goalsResult, profileResult] = await Promise.allSettled([
        supabase
          .from("macro_goals")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("profiles")
          .select("dietary_restrictions, max_budget")  // extended — D-06, avoids second round-trip
          .eq("id", user.id)
          .single(),
      ]);

      if (goalsResult.status === "fulfilled" && goalsResult.value.data) {
        const g = goalsResult.value.data;
        // CRITICAL: macro_goals table has NO calories column — derive via Atwater formula
        // Never read data.calories — it does not exist (RESEARCH.md Pitfall 6)
        set({ goals: buildGoals({ protein: g.protein, carbs: g.carbs, fat: g.fat }) });
      }
      set({
        restrictions:
          profileResult.status === "fulfilled"
            ? (profileResult.value.data?.dietary_restrictions ?? [])
            : [],
        budget:
          profileResult.status === "fulfilled"
            ? (profileResult.value.data?.max_budget ?? null)
            : null,
      });
    } catch {
      // silently degrade to DEFAULT_GOALS
    } finally {
      set({ loading: false });
    }
  },
}));
