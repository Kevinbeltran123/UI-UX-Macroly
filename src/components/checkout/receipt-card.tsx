"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { PAYMENT_METHODS, type PaymentMethod } from "@/domain/payment/method";
import type { PaymentMeta } from "@/domain/payment/simulation";
import {
  type Delivery,
  DELIVERY_SPEED_ETA,
} from "@/domain/delivery/delivery";

type Props = {
  method: PaymentMethod;
  /** Total includes delivery fee. */
  total: number;
  itemCount: number;
  transactionRef: string;
  meta: PaymentMeta;
  delivery: Delivery;
  deliveryFee: number;
  onContinue: () => void;
};

export function ReceiptCard({
  method,
  total,
  itemCount,
  transactionRef,
  meta,
  delivery,
  deliveryFee,
  onContinue,
}: Props) {
  const config = PAYMENT_METHODS[method];
  const [copied, setCopied] = useState(false);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(transactionRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* ignore — clipboard not available */ }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="pt-1">
      {/* Animated checkmark */}
      <div className="text-center mb-5">
        <div className="relative w-20 h-20 mx-auto mb-3">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke={config.accent}
              strokeWidth="3"
              strokeDasharray="226"
              strokeDashoffset="226"
              style={{ animation: "circleDraw 0.55s ease forwards" }}
            />
            <circle cx="40" cy="40" r="32" fill={config.accentSoft} />
            <path
              d="M26 41 L36 51 L55 31"
              fill="none"
              stroke={config.accent}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="50"
              strokeDashoffset="50"
              style={{ animation: "checkDraw 0.4s ease 0.45s forwards" }}
            />
          </svg>
        </div>
        <h3 className="font-display font-extrabold text-2xl text-text">
          ¡Pago confirmado!
        </h3>
        <p className="text-sm text-sub mt-0.5">
          Procesado por {config.label}
        </p>
      </div>

      {/* Receipt body — perforated edges */}
      <div className="relative receipt-edge bg-card mx-auto max-w-md rounded-md shadow-card px-5 py-6 mb-5">
        <div className="text-center mb-4">
          <p className="font-display font-extrabold text-base tracking-tight text-text">
            Macroly
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted mt-0.5">
            Comprobante de pago
          </p>
        </div>

        <div className="border-t border-dashed border-border my-4" aria-hidden="true" />

        <dl className="space-y-2.5 text-xs">
          <Row label="Fecha"  value={`${dateStr} · ${timeStr}`} />
          <Row label="Método" value={
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.accent }} aria-hidden="true" />
              {config.label}
            </span>
          } />
          {method === "card" && meta.last4 && (
            <>
              <Row label="Tarjeta" value={`•••• ${String(meta.last4)}`} mono />
              {meta.issuer && <Row label="Banco" value={String(meta.issuer)} />}
              {meta.cuotas && Number(meta.cuotas) > 1 && (
                <Row label="Cuotas" value={String(meta.cuotas)} />
              )}
            </>
          )}
          {(method === "nequi" || method === "daviplata") && meta.phone && (
            <Row label="Celular" value={formatPhoneDisplay(String(meta.phone))} mono />
          )}
          {method === "breb" && meta.mode === "qr" && (
            <Row label="Origen" value="Escaneado desde app del banco" />
          )}
          {method === "breb" && meta.mode === "llave" && meta.llave && (
            <Row label="Llave" value={String(meta.llave)} mono />
          )}
          {method === "cash" && meta.paidAmount && (
            <Row
              label="Vuelto"
              value={`$${Math.max(0, Number(meta.paidAmount) - total).toLocaleString("es-CO")}`}
              mono
            />
          )}
          <Row label="Productos" value={`${itemCount} ítem${itemCount !== 1 ? "s" : ""}`} />
        </dl>

        <div className="border-t border-dashed border-border my-4" aria-hidden="true" />

        {/* Delivery section */}
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted font-bold mb-2">
          Entrega
        </p>
        <dl className="space-y-2.5 text-xs">
          <Row label="Dirección" value={delivery.address} />
          {delivery.details && <Row label="Detalles" value={delivery.details} />}
          {delivery.instructions && (
            <Row label="Instrucciones" value={delivery.instructions} />
          )}
          <Row
            label={delivery.speed === "fast" ? "Entrega rápida" : "Entrega estándar"}
            value={DELIVERY_SPEED_ETA[delivery.speed]}
          />
          <Row
            label="Domicilio"
            value={deliveryFee === 0 ? "Gratis" : `$${deliveryFee.toLocaleString("es-CO")}`}
            mono={deliveryFee > 0}
          />
        </dl>

        <div className="border-t border-dashed border-border my-4" aria-hidden="true" />

        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-[0.16em] text-muted font-bold">Total</span>
          <span className="font-display font-extrabold text-2xl text-text tabular-nums">
            ${total.toLocaleString("es-CO")}
          </span>
        </div>

        <div className="border-t border-dashed border-border my-4" aria-hidden="true" />

        {/* Transaction ref */}
        <button
          type="button"
          onClick={copyRef}
          className="w-full bg-bg rounded-lg px-3 py-2.5 flex items-center justify-between hover:bg-border-l transition-colors"
        >
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted font-bold">
            Ref. transacción
          </span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-text tracking-wider">
              {transactionRef}
            </span>
            {copied ? (
              <Check size={12} className="text-primary" aria-hidden="true" />
            ) : (
              <Copy size={12} className="text-muted" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full py-3.5 rounded-xl bg-primary-dark text-white font-bold text-sm active:scale-[0.985] transition-transform"
      >
        Continuar
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd
        className={`text-right text-text font-semibold min-w-0 ${
          mono ? "font-mono tabular-nums" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatPhoneDisplay(digits: string): string {
  if (digits.length !== 10) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
