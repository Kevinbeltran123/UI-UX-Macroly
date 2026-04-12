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
};
