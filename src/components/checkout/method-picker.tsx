"use client";

import { ChevronRight } from "lucide-react";
import {
  PAYMENT_METHOD_ORDER,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/domain/payment/method";
import { NequiLogo } from "./logos/nequi-logo";
import { DaviplataLogo } from "./logos/daviplata-logo";
import { BrebLogo } from "./logos/breb-logo";
import { VisaMasterLogo } from "./logos/visa-master-logo";
import { CashLogo } from "./logos/cash-logo";

type Props = {
  total: number;
  itemCount: number;
  onPick: (m: PaymentMethod) => void;
};

const SUBTITLE: Record<PaymentMethod, string> = {
  card: "Visa, Mastercard, Amex, Diners",
  nequi: "Paga con tu celular",
  daviplata: "Cuenta digital de Davivienda",
  breb: "Pago inmediato interbancario",
  cash: "Pago contra entrega",
};

export function MethodPicker({ total, itemCount, onPick }: Props) {
  return (
    <div>
      {/* ===== Order summary block — editorial, monospaced amount ===== */}
      <div className="mb-5 p-4 bg-card border border-border-l rounded-2xl flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold mb-1">
            Total a pagar
          </p>
          <p className="font-display font-extrabold text-3xl text-text tabular-nums">
            ${total.toLocaleString("es-CO")}
          </p>
          <p className="text-xs text-sub mt-0.5">
            {itemCount} producto{itemCount !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold pb-1.5">
          COP
        </span>
      </div>

      <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold mb-2.5 px-1">
        Elige cómo pagar
      </p>

      <div className="space-y-2">
        {PAYMENT_METHOD_ORDER.map((id, idx) => {
          const config = PAYMENT_METHODS[id];
          return (
            <button
              key={id}
              onClick={() => onPick(id)}
              className="w-full bg-card rounded-2xl p-3 border border-border-l flex items-center gap-3.5 text-left transition-all active:scale-[0.985] active:bg-border-l hover:border-border"
              style={{
                animation: `methodIn 0.4s ease ${idx * 60}ms both`,
              }}
            >
              {/* White brand tile — wordmark gets centre stage */}
              <span
                className="w-[68px] h-[44px] rounded-lg flex items-center justify-center shrink-0 bg-white border border-border-l overflow-hidden"
                aria-hidden="true"
              >
                <BrandMark id={id} />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block font-display font-bold text-[15px] text-text leading-tight">
                  {config.label}
                </span>
                <span className="block text-[11px] text-sub truncate mt-0.5">
                  {SUBTITLE[id]}
                </span>
              </span>

              <ChevronRight size={16} className="text-muted shrink-0" aria-hidden="true" />
            </button>
          );
        })}
      </div>

    </div>
  );
}

function BrandMark({ id }: { id: PaymentMethod }) {
  switch (id) {
    case "card":      return <VisaMasterLogo width={56} height={20} />;
    case "nequi":     return <NequiLogo      width={54} height={20} />;
    case "daviplata": return <DaviplataLogo  width={62} height={18} />;
    case "breb":      return <BrebLogo       width={58} height={22} />;
    case "cash":      return <CashLogo       width={56} height={28} />;
  }
}
