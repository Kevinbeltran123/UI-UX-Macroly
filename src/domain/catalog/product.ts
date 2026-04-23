/**
 * Product as it lives in the catalog (Supabase row mirror).
 */
export type Product = {
  id: string;
  name: string;
  brand: string | null;
  weight: string | null;
  imageUrl: string | null;
  price: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  categoryId: string | null;
  rating: number | null;
  dietaryTags: string[]; // Phase 2 (DIET-02) — maps to DB column dietary_tags text[]
  mealContext: 'any' | 'breakfast' | 'lunch' | 'dinner'; // Phase 4 (MEAL-02) — maps to DB column meal_context text
};
