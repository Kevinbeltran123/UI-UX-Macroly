/**
 * Validators for non-card payment methods (Nequi, Daviplata, Bre-B, cash).
 * All pure — no I/O, safe to import from anywhere.
 */

const ONLY_DIGITS = /\D/g;

/** Colombian mobile numbers always start with 3 and are 10 digits. */
export const isColombianMobile = (raw: string): boolean => {
  const digits = raw.replace(ONLY_DIGITS, "");
  return digits.length === 10 && digits.startsWith("3");
};

/** "3001234567" → "300 123 4567". Forgiving as the user types. */
export const formatColombianMobile = (raw: string): string => {
  const d = raw.replace(ONLY_DIGITS, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
};

/** Light-touch: 6 digits, no further structure. */
export const isOtpValid = (otp: string): boolean => /^\d{6}$/.test(otp);

/* ------------------------------------------------------------------------ */
/* Bre-B "llaves"                                                            */
/* ------------------------------------------------------------------------ */

export type BrebKeyKind = "cedula" | "correo" | "telefono" | "alfanumerica" | null;

/**
 * Detect what kind of Bre-B key the user typed:
 *   - cedula: 6–10 digits, digits only
 *   - telefono: starts with @ or +57, then 10 digits
 *   - correo: contains @ and a dot (and is not a phone alias)
 *   - alfanumerica: 4–20 chars, letters + numbers, starts with a letter
 */
export const detectBrebKeyKind = (raw: string): BrebKeyKind => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^@?\+?5?7?\s*3\d{2}\s*\d{3}\s*\d{4}$/.test(trimmed)) return "telefono";
  if (/^\d{6,10}$/.test(trimmed.replace(/\s/g, ""))) return "cedula";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "correo";
  if (/^[a-zA-Z][a-zA-Z0-9._-]{3,19}$/.test(trimmed)) return "alfanumerica";
  return null;
};

export const brebKeyLabel: Record<Exclude<BrebKeyKind, null>, string> = {
  cedula: "Cédula",
  correo: "Correo",
  telefono: "Celular",
  alfanumerica: "Alias",
};

/* ------------------------------------------------------------------------ */
/* Cash — vuelto calculator                                                  */
/* ------------------------------------------------------------------------ */

export type ChangeStatus = "empty" | "short" | "exact" | "over";
export type ChangeResult = {
  change: number;
  hint: string;
  status: ChangeStatus;
  /** Suggested round-up bill the user could give (e.g., 50_000) when they're close. */
  suggestion: number | null;
};

const COMMON_BILLS = [2_000, 5_000, 10_000, 20_000, 50_000, 100_000];

export const calculateChange = (
  total: number,
  paidAmount: number | null
): ChangeResult => {
  if (paidAmount == null || Number.isNaN(paidAmount) || paidAmount <= 0) {
    return { change: 0, hint: "Indica con cuánto vas a pagar", status: "empty", suggestion: null };
  }
  const paid = Math.floor(paidAmount);
  if (paid < total) {
    const missing = total - paid;
    const suggestion = COMMON_BILLS.find((b) => b >= total) ?? null;
    return {
      change: 0,
      hint: `Faltan $${missing.toLocaleString("es-CO")}`,
      status: "short",
      suggestion,
    };
  }
  if (paid === total) {
    return { change: 0, hint: "Pago exacto — sin vuelto", status: "exact", suggestion: null };
  }
  return {
    change: paid - total,
    hint: `Vuelto: $${(paid - total).toLocaleString("es-CO")}`,
    status: "over",
    suggestion: null,
  };
};

/** Snap a paid amount to the next common bill (used by quick-pick chips). */
export const suggestedBills = (total: number): readonly number[] => {
  const exactBill = COMMON_BILLS.find((b) => b >= total);
  if (!exactBill) return [total];
  const idx = COMMON_BILLS.indexOf(exactBill);
  return [total, exactBill, COMMON_BILLS[idx + 1] ?? exactBill * 2].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );
};
