"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart, Check, RotateCw, X } from "lucide-react";
import Link from "next/link";
import { useToastStore } from "@/stores/toast-store";
import Image from "next/image";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { useCart } from "@/hooks/use-cart";
import { createClient } from "@/lib/supabase/client";
import { DAY_CODES, toggleDay, daysText, type DayCode } from "@/domain/orders/recurring-order";
import { nextComboName } from "@/domain/favorites/favorite-combo";
import { useGoalsStore } from "@/stores/goals-store";
import { PurchasePeriodSelector } from "@/components/period/purchase-period-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import type { FavoriteCombo } from "@/domain/favorites/favorite-combo";

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
  const [showCheckout, setShowCheckout] = useState(false);
  const [recurDays, setRecurDays] = useState<DayCode[]>(["L"]);
  const [saving, setSaving] = useState(false);

  const handlePay = async () => {
    if (items.length === 0) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) { setSaving(false); return; }
    const user = data.user;
    await supabase.from("orders").insert({
      user_id: user.id, items,
      total_protein: totals.protein, total_carbs: totals.carbs,
      total_fat: totals.fat, total_calories: totals.calories,
      total_price: totals.price, status: "paid",
    });
    setSaving(false);
    toast("¡Pedido confirmado!", "success");
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
    <div className="px-5 pt-4 pb-4 relative animate-[fadeUp_0.3s_ease]">
      <h1 className="font-display font-extrabold text-xl text-text mb-4">Mi Carrito</h1>

      {/* Macro progress — sticky with frosted glass + soft downward drop shadow */}
      <div className="sticky top-0 z-30 -mx-5 px-5 pt-2 pb-3 bg-bg/90 backdrop-blur-md shadow-[0_6px_16px_-8px_rgba(26,26,24,0.12)]">
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

      <PurchasePeriodSelector />

      {/* Empty state */}
      {items.length === 0 && !showCheckout && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-xl bg-border-l mx-auto mb-3.5 flex items-center justify-center">
            <ShoppingCart size={22} className="text-muted" aria-hidden="true" />
          </div>
          <p className="text-sm text-sub mb-4">Agrega productos del catálogo</p>
          <Link href="/catalogo" className="inline-block px-7 py-2.5 rounded-xl bg-primary text-white font-bold text-sm no-underline">
            Ir al catálogo
          </Link>
        </div>
      )}

      {/* Cart items — staggered entrance */}
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
            <span className="text-[10px] text-muted">
              P:{item.protein * item.qty}g · C:{item.carbs * item.qty}g · G:{item.fat * item.qty}g
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => remove(item.id)}
              className="w-7 h-7 rounded-lg bg-border-l text-sub flex items-center justify-center transition-all duration-100 active:bg-border active:scale-90"
              aria-label="Reducir cantidad"
            >
              <Minus size={12} aria-hidden="true" />
            </button>
            <span className="text-sm font-bold w-5 text-center tabular-nums">{item.qty}</span>
            <button
              onClick={() => handleIncrease(item)}
              className="w-7 h-7 rounded-lg bg-primary-light text-primary flex items-center justify-center transition-all duration-100 active:bg-primary-border active:scale-90"
              aria-label="Aumentar cantidad"
            >
              <Plus size={12} aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}

      {/* Footer */}
      {items.length > 0 && !showCheckout && (
        <>
          <button
            onClick={handleSaveFavorite}
            className="w-full mt-2 mb-4 py-2.5 rounded-xl border border-border text-xs text-sub font-semibold flex items-center justify-center gap-1.5 transition-colors active:bg-border-l"
          >
            <Heart size={13} className="text-muted" aria-hidden="true" />
            Guardar combinación como favorita
          </button>

          <div className="bg-card rounded-xl p-4 border border-border-l">
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-display font-bold text-base text-text">Total</span>
              {/* key={totals.price} remounts the span on price change, retriggering the pop animation */}
              <span
                key={totals.price}
                className="font-display font-extrabold text-xl text-primary tabular-nums inline-block animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
              >
                ${totals.price.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handlePay}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-primary-dark text-white font-bold text-sm disabled:opacity-50 transition-opacity"
            >
              {saving ? "Procesando…" : `Pagar $${totals.price.toLocaleString()}`}
            </button>
            <p className="text-[10px] text-muted text-center mt-2">
              Al pagar podrás guardar y programar recurrencia
            </p>
          </div>
        </>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-100 flex items-end justify-center animate-[overlayFadeIn_260ms_ease_both]">
          <div className="bg-card rounded-t-3xl p-6 pb-10 w-full max-h-[90vh] overflow-y-auto relative animate-[sheetSlideUp_260ms_cubic-bezier(0,0,0.2,1)_both]">
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" aria-hidden="true" />
            <button
              onClick={handleSkipRecurring}
              className="absolute top-5 right-5 text-muted"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary-light mx-auto mb-3 flex items-center justify-center">
                <Check size={22} className="text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-display font-extrabold text-xl text-text">¡Pedido confirmado!</h3>
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
                <p className="text-[11px] text-sub mb-2">
                  ~{Math.max(0, Math.floor(Math.min(
                    totals.protein / (storeGoals.protein || 1),
                    totals.carbs / (storeGoals.carbs || 1),
                    totals.fat / (storeGoals.fat || 1),
                  )))} día(s) de cobertura
                </p>
              )}
              <p className="text-[11px] text-sub mb-2.5">Elige los días de entrega:</p>
              <div className="grid grid-cols-7 gap-1 mb-3">
                {DAY_CODES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setRecurDays((prev) => toggleDay(prev, d))}
                    className={cn(
                      "h-9 rounded-lg text-[11px] font-bold transition-all",
                      recurDays.includes(d)
                        ? "bg-primary text-white"
                        : "bg-card border border-border text-sub"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {recurDays.length > 0 && (
                <p className="text-[11px] text-primary font-semibold mb-3">
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
          </div>
        </div>
      )}
    </div>
  );
}
