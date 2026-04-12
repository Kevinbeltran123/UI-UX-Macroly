import { z } from "zod";

/**
 * Macro nutritional goals.
 * Calories are derived: protein*4 + carbs*4 + fat*9 (Atwater factors).
 */
export type MacroGoals = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

export const MacroGoalsSchema = z.object({
  protein: z.number().int().min(50).max(300),
  carbs: z.number().int().min(100).max(500),
  fat: z.number().int().min(20).max(150),
});

export type MacroGoalsInput = z.infer<typeof MacroGoalsSchema>;

export const DEFAULT_GOALS: MacroGoals = {
  protein: 150,
  carbs: 250,
  fat: 65,
  calories: 2185,
};

export const computeCalories = (g: Pick<MacroGoals, "protein" | "carbs" | "fat">): number =>
  g.protein * 4 + g.carbs * 4 + g.fat * 9;

export const buildGoals = (input: MacroGoalsInput): MacroGoals => ({
  ...input,
  calories: computeCalories(input),
});
