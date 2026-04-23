"use client";

import { create } from "zustand";
import type { MacroGoals } from "@/domain/nutrition/macro-goals";
import { DEFAULT_GOALS, buildGoals } from "@/domain/nutrition/macro-goals";

type GoalsState = {
  goals: MacroGoals;
  loading: boolean;
  fetchGoals: () => Promise<void>;
};

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: DEFAULT_GOALS,
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
      // T-1-02: defense-in-depth — eq("user_id", user.id) ensures we only read own row
      // RLS enforces this at DB level; this is a second layer of protection
      const { data: goalsData } = await supabase
        .from("macro_goals")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (goalsData) {
        // CRITICAL: macro_goals table has NO calories column — derive via Atwater formula
        // Never read data.calories — it does not exist (RESEARCH.md Pitfall 6)
        set({ goals: buildGoals({ protein: goalsData.protein, carbs: goalsData.carbs, fat: goalsData.fat }) });
      }
    } catch {
      // silently degrade to DEFAULT_GOALS
    } finally {
      set({ loading: false });
    }
  },
}));
