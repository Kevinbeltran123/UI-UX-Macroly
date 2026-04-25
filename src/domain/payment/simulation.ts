import type { PaymentMethod } from "./method";

/**
 * Deterministic simulator. We use known "magic" inputs to trigger failures so
 * the demo can show both the happy path and the error path on demand.
 *
 *   Card:      ends in 0000  → "Tarjeta declinada por el banco emisor"
 *   Card:      CVV "000"     → "Código de seguridad incorrecto"
 *   Nequi:     "300 000 0000" → "Saldo insuficiente"
 *   Daviplata: "300 000 0000" → "Saldo insuficiente"
 *   Wallet:    OTP "000000"  → "Código incorrecto"
 *   Bre-B:     llave "rechazo"→ "Llave no encontrada"
 *   Cash:      —              → never fails (paid on delivery)
 */

export type SimResult =
  | { kind: "approved"; transactionRef: string }
  | { kind: "declined"; reason: string };

/** Format a transaction reference like MCY-7K2P-9XQ8 — Macroly + 2x4 char blocks. */
export const generateTransactionRef = (): string => {
  const block = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 → readable
    let out = "";
    for (let i = 0; i < 4; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  };
  return `MCY-${block()}-${block()}`;
};

export type CardSimInput = {
  digits: string;
  cvv: string;
};

export type WalletSimInput = {
  phoneDigits: string;
  otp: string;
};

export type BrebSimInput = {
  llave: string;
};

export const simulateCard = (input: CardSimInput): SimResult => {
  if (input.cvv === "000") {
    return { kind: "declined", reason: "Código de seguridad incorrecto" };
  }
  if (input.digits.endsWith("0000")) {
    return { kind: "declined", reason: "Tarjeta declinada por el banco emisor" };
  }
  return { kind: "approved", transactionRef: generateTransactionRef() };
};

export const simulateWallet = (input: WalletSimInput): SimResult => {
  if (input.otp === "000000") {
    return { kind: "declined", reason: "Código de verificación incorrecto" };
  }
  if (input.phoneDigits === "3000000000") {
    return { kind: "declined", reason: "Saldo insuficiente en tu cuenta" };
  }
  return { kind: "approved", transactionRef: generateTransactionRef() };
};

export const simulateBreb = (input: BrebSimInput): SimResult => {
  if (input.llave.toLowerCase().includes("rechazo")) {
    return { kind: "declined", reason: "Llave Bre-B no encontrada" };
  }
  return { kind: "approved", transactionRef: generateTransactionRef() };
};

export const simulateCash = (): SimResult => ({
  kind: "approved",
  transactionRef: generateTransactionRef(),
});

/** Map a payment method + form state to a result. Caller decides which sim to use. */
export type PaymentMeta = Record<string, string | number | undefined>;

export type CompletedPayment = {
  method: PaymentMethod;
  result: SimResult;
  meta: PaymentMeta;
};
