"use client";

import type { ReactNode } from "react";
import type { PaymentMethod } from "@/domain/payment/method";

/**
 * Branded "amount sheet" that sits at the top of every non-card payment form.
 * Mirrors the credit-card preview's visual weight: the user always sees the
 * total prominently, with the brand mark as a controlled accent — never the
 * other way around.
 */

type Props = {
  total: number;
  surfaceCss: string;
  logo: ReactNode;
  /** Optional tagline shown next to the COP indicator. */
  tagline?: string;
  /** Optional content rendered below a divider inside the hero (e.g., merchant info). */
  footer?: ReactNode;
};

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")";

export function PaymentHero({ total, surfaceCss, logo, tagline, footer }: Props) {
  return (
    <div
      className="rounded-2xl overflow-hidden text-white relative shadow-card mb-5"
      style={{ background: surfaceCss }}
    >
      {/* Matte noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.13] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: NOISE_DATA_URI }}
        aria-hidden="true"
      />
      {/* Diagonal sheen */}
      <div
        className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] pointer-events-none rotate-[-20deg]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[0.625rem] uppercase tracking-[0.22em] font-semibold text-white/60">
              Total a pagar
            </p>
            <p className="font-display font-extrabold text-[40px] leading-none tabular-nums text-white mt-2">
              ${total.toLocaleString("es-CO")}
            </p>
            <p className="text-[0.6875rem] text-white/70 mt-2 font-semibold">
              COP{tagline ? ` · ${tagline}` : ""}
            </p>
          </div>
          <div className="shrink-0 bg-white rounded-lg px-2.5 py-1.5 flex items-center justify-center shadow-sm">
            {logo}
          </div>
        </div>

        {footer && (
          <div className="mt-4 pt-3 border-t border-white/15 text-[0.6875rem] text-white/75">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* Per-method hero gradients. Each one mirrors how that brand "feels". */
export const PAYMENT_HERO_SURFACES: Record<PaymentMethod, string> = {
  card: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.18) 0%, transparent 40%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.42) 0%, transparent 55%),
    linear-gradient(135deg, #0B2317 0%, #1B3D2A 45%, #2D6A4F 100%)`,
  nequi: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.20) 0%, transparent 38%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.42) 0%, transparent 55%),
    linear-gradient(135deg, #5B0035 0%, #A30062 35%, #DA0081 70%, #ED4BA4 100%)`,
  daviplata: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.18) 0%, transparent 38%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.45) 0%, transparent 55%),
    linear-gradient(135deg, #6E0008 0%, #B11018 35%, #ED1C27 70%, #F4525A 100%)`,
  breb: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.20) 0%, transparent 38%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.42) 0%, transparent 55%),
    linear-gradient(135deg, #03302F 0%, #075857 35%, #0E7C7B 70%, #2DA39E 100%)`,
  cash: `
    radial-gradient(circle at 25% 15%, rgba(255,255,255,0.20) 0%, transparent 40%),
    radial-gradient(circle at 92% 95%, rgba(0,0,0,0.40) 0%, transparent 55%),
    linear-gradient(135deg, #0B2317 0%, #1B3D2A 45%, #2D6A4F 100%)`,
};
