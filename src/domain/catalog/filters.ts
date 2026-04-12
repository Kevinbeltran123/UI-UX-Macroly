import type { Product } from "./product";

export type CategoryId =
  | "todos"
  | "proteina"
  | "carbohidrato"
  | "grasa"
  | "lacteo"
  | "fruta"
  | "suplemento";

export type MacroFilter = "todos" | "highProtein" | "lowCarb" | "lowFat" | "bestValue";

/**
 * Thresholds for macro-based filters.
 *
 * NOTE: These were inherited from the prototipo where they were chosen by intuition.
 * They are based on the per-package macros of the seed catalog (not per-100g),
 * because that's how products are listed in this MVP.
 *
 * Worth revisiting once we have real product data — see:
 *   - `prototipo-legacy/src/macroly-completo.html` PRODUCTS array
 * If a future version uses per-100g, divide thresholds by ~5.
 */
export const FILTER_THRESHOLDS = {
  highProteinMin: 20,
  lowCarbMax: 20,
  lowFatMax: 10,
} as const;

export type CatalogFilters = {
  category: CategoryId;
  macro: MacroFilter;
  search: string;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  category: "todos",
  macro: "todos",
  search: "",
};

const matchesCategory = (p: Product, category: CategoryId): boolean =>
  category === "todos" || p.categoryId === category;

const matchesMacro = (p: Product, macro: MacroFilter): boolean => {
  if (macro === "todos" || macro === "bestValue") return true;
  if (macro === "highProtein") return p.protein > FILTER_THRESHOLDS.highProteinMin;
  if (macro === "lowCarb") return p.carbs < FILTER_THRESHOLDS.lowCarbMax;
  if (macro === "lowFat") return p.fat < FILTER_THRESHOLDS.lowFatMax;
  return true;
};

const matchesSearch = (p: Product, search: string): boolean => {
  if (!search.trim()) return true;
  const q = search.toLowerCase();
  return p.name.toLowerCase().includes(q) || (p.brand?.toLowerCase().includes(q) ?? false);
};

const sortByValue = (a: Product, b: Product): number => {
  const valueA = a.price / Math.max(a.protein, 1);
  const valueB = b.price / Math.max(b.protein, 1);
  return valueA - valueB;
};

/**
 * Apply category + macro + search filters.
 * Migrated from prototipo `filtered = (() => {...})()`.
 */
export const applyFilters = (products: readonly Product[], filters: CatalogFilters): Product[] => {
  const result = products.filter(
    (p) =>
      matchesCategory(p, filters.category) &&
      matchesMacro(p, filters.macro) &&
      matchesSearch(p, filters.search),
  );
  if (filters.macro === "bestValue") {
    return [...result].sort(sortByValue);
  }
  return result;
};
