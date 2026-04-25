"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart, Check, RotateCw, X } from "lucide-react";
import { Dialog } from "@/components/a11y/dialog";
import Link from "next/link";
import { useToastStore } from "@/stores/toast-store";
import Image from "next/image";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { useCart } from "@/hooks/use-cart";
import { createClient } from "@/lib/supabase/client";
import { DAY_CODES, toggleDay, daysText, dayName, type DayCode } from "@/domain/orders/recurring-order";
import { nextComboName } from "@/domain/favorites/favorite-combo";
import { useGoalsStore } from "@/stores/goals-store";
import { PurchasePeriodSelector } from "@/components/period/purchase-period-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import type { FavoriteCombo } from "@/domain/favorites/favorite-combo";
import { PaymentSheet, type PaymentSuccess } from "@/components/checkout/payment-sheet";
import { PAYMENT_METHODS } from "@/domain/payment/method";

export default function CarritoPage() {
  const { goals: storeGoals, loading: goalsLoading } = useGoalsStore();
  const { items, totals, goals, add, remove, clear } = useCart(storeGoals);
  const toast = useToastStore((s) => s.add);

  const handleIncrease = (item: typeof items[number]) => {
    const alreadyOverProtein = totals.protein > goals.protein;
    const alreadyOverCarbs   = totals.carbs   > goals.carbs;
    const alreadyOverFat     = totals.fat     > goals.fat;
    add(item);
    const newlyExceeded: string[] = [];
    if (!alreadyOverProtein && totals.protein + item.protein > goals.protein) newlyExceeded.push("proteína");
    if (!alreadyOverCarbs   && totals.carbs   + item.carbs   > goals.carbs)   newlyExceeded.push("carbos");
    if (!alreadyOverFat     && totals.fat     + item.fat     > goals.fat)     newlyExceeded.push("grasas");
    if (newlyExceeded.length > 0) toast(`Meta de ${newlyExceeded.join(" y ")} superada`, "error");
  };

  const [showPayment, setShowPayment] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [recurDays, setRecurDays] = useState<DayCode[]>(["L"]);

  // Open the payment sheet; the sheet drives the rest of the flow.
  const handleStartPayment = () => {
    if (items.length === 0) return;
    setShowPayment(true);
  };

  // Called by PaymentSheet when the simulated transaction is approved.
  const handlePaymentSuccess = async (payload: PaymentSuccess) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      await supabase.from("orders").insert({
        user_id: data.user.id,
        items,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat,
        total_calories: totals.calories,
        total_price: totals.price + payload.deliveryFee,
        status: "paid",
        payment_method: payload.method,
        transaction_ref: payload.transactionRef,
        payment_meta: payload.meta,
        delivery_address: payload.delivery.address,
        delivery_details: payload.delivery.details || null,
        delivery_instructions: payload.delivery.instructions || null,
        delivery_lat: payload.delivery.lat,
        delivery_lng: payload.delivery.lng,
        delivery_speed: payload.delivery.speed,
      });
    }
    setShowPayment(false);
    toast(`Pago aprobado · ${PAYMENT_METHODS[payload.method].label}`, "success");
    setShowCheckout(true);
  };

  const handleSaveFavorite = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return;
    const { data: existing } = await supabase
      .from("favorite_combos").select("id").eq("user_id", data.user.id);
    await supabase.from("favorite_combos").insert({
      user_id: data.user.id,
      name: nextComboName((existing ?? []) as unknown as readonly FavoriteCombo[]),
      items, total_protein: totals.protein, total_carbs: totals.carbs,
      total_fat: totals.fat, total_calories: totals.calories, total_price: totals.price,
    });
    toast("Combinación guardada en favoritos", "success");
  };

  const handleRecurring = async () => {
    if (recurDays.length === 0) return;
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return;
    await supabase.from("recurring_orders").upsert({
      user_id: data.user.id, items, days: recurDays, active: true,
    });
    toast("Recurrencia activada: " + daysText(recurDays), "success");
    clear();
    setShowCheckout(false);
  };

  const handleSkipRecurring = () => {
    toast("Pedido realizado exitosamente", "success");
    clear();
    setShowCheckout(false);
  };

  return (
    /* Constrained-viewport layout: header + items (scrolls) + footer (always visible).
       Height = viewport minus iOS status bar minus bottom nav reservation. */
    <div
      className="px-5 pt-4 flex flex-col relative animate-[fadeUp_0.3s_ease]"
      style={{ height: "calc(100dvh - env(safe-area-inset-top, 0px) - 5rem)" }}
    >
      <h1 className="font-display font-extrabold text-xl text-text mb-3 shrink-0">Mi Carrito</h1>

      <div
        className="shrink-0 mb-3"
        aria-busy={goalsLoading}
        {...(goalsLoading ? { role: "status", "aria-label": "Cargando metas" } : {})}
      >
        {goalsLoading ? (
          <Skeleton className="h-22 w-full rounded-xl" />
        ) : (
          <div className="bg-card rounded-xl p-4 border border-border-l">
            <MacroBar label="Proteína"      current={totals.protein} goal={goals.protein} color="var(--color-protein)" lightColor="var(--color-protein-light)" compact />
            <MacroBar label="Carbohidratos" current={totals.carbs}   goal={goals.carbs}   color="var(--color-carbs)"   lightColor="var(--color-carbs-light)"   compact />
            <MacroBar label="Grasas"        current={totals.fat}     goal={goals.fat}     color="var(--color-fat)"     lightColor="var(--color-fat-light)"     compact />
          </div>
        )}
      </div>

      <div className="shrink-0">
        <PurchasePeriodSelector />
      </div>

      {items.length === 0 && !showCheckout ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-xl bg-border-l mb-3.5 flex items-center justify-center">
            <ShoppingCart size={22} className="text-muted" aria-hidden="true" />
          </div>
          <p className="text-sm text-sub mb-4">Agrega productos del catálogo</p>
          <Link href="/catalogo" className="inline-block px-7 py-2.5 rounded-xl bg-primary text-white font-bold text-sm no-underline">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto -mx-5 px-5 mt-3 pb-1">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-card rounded-xl p-3 mb-2 border border-border-l flex items-center gap-2.5 animate-[staggerFadeUp_0.35s_ease_both]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-linear-to-br from-primary-light to-primary-border relative">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="48px" unoptimized />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-xs text-text truncate">{item.name}</p>
                  <span
                    key={item.qty}
                    className="text-xs text-muted inline-block animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
                  >
                    P:{item.protein * item.qty}g · C:{item.carbs * item.qty}g · G:{item.fat * item.qty}g
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => remove(item.id)}
                    className="w-11 h-11 rounded-lg bg-border-l text-sub flex items-center justify-center transition-all duration-100 active:bg-border active:scale-90"
                    aria-label="Reducir cantidad"
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span
                    key={item.qty}
                    className="text-sm font-bold w-5 text-center tabular-nums inline-block animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => handleIncrease(item)}
                    className="w-11 h-11 rounded-lg bg-primary-light text-primary flex items-center justify-center transition-all duration-100 active:bg-primary-border active:scale-90"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!showCheckout && (
            <div className="shrink-0 pt-2 pb-3">
              <button
                onClick={handleSaveFavorite}
                className="w-full mb-2.5 py-2.5 rounded-xl border border-border text-xs text-sub font-semibold flex items-center justify-center gap-1.5 transition-colors active:bg-border-l"
              >
                <Heart size={13} className="text-muted" aria-hidden="true" />
                Guardar combinación como favorita
              </button>

              <div className="bg-card rounded-xl p-4 border border-border-l">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="font-display font-bold text-base text-text">Total</span>
                  <span
                    key={totals.price}
                    className="font-display font-extrabold text-xl text-primary tabular-nums inline-block animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
                  >
                    ${totals.price.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleStartPayment}
                  className="w-full py-3 rounded-xl bg-primary-dark text-white font-bold text-sm transition-opacity"
                >
                  Pagar ${totals.price.toLocaleString()}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment sheet — multi-step simulated checkout */}
      <PaymentSheet
        open={showPayment}
        onClose={() => setShowPayment(false)}
        subtotal={totals.price}
        itemCount={totals.itemCount}
        onSuccess={handlePaymentSuccess}
      />

      {/* Post-payment recurring prompt — kept from before */}
      <Dialog open={showCheckout} onClose={handleSkipRecurring} title="Pedido confirmado" className="relative">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" aria-hidden="true" />
            <button
              onClick={handleSkipRecurring}
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center text-muted rounded-lg active:bg-border-l transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary-light mx-auto mb-3 flex items-center justify-center">
                <Check size={22} className="text-primary" aria-hidden="true" />
              </div>
              <h2 className="font-display font-extrabold text-xl text-text">¡Pedido confirmado!</h2>
              <p className="text-sm text-sub mt-1">{totals.itemCount} producto{totals.itemCount !== 1 ? "s" : ""} · ${totals.price.toLocaleString()}</p>
            </div>

            <div className="bg-bg rounded-xl p-3 flex gap-4 justify-center mb-4">
              <span className="text-xs font-semibold text-protein">P: {totals.protein}g</span>
              <span className="text-xs font-semibold text-carbs">C: {totals.carbs}g</span>
              <span className="text-xs font-semibold text-fat">G: {totals.fat}g</span>
            </div>

            <button
              onClick={handleSaveFavorite}
              className="w-full py-3 rounded-xl border border-border flex items-center justify-center gap-2 text-sm font-semibold text-sub mb-4 active:bg-border-l transition-colors"
            >
              <Heart size={15} aria-hidden="true" /> Guardar como favorita
            </button>

            <div className="bg-primary-light rounded-xl p-4 border border-primary-border">
              <p className="text-sm font-bold text-text mb-1">¿Repetir cada semana?</p>
              {items.length > 0 && (
                <p className="text-xs text-sub mb-2">
                  ~{Math.max(0, Math.floor(Math.min(
                    totals.protein / (storeGoals.protein || 1),
                    totals.carbs / (storeGoals.carbs || 1),
                    totals.fat / (storeGoals.fat || 1),
                  )))} día(s) de cobertura
                </p>
              )}
              <p className="text-xs text-sub mb-2.5">Elige los días de entrega:</p>
              <div className="grid grid-cols-7 gap-1 mb-3">
                {DAY_CODES.map((d) => {
                  const selected = recurDays.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => setRecurDays((prev) => toggleDay(prev, d))}
                      aria-pressed={selected}
                      aria-label={dayName(d)}
                      className={cn(
                        "h-11 rounded-lg text-xs font-bold transition-all",
                        selected
                          ? "bg-primary text-white"
                          : "bg-card border border-border text-sub"
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              {recurDays.length > 0 && (
                <p className="text-xs text-primary font-semibold mb-3">
                  Entrega: {daysText(recurDays)}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleRecurring}
                  disabled={recurDays.length === 0}
                  className="flex-1 py-2.5 rounded-lg bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCw size={13} aria-hidden="true" /> Activar
                </button>
                <button
                  onClick={handleSkipRecurring}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sub font-semibold text-xs active:bg-border-l transition-colors"
                >
                  Solo esta vez
                </button>
              </div>
            </div>
      </Dialog>

    </div>
  );
}
