"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { calculateChange, suggestedBills } from "@/domain/payment/validation";
import { cn } from "@/lib/cn";
import { CashLogo } from "../logos/cash-logo";
import { PaymentHero, PAYMENT_HERO_SURFACES } from "../payment-hero";

export type CashFormState = {
  paidAmount: number | null;
};

type Props = {
  total: number;
  onSubmit: (form: CashFormState) => void;
};

export function CashForm({ total, onSubmit }: Props) {
  const [paidRaw, setPaidRaw] = useState("");

  const paidAmount = paidRaw ? Number(paidRaw.replace(/\D/g, "")) : null;

  const result = useMemo(() => calculateChange(total, paidAmount), [total, paidAmount]);
  const suggestions = useMemo(() => suggestedBills(total), [total]);

  const valid = paidAmount === null || result.status !== "short";

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit({ paidAmount });
  };

  return (
    <div>
      <PaymentHero
        total={total}
        surfaceCss={PAYMENT_HERO_SURFACES.cash}
        logo={<CashLogo width={56} height={28} />}
        tagline="Pago contra entrega"
        footer={
          <div className="flex items-center justify-between">
            <span>Pagas al recibir</span>
            <span className="font-display font-bold text-white">Macroly</span>
          </div>
        }
      />

      <div className="mt-2">
        <label htmlFor="cash-paid-amount" className="block text-sm font-semibold text-text mb-1.5">
          ¿Con cuánto vas a pagar?
        </label>
        <p className="text-[11px] text-sub leading-snug mb-2.5">
          Te llevamos el vuelto preparado al momento de la entrega.
        </p>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm font-mono" aria-hidden="true">
            $
          </span>
          <input
            id="cash-paid-amount"
            inputMode="numeric"
            value={paidRaw ? Number(paidRaw.replace(/\D/g, "")).toLocaleString("es-CO") : ""}
            onChange={(e) => setPaidRaw(e.target.value)}
            placeholder="0"
            className="w-full h-12 rounded-xl border border-border bg-card pl-7 pr-3.5 text-base font-mono tabular-nums text-text placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)] outline-none transition-all"
          />
        </div>

        {/* Quick bill chips */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {suggestions.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setPaidRaw(String(amount))}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-card border border-border-l text-sub active:scale-95 transition-transform"
            >
              {amount === total ? "Pago exacto" : `$${amount.toLocaleString("es-CO")}`}
            </button>
          ))}
        </div>

        {/* Vuelto display */}
        <div
          className={cn(
            "mt-3 rounded-xl p-3 border transition-colors",
            result.status === "over"  && "bg-primary-light border-primary-border",
            result.status === "exact" && "bg-primary-light border-primary-border",
            result.status === "short" && "bg-[#FEE2E2] border-[#FCA5A5]",
            result.status === "empty" && "bg-card border-border-l"
          )}
        >
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-wider",
                result.status === "short" ? "text-error" : "text-sub"
              )}
            >
              {result.status === "over"  ? "Vuelto"  :
               result.status === "exact" ? "Pago exacto" :
               result.status === "short" ? "Faltante" :
                                           "Esperando monto"}
            </p>
            {result.status === "over" && (
              <p className="font-display font-extrabold text-lg text-primary tabular-nums">
                ${result.change.toLocaleString("es-CO")}
              </p>
            )}
            {result.status === "short" && result.suggestion && (
              <button
                type="button"
                onClick={() => setPaidRaw(String(result.suggestion))}
                className="text-[11px] font-bold text-error flex items-center gap-1 active:opacity-60"
              >
                Sube a ${result.suggestion.toLocaleString("es-CO")}
                <ArrowRight size={11} aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="text-xs text-sub mt-0.5">{result.hint}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!valid}
        className="w-full mt-6 rounded-xl bg-primary-dark text-white font-bold text-base disabled:opacity-40 active:scale-[0.985] transition-transform shadow-[0_8px_22px_-8px_rgba(27,61,42,0.55)]"
        style={{ height: 52 }}
      >
        Confirmar pedido contra entrega
      </button>
    </div>
  );
}
