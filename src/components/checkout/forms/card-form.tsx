"use client";

import { useMemo, useState } from "react";
import { Field } from "@/components/a11y/field";
import {
  detectBrand,
  detectIssuer,
  formatCardNumber,
  formatExpiry,
  isExpiryValid,
  luhnCheck,
  stripCardNumber,
  cuotasOptions,
  type CardBrand,
  type IssuerBank,
} from "@/domain/payment/card";
import { cn } from "@/lib/cn";
import { Lock } from "lucide-react";

export type CardFormState = {
  digits: string;
  holder: string;
  expiry: string;
  cvv: string;
  cuotas: number;
  brand: CardBrand;
  issuer: IssuerBank;
};

type Props = {
  total: number;
  onSubmit: (form: CardFormState) => void;
};

/* Per-brand surface: gradient + sheen origin so each card has its own personality. */
const BRAND_SURFACES: Record<CardBrand, string> = {
  visa: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.20) 0%, transparent 38%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.40) 0%, transparent 55%),
    linear-gradient(135deg, #0A1454 0%, #1A1F71 45%, #2D3FA8 100%)`,
  mastercard: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.16) 0%, transparent 38%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.45) 0%, transparent 55%),
    linear-gradient(135deg, #0F0F0E 0%, #2A2A26 50%, #4A4A45 100%)`,
  amex: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.20) 0%, transparent 38%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.35) 0%, transparent 55%),
    linear-gradient(135deg, #003F87 0%, #006FCF 50%, #1E8FE8 100%)`,
  diners: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.18) 0%, transparent 38%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.40) 0%, transparent 55%),
    linear-gradient(135deg, #0E1B2C 0%, #1F3A5F 50%, #3A5A8A 100%)`,
  unknown: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.18) 0%, transparent 40%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.42) 0%, transparent 55%),
    linear-gradient(135deg, #0B2317 0%, #1B3D2A 45%, #2D6A4F 100%)`,
};

/* Inline SVG noise texture as data-URI — gives the surface a subtle "matte" feel. */
const NOISE_DATA_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")";

