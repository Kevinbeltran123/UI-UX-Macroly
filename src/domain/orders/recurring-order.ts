import type { CartItem } from "@/domain/cart/cart-summary";

/**
 * Day-of-week codes used across the recurring order UI.
 * Spanish abbreviations to match the prototipo and the day picker.
 */
export const DAY_CODES = ["L", "M", "Mi", "J", "V", "S", "D"] as const;
export type DayCode = (typeof DAY_CODES)[number];

const DAY_NAMES: Record<DayCode, string> = {
  L: "Lunes",
  M: "Martes",
  Mi: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
  D: "Domingo",
};

export const dayName = (code: DayCode): string => DAY_NAMES[code];

/**
 * Human-friendly text for a list of days.
 * Migrated from prototipo `daysText()`.
 */
export const daysText = (days: readonly DayCode[]): string => {
  if (days.length === 0) return "";
  if (days.length === 7) return "todos los días";
  return days.map(dayName).join(", ");
};

/**
 * Toggle a day in the selection list (immutably).
 * Migrated from prototipo `toggleDay()`.
 */
export const toggleDay = (selected: readonly DayCode[], day: DayCode): DayCode[] =>
  selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day];

/**
 * Recurring order as it lives in `recurring_orders` (Supabase).
 */
export type RecurringOrder = {
  id: string;
  userId: string;
  items: CartItem[];
  days: DayCode[];
  active: boolean;
  nextDelivery: string | null;
  createdAt: string;
};
