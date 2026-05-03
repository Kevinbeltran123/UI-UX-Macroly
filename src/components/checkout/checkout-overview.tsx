"use client";

import dynamic from "next/dynamic";
import { ChevronRight, MapPin, Zap, Clock, ArrowRight } from "lucide-react";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_ORDER,
  type PaymentMethod,
} from "@/domain/payment/method";
import {
  DELIVERY_SPEED_FEE,
  DELIVERY_SPEED_ETA,
  type Delivery,
  type DeliverySpeed,
} from "@/domain/delivery/delivery";
import { NequiLogo } from "./logos/nequi-logo";
import { DaviplataLogo } from "./logos/daviplata-logo";
import { BrebLogo } from "./logos/breb-logo";
import { VisaMasterLogo } from "./logos/visa-master-logo";
import { CashLogo } from "./logos/cash-logo";
import { cn } from "@/lib/cn";

const DeliveryMapPreview = dynamic(
  () => import("./delivery-map-preview").then((m) => m.DeliveryMapPreview),
  {
    ssr: false,
    loading: () => (
      <div className="h-[180px] w-full bg-border-l animate-pulse" aria-hidden="true" />
    ),
  }
);

type Props = {
  subtotal: number;
  itemCount: number;
  delivery: Delivery | null;
  method: PaymentMethod | null;
  onEditLocation: () => void;
  onEditMethod: () => void;
  onChangeSpeed: (speed: DeliverySpeed) => void;
  onContinue: () => void;
};