export function CardForm({ total, onSubmit }: Props) {
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cuotas, setCuotas] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const digits = stripCardNumber(number);
  const brand = useMemo(() => detectBrand(digits), [digits]);
  const issuer = useMemo(() => detectIssuer(digits), [digits]);

  const errors = {
    number: digits.length < 13 ? "Número incompleto" : !luhnCheck(digits) ? "Número inválido" : "",
    holder: holder.trim().length < 3 ? "Nombre incompleto" : "",
    expiry: !isExpiryValid(expiry) ? "Fecha inválida" : "",
    cvv: !/^\d{3,4}$/.test(cvv) ? "CVV inválido" : "",
  };
  const valid = !errors.number && !errors.holder && !errors.expiry && !errors.cvv;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!valid) return;
    onSubmit({ digits, holder: holder.trim().toUpperCase(), expiry, cvv, cuotas, brand, issuer });
  };

  const cuotasList = cuotasOptions(brand);

  const brandLabel: Record<CardBrand, string> = {
    visa: "Visa", mastercard: "Mastercard", amex: "American Express",
    diners: "Diners Club", unknown: "tarjeta",
  };

  return (
    <div>
      {/* ===== 3D card preview ===== */}
      <div className="card3d aspect-[1.586/1] mb-5 max-w-sm mx-auto" style={{ height: "auto" }}>
        <div className={cn("card3d-inner", flipped && "[transform:rotateY(180deg)]")}>
          {/* ---------- Front face ---------- */}
          <div
            className="card3d-face rounded-2xl overflow-hidden text-white shadow-card relative"
            style={{ background: BRAND_SURFACES[brand] }}
          >
            {/* Noise texture overlay — adds matte feel */}
            <div
              className="absolute inset-0 opacity-[0.13] mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: NOISE_DATA_URI }}
              aria-hidden="true"
            />
            {/* Sheen — diagonal highlight */}
            <div
              className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] pointer-events-none rotate-[-20deg]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
              }}
              aria-hidden="true"
            />

            <div className="relative p-5 flex flex-col justify-between h-full min-h-[180px]">
              {/* Top row: chip + contactless | issuer */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <ChipMark />
                  <ContactlessMark />
                </div>
                <div className="text-right">
                  <div className="text-[0.5625rem] uppercase tracking-[0.22em] text-white/50 font-semibold">
                    Emitida por
                  </div>
                  <div className="font-display font-extrabold text-[13px] tracking-tight text-white mt-0.5">
                    {issuer ?? "Macroly Bank"}
                  </div>
                </div>
              </div>

              {/* Number */}
              <div className="select-none">
                <CardNumberDisplay digits={digits} />
              </div>

              {/* Bottom row */}
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[0.5625rem] uppercase tracking-[0.18em] text-white/55 font-semibold mb-1">
                    Titular
                  </div>
                  <div className="text-[13px] font-bold tracking-wide truncate">
                    {holder ? holder.toUpperCase() : "NOMBRE DEL TITULAR"}
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="text-[0.5625rem] uppercase tracking-[0.18em] text-white/55 font-semibold mb-1">
                    Vence
                  </div>
                  <div className="text-[13px] font-bold font-mono tabular-nums">
                    {expiry || "MM/AA"}
                  </div>
                </div>
                <div className="shrink-0 self-end pb-0.5">
                  <BrandMark brand={brand} />
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Back face ---------- */}
          <div
            className="card3d-face card3d-back rounded-2xl shadow-card overflow-hidden relative"
            style={{ background: BRAND_SURFACES[brand] }}
          >
            <div
              className="absolute inset-0 opacity-[0.13] mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: NOISE_DATA_URI }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="h-10 bg-black/85 mt-6" aria-hidden="true" />
              <div className="px-5 pt-4">
                {/* Signature panel + CVV */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-9 rounded relative overflow-hidden"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, #f5f5f4 0px, #f5f5f4 4px, #e7e5e4 4px, #e7e5e4 8px)",
                    }}
                    aria-hidden="true"
                  />
                  <div className="bg-white/95 h-9 w-20 rounded flex items-center justify-center">
                    <span className="font-mono text-sm text-text tabular-nums tracking-[0.2em] font-bold">
                      {cvv ? "•".repeat(Math.max(0, cvv.length - 1)) + cvv.slice(-1) : "CVV"}
                    </span>
                  </div>
                </div>
                <p className="text-[0.625rem] text-white/60 mt-3 leading-snug">
                  Autorizo el cargo de ${total.toLocaleString("es-CO")} a esta tarjeta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Form fields ===== */}
      <div className="space-y-3">
        <Field
          label="Número de tarjeta"
          error={submitted ? errors.number : undefined}
          helper={
            issuer
              ? `Detectamos ${brandLabel[brand]} · ${issuer}`
              : brand !== "unknown"
              ? `Detectamos ${brandLabel[brand]}`
              : "16 dígitos al frente de tu tarjeta"
          }
        >
          {(p) => (
            <div className="relative">
              <input
                {...p}
                inputMode="numeric"
                autoComplete="cc-number"
                value={formatCardNumber(number)}
                onChange={(e) => setNumber(e.target.value)}
                onFocus={() => setFlipped(false)}
                placeholder="0000 0000 0000 0000"
                className="w-full h-12 rounded-xl border border-border bg-card pl-3.5 pr-12 text-base font-mono tabular-nums tracking-wider text-text placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)] outline-none transition-all"
              />
              {brand !== "unknown" && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-[fadeUp_0.3s_ease]"
                  aria-hidden="true"
                >
                  <BrandMark brand={brand} small />
                </span>
              )}
            </div>
          )}
        </Field>

        <Field
          label="Titular"
          error={submitted ? errors.holder : undefined}
          helper="Como aparece en la tarjeta"
        >
          {(p) => (
            <input
              {...p}
              autoComplete="cc-name"
              value={holder}
              onChange={(e) => setHolder(e.target.value.replace(/[0-9]/g, ""))}
              onFocus={() => setFlipped(false)}
              placeholder="Nombre Apellido"
              className="w-full h-12 rounded-xl border border-border bg-card px-3.5 text-base uppercase tracking-wide text-text placeholder:text-muted/70 placeholder:normal-case focus:border-primary focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)] outline-none transition-all"
            />
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Vencimiento" error={submitted ? errors.expiry : undefined}>
            {(p) => (
              <input
                {...p}
                inputMode="numeric"
                autoComplete="cc-exp"
                value={formatExpiry(expiry)}
                onChange={(e) => setExpiry(e.target.value)}
                onFocus={() => setFlipped(false)}
                placeholder="MM/AA"
                className="w-full h-12 rounded-xl border border-border bg-card px-3.5 text-base font-mono tabular-nums text-text placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)] outline-none transition-all"
              />
            )}
          </Field>
          <Field label="CVV" error={submitted ? errors.cvv : undefined}>
            {(p) => (
              <input
                {...p}
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onFocus={() => setFlipped(true)}
                onBlur={() => setFlipped(false)}
                placeholder="•••"
                className="w-full h-12 rounded-xl border border-border bg-card px-3.5 text-base font-mono tabular-nums text-text placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)] outline-none transition-all"
              />
            )}
          </Field>
        </div>

        {/* Cuotas */}
        <fieldset className="border-0 p-0 m-0 pt-1">
          <legend className="text-sm font-semibold text-text mb-2 w-full">
            Diferir a cuotas
          </legend>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
            {cuotasList.map((n) => {
              const active = cuotas === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCuotas(n)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 rounded-xl text-xs font-bold transition-all border min-w-[68px]",
                    active
                      ? "bg-primary-dark text-white border-primary-dark shadow-[0_4px_14px_-4px_rgba(27,61,42,0.5)]"
                      : "bg-card text-sub border-border-l hover:border-border active:scale-95"
                  )}
                  style={{ padding: "10px 12px" }}
                >
                  <div className="font-display font-extrabold text-base leading-none tabular-nums">
                    {n}x
                  </div>
                  <div className={cn("text-[0.5625rem] uppercase tracking-[0.14em] mt-0.5 leading-none", active ? "text-white/70" : "text-muted")}>
                    {n === 1 ? "Único pago" : `$${Math.ceil(total / n).toLocaleString("es-CO")}`}
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-13 rounded-xl bg-primary-dark text-white font-bold text-base mt-6 flex items-center justify-center gap-2 active:scale-[0.985] transition-transform shadow-[0_8px_22px_-8px_rgba(27,61,42,0.55)]"
        style={{ height: 52 }}
      >
        <Lock size={14} aria-hidden="true" />
        {brand !== "unknown" ? `Pagar con ${brandLabel[brand]} · ` : "Pagar "}
        <span className="tabular-nums">${total.toLocaleString("es-CO")}</span>
      </button>

    </div>
  );
}

/* ============================================================ */
/* Subcomponents                                                 */
/* ============================================================ */

function ChipMark() {
  return (
    <svg viewBox="0 0 36 28" width="36" height="28" aria-hidden="true" className="drop-shadow-sm">
      <defs>
        <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="36" height="28" rx="4" fill="url(#chipGrad)" />
      {/* EMV grid lines */}
      <g stroke="rgba(0,0,0,0.28)" strokeWidth="0.7">
        <line x1="0" y1="9" x2="36" y2="9" />
        <line x1="0" y1="19" x2="36" y2="19" />
        <line x1="11" y1="0" x2="11" y2="28" />
        <line x1="25" y1="0" x2="25" y2="28" />
      </g>
      {/* Center contact */}
      <rect x="13" y="11" width="10" height="6" rx="0.8" fill="rgba(255,255,255,0.18)" />
      {/* Subtle highlight */}
      <rect x="1" y="1" width="34" height="3" rx="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

function ContactlessMark() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true" className="text-white/75">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M5 5 Q 8 9 5 13" />
        <path d="M8.5 3 Q 13 9 8.5 15" />
        <path d="M12 1.5 Q 18 9 12 16.5" />
      </g>
    </svg>
  );
}

/**
 * Card number with refined empty-state: dots are properly spaced and the
 * filled portion has a slight emboss via text-shadow.
 */
function CardNumberDisplay({ digits }: { digits: string }) {
  // Build a 16-slot display. Math.max guards against cards longer than 16 digits
  // (some Colombian debit cards have 19) — we just truncate the visualisation.
  const padding = Math.max(0, 16 - digits.length);
  const padded = (digits + "•".repeat(padding)).slice(0, 16);
  const groups = [padded.slice(0, 4), padded.slice(4, 8), padded.slice(8, 12), padded.slice(12, 16)];
  const filledCount = Math.min(digits.length, 16);

  return (
    <div className="flex items-center gap-3 font-mono text-[19px] tabular-nums tracking-[0.08em]">
      {groups.map((g, gi) => (
        <span key={gi} className="flex gap-[3px]">
          {g.split("").map((ch, ci) => {
            const idx = gi * 4 + ci;
            const isPlaceholder = idx >= filledCount;
            // Mask filled digits except last 4
            const display = isPlaceholder ? "•" : idx < 12 ? "•" : ch;
            return (
              <span
                key={ci}
                className={cn(
                  "inline-block w-[12px] text-center transition-opacity",
                  isPlaceholder ? "text-white/30" : "text-white"
                )}
                style={{ textShadow: isPlaceholder ? "none" : "0 1px 0 rgba(0,0,0,0.25)" }}
              >
                {display}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}

/* Brand wordmark — reused on card preview and inside number input. */
function BrandMark({ brand, small = false }: { brand: CardBrand; small?: boolean }) {
  const scale = small ? 0.72 : 1;
  if (brand === "visa") {
    return (
      <span
        className="font-display italic font-extrabold tracking-tight text-white"
        style={{ fontSize: 22 * scale, color: small ? "#1A1F71" : "white" }}
      >
        VISA
      </span>
    );
  }
  if (brand === "mastercard") {
    const W = 34 * scale, H = 22 * scale;
    return (
      <span className="relative inline-block" style={{ width: W, height: H }} aria-hidden="true">
        <span
          className="absolute left-0 top-0 rounded-full bg-[#EB001B]"
          style={{ width: H, height: H }}
        />
        <span
          className="absolute right-0 top-0 rounded-full bg-[#F79E1B] mix-blend-multiply"
          style={{ width: H, height: H }}
        />
      </span>
    );
  }
  if (brand === "amex") {
    return (
      <span
        className="font-display font-extrabold tracking-tight bg-white text-[#006FCF] rounded-sm"
        style={{
          fontSize: 11 * scale,
          padding: small ? "2px 5px" : "3px 6px",
        }}
      >
        AMEX
      </span>
    );
  }
  if (brand === "diners") {
    return (
      <span
        className={cn(
          "font-display font-extrabold tracking-tight",
          small ? "text-text" : "text-white/80"
        )}
        style={{ fontSize: 11 * scale }}
      >
        DINERS
      </span>
    );
  }
  // unknown — show nothing (the issuer header already handles the branding)
  return null;
}
