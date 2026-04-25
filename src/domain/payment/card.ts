/**
 * Card brand & Colombian issuer detection.
 * BIN ranges are simplified — we cover the most common Colombian issuers
 * for a recognisable demo. Not exhaustive, intentionally.
 */

export type CardBrand = "visa" | "mastercard" | "amex" | "diners" | "unknown";

export type IssuerBank =
  | "Bancolombia"
  | "Davivienda"
  | "Banco de Bogotá"
  | "BBVA Colombia"
  | "Banco Popular"
  | "Scotiabank Colpatria"
  | "Banco AV Villas"
  | null;

const ONLY_DIGITS = /\D/g;

export const stripCardNumber = (value: string): string =>
  value.replace(ONLY_DIGITS, "").slice(0, 19);

/** "4242424242424242" → "4242 4242 4242 4242" (Amex uses 4-6-5 grouping) */
export const formatCardNumber = (digits: string): string => {
  const clean = stripCardNumber(digits);
  if (detectBrand(clean) === "amex") {
    return [clean.slice(0, 4), clean.slice(4, 10), clean.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  }
  return clean.match(/.{1,4}/g)?.join(" ") ?? "";
};

export const detectBrand = (digits: string): CardBrand => {
  if (!digits) return "unknown";
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(36|30[0-5]|3095|38|39)/.test(digits)) return "diners";
  return "unknown";
};

/**
 * Map first 6 digits to a Colombian issuer. Real BIN tables have thousands
 * of ranges per bank; we hand-pick a few that are well-known to give the demo
 * a believable "tu tarjeta es de Bancolombia" hint.
 */
export const detectIssuer = (digits: string): IssuerBank => {
  if (digits.length < 6) return null;
  const bin = digits.slice(0, 6);

  const ranges: Array<{ bank: Exclude<IssuerBank, null>; prefixes: readonly string[] }> = [
    { bank: "Bancolombia", prefixes: ["422023", "446052", "477731", "549089", "552924", "455671", "488360"] },
    { bank: "Davivienda", prefixes: ["423840", "433931", "459015", "454024", "528707", "548067"] },
    { bank: "Banco de Bogotá", prefixes: ["411670", "480007", "404025", "542319"] },
    { bank: "BBVA Colombia", prefixes: ["410946", "430588", "451650", "552117"] },
    { bank: "Banco Popular", prefixes: ["403817", "459257", "552336"] },
    { bank: "Scotiabank Colpatria", prefixes: ["417578", "449630", "554094"] },
    { bank: "Banco AV Villas", prefixes: ["458091", "552533"] },
  ];

  for (const { bank, prefixes } of ranges) {
    if (prefixes.some((p) => bin.startsWith(p))) return bank;
  }
  // Fallback by first digit so we still show something useful in the demo.
  if (digits.startsWith("4")) return "Bancolombia";
  if (digits.startsWith("5")) return "Davivienda";
  return null;
};

export const luhnCheck = (digits: string): boolean => {
  if (digits.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

/** Accept "MM/AA" (Colombian convention) or "MM/AAAA". Returns true iff still valid this month. */
export const isExpiryValid = (raw: string, now: Date = new Date()): boolean => {
  const match = raw.match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) return false;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return false;
  const yearRaw = match[2];
  const year = yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw);
  const expiry = new Date(year, month, 0, 23, 59, 59); // last day of month
  return expiry >= now;
};

export const formatExpiry = (raw: string): string => {
  const digits = raw.replace(ONLY_DIGITS, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

/** Mask all but last 4 with bullets, preserving spacing. */
export const maskCardNumber = (digits: string): string => {
  const visible = digits.slice(-4);
  const hidden = "•".repeat(Math.max(0, digits.length - 4));
  const merged = (hidden + visible).match(/.{1,4}/g)?.join(" ") ?? visible;
  return merged || "•••• •••• •••• ••••";
};

export const cuotasOptions = (brand: CardBrand): readonly number[] =>
  brand === "amex" ? [1, 3, 6, 12] : [1, 3, 6, 12, 18, 24, 36];