export function CheckoutOverview({
  subtotal,
  itemCount,
  delivery,
  method,
  onEditLocation,
  onEditMethod,
  onChangeSpeed,
  onContinue,
}: Props) {
  const fee = delivery ? DELIVERY_SPEED_FEE[delivery.speed] : 0;
  const total = subtotal + fee;
  const ready = delivery !== null && method !== null;

  return (
    <div className="-mx-5 -mt-5">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO: map preview (when set) or invitation (when not)   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={onEditLocation}
        className="group relative block w-full overflow-hidden text-left active:opacity-95 transition-opacity"
        aria-label={delivery ? "Editar ubicación de entrega" : "Confirmar ubicación de entrega"}
      >
        {delivery ? (
          <>
            <DeliveryMapPreview lat={delivery.lat} lng={delivery.lng} height={200} />
            {/* Bottom address pill, floating on the map */}
            <div className="absolute inset-x-4 bottom-4 bg-card/95 backdrop-blur-md rounded-xl shadow-card px-4 py-3 flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0" aria-hidden="true">
                <MapPin size={16} className="text-primary-dark" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-extrabold text-[14px] text-text leading-tight truncate">
                  {delivery.address}
                </p>
                <p className="text-[0.6875rem] text-sub truncate mt-0.5">
                  {delivery.details || "Tocar para editar"}
                </p>
              </div>
              <ChevronRight size={16} className="text-muted shrink-0" aria-hidden="true" />
            </div>
            {/* Top-right accent */}
            <div className="absolute top-4 left-4 bg-primary-dark text-white text-[0.625rem] uppercase tracking-[0.16em] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-soft animate-pulse" aria-hidden="true" />
              Entregamos aquí
            </div>
          </>
        ) : (
          <div className="relative h-[200px] bg-gradient-to-br from-primary-dark via-primary to-primary-mid overflow-hidden flex items-center justify-center">
            {/* Decorative grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-15" aria-hidden="true">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            {/* Pulsing pin */}
            <div className="relative z-10 text-center px-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 mb-3" aria-hidden="true">
                <MapPin size={26} className="text-white" />
              </div>
              <p className="font-display font-extrabold text-white text-lg leading-tight">
                ¿A dónde lo enviamos?
              </p>
              <p className="text-white/80 text-xs mt-1.5 mb-4 max-w-[260px]">
                Confirma tu dirección para calcular el tiempo de entrega
              </p>
              <span className="inline-flex items-center gap-1.5 bg-white text-primary-dark text-[12px] font-bold px-4 py-2 rounded-full">
                Confirmar ubicación
                <ArrowRight size={13} aria-hidden="true" />
              </span>
            </div>
          </div>
        )}
      </button>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Body                                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="px-5 pt-6">
        {/* ── Speed chips ─────────────────────────────────── */}
        {delivery && (
          <section className="mb-7">
            <SectionLabel>Tipo de entrega</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {(["standard", "fast"] as const).map((speed) => {
                const active = delivery.speed === speed;
                const speedFee = DELIVERY_SPEED_FEE[speed];
                return (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => onChangeSpeed(speed)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl py-2.5 px-3 text-left transition-all border",
                      active
                        ? "bg-primary-dark border-primary-dark text-white shadow-[0_4px_14px_-4px_rgba(27,61,42,0.45)]"
                        : "bg-card border-border-l text-text active:scale-[0.98]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5">
                        {speed === "fast"
                          ? <Zap size={13} className={cn(active ? "fill-white text-white" : "fill-primary-dark text-primary-dark")} aria-hidden="true" />
                          : <Clock size={13} className={cn(active ? "text-white" : "text-sub")} aria-hidden="true" />}
                        <span className="text-[13px] font-bold">
                          {speed === "fast" ? "Rápido" : "Estándar"}
                        </span>
                      </span>
                      <span className={cn("text-[0.6875rem] font-bold tabular-nums", active ? "text-white" : speedFee === 0 ? "text-primary-dark" : "text-muted")}>
                        {speedFee === 0 ? "Gratis" : `+$${speedFee.toLocaleString("es-CO")}`}
                      </span>
                    </div>
                    <p className={cn("text-[0.6875rem]", active ? "text-white/75" : "text-sub")}>
                      {DELIVERY_SPEED_ETA[speed]}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Payment method ──────────────────────────────── */}
        <section className="mb-7">
          <div className="flex items-center justify-between mb-2.5">
            <SectionLabel className="!mb-0">Método de pago</SectionLabel>
            {method && (
              <button
                type="button"
                onClick={onEditMethod}
                className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-primary-dark active:opacity-60"
              >
                Cambiar
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onEditMethod}
            className={cn(
              "w-full flex items-center gap-3 text-left transition-all",
              method
                ? "bg-card rounded-2xl border-2 border-primary-dark p-3 active:scale-[0.99]"
                : "bg-card rounded-2xl border-2 border-dashed border-border p-3 active:scale-[0.99]"
            )}
          >
            {method ? (
              <>
                <span
                  className="w-[68px] h-11 rounded-lg flex items-center justify-center shrink-0 bg-white border border-border-l overflow-hidden"
                  aria-hidden="true"
                >
                  <BrandMark id={method} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[15px] text-text leading-tight">
                    {PAYMENT_METHODS[method].label}
                  </span>
                  <span className="block text-[0.6875rem] text-sub truncate mt-0.5">
                    {PAYMENT_METHODS[method].tagline}
                  </span>
                </span>
                <ChevronRight size={16} className="text-muted shrink-0" aria-hidden="true" />
              </>
            ) : (
              <>
                <span className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center shrink-0" aria-hidden="true">
                  <span className="text-primary-dark text-xl font-extrabold leading-none">+</span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[15px] text-text leading-tight">
                    Elegir método de pago
                  </span>
                  <span className="block text-[0.6875rem] text-sub truncate mt-0.5">
                    Tarjeta, Nequi, Daviplata, Bre-B o efectivo
                  </span>
                </span>
                <ChevronRight size={16} className="text-muted shrink-0" aria-hidden="true" />
              </>
            )}
          </button>
        </section>

        {/* ── Order summary as a ticket ───────────────────── */}
        <section className="mb-6">
          <SectionLabel>Resumen del pedido</SectionLabel>
          <div className="relative receipt-edge bg-card mx-auto rounded-md shadow-sm px-5 py-5">
            <div className="space-y-2.5 text-[13px]">
              <TicketRow
                label={`Subtotal · ${itemCount} producto${itemCount !== 1 ? "s" : ""}`}
                value={`$${subtotal.toLocaleString("es-CO")}`}
              />
              <TicketRow
                label="Domicilio"
                value={fee === 0 ? "Gratis" : `$${fee.toLocaleString("es-CO")}`}
                accent={fee === 0 ? "primary" : undefined}
              />
            </div>
            <div className="border-t border-dashed border-border my-4" aria-hidden="true" />
            <div className="flex items-baseline justify-between">
              <span className="text-[0.625rem] uppercase tracking-[0.18em] text-muted font-bold">
                Total a pagar
              </span>
              <span className="font-display font-extrabold text-[28px] leading-none text-text tabular-nums">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onContinue}
          disabled={!ready}
          className={cn(
            "w-full rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-2",
            ready
              ? "bg-primary-dark text-white shadow-[0_8px_22px_-8px_rgba(27,61,42,0.55)] active:scale-[0.985]"
              : "bg-border text-muted cursor-not-allowed"
          )}
          style={{ height: 54 }}
        >
          {ready ? (
            <>
              Continuar
              <span className="text-white/55" aria-hidden="true">·</span>
              <span className="tabular-nums">${total.toLocaleString("es-CO")}</span>
            </>
          ) : !delivery ? (
            "Confirma tu ubicación"
          ) : !method ? (
            "Elige un método de pago"
          ) : (
            "Completa los datos"
          )}
        </button>
      </div>
    </div>
  );
}

/* ───────────── helpers ───────────── */

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[0.625rem] uppercase tracking-[0.22em] font-bold text-muted mb-3 px-1",
        className
      )}
    >
      {children}
    </p>
  );
}

function TicketRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sub">{label}</span>
      <span
        className={cn(
          "font-mono tabular-nums font-bold",
          accent === "primary" ? "text-primary-dark" : "text-text"
        )}
      >
        {value}
      </span>
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

export { PAYMENT_METHOD_ORDER };
