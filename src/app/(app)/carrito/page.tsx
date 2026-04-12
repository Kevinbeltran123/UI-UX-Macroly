"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart, Check, RotateCw, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { useCart } from "@/hooks/use-cart";
import { createClient } from "@/lib/supabase/client";
import { DAY_CODES, toggleDay, daysText, type DayCode } from "@/domain/orders/recurring-order";
import { nextComboName } from "@/domain/favorites/favorite-combo";

export default function CarritoPage() {
  const { items, totals, goals, add, remove, clear } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [recurDays, setRecurDays] = useState<DayCode[]>(["L"]);
  const [saving, setSaving] = useState(false);

  const handlePay = async () => {
    if (items.length === 0) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("orders").insert({
      user_id: user.id,
      items: items,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fat: totals.fat,
      total_calories: totals.calories,
      total_price: totals.price,
      status: "paid",
    });

    setSaving(false);
    setShowCheckout(true);
  };

  const handleSaveFavorite = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("favorite_combos")
      .select("id")
      .eq("user_id", user.id);

    await supabase.from("favorite_combos").insert({
      user_id: user.id,
      name: `Combo #${(existing?.length ?? 0) + 1}`,
      items: showCheckout ? items : items,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fat: totals.fat,
      total_calories: totals.calories,
      total_price: totals.price,
    });
  };

  const handleRecurring = async () => {
    if (recurDays.length === 0) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("recurring_orders").upsert({
      user_id: user.id,
      items: items,
      days: recurDays,
      active: true,
    });

    clear();
    setShowCheckout(false);
  };

  const handleSkipRecurring = () => {
    clear();
    setShowCheckout(false);
  };

  return (
    <div className="px-5 pt-4 pb-4 relative">
      <h1 className="font-display font-black text-xl text-text mb-4">Mi Carrito</h1>

      {/* Macro progress */}
      <div className="bg-card rounded-[14px] p-4 border border-border-l mb-4">
        <MacroBar label="Proteina" current={totals.protein} goal={goals.protein} color="var(--color-protein)" lightColor="var(--color-protein-light)" compact />
        <MacroBar label="Carbohidratos" current={totals.carbs} goal={goals.carbs} color="var(--color-carbs)" lightColor="var(--color-carbs-light)" compact />
        <MacroBar label="Grasas" current={totals.fat} goal={goals.fat} color="var(--color-fat)" lightColor="var(--color-fat-light)" compact />
      </div>

      {/* Empty state */}
      {items.length === 0 && !showCheckout && (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-border-l mx-auto mb-3.5 flex items-center justify-center">
            <ShoppingCart size={24} className="text-muted" />
          </div>
          <p className="text-sm text-sub mb-3.5">Agrega productos del catalogo</p>
          <Link href="/catalogo" className="inline-block px-7 py-2.5 rounded-xl bg-primary text-white font-bold text-sm no-underline">
            Ir al catalogo
          </Link>
        </div>
      )}

      {/* Cart items */}
      {items.map((item) => (
        <div key={item.id} className="bg-card rounded-xl p-3 mb-2 border border-border-l flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-[10px] overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-light to-primary-border relative">
            {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="48px" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-xs text-text">{item.name}</p>
            <span className="text-[10px] text-sub">P:{item.protein * item.qty}g · C:{item.carbs * item.qty}g · G:{item.fat * item.qty}g</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => remove(item.id)} className="w-[26px] h-[26px] rounded-lg bg-fat-light flex items-center justify-center" aria-label="Reducir cantidad">
              <Minus size={12} className="text-fat" />
            </button>
            <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
            <button onClick={() => add(item)} className="w-[26px] h-[26px] rounded-lg bg-primary-light flex items-center justify-center" aria-label="Aumentar cantidad">
              <Plus size={12} className="text-primary" />
            </button>
          </div>
        </div>
      ))}

      {/* Footer */}
      {items.length > 0 && !showCheckout && (
        <>
          <button onClick={handleSaveFavorite} className="w-full mt-2 bg-primary-light rounded-xl py-3 border border-primary-border flex items-center justify-center gap-2 text-xs text-primary font-semibold">
            <Heart size={16} /> Guardar combinacion como favorita
          </button>
          <div className="mt-4 bg-card rounded-[14px] p-4 border border-border-l">
            <div className="flex justify-between mb-3.5">
              <span className="font-display font-extrabold text-base">Total</span>
              <span className="font-display font-extrabold text-lg text-primary">${totals.price.toLocaleString()}</span>
            </div>
            <button onClick={handlePay} disabled={saving} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-[#E65100] text-white font-bold text-sm disabled:opacity-50">
              {saving ? "Procesando..." : `Pagar $${totals.price.toLocaleString()}`}
            </button>
            <p className="text-[11px] text-muted text-center mt-1.5">Al pagar podras guardar y programar recurrencia</p>
          </div>
        </>
      )}

      {/* Checkout modal overlay */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto relative">
            <button onClick={handleSkipRecurring} className="absolute top-4 right-4 text-muted" aria-label="Cerrar">
              <X size={18} />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-primary-light mx-auto mb-3.5 flex items-center justify-center">
                <Check size={28} className="text-primary" />
              </div>
              <h3 className="font-display font-black text-xl text-text">Pedido confirmado!</h3>
              <p className="text-sm text-sub mt-1">{totals.itemCount} productos · ${totals.price.toLocaleString()}</p>
            </div>

            {/* Macro summary */}
            <div className="bg-bg rounded-xl p-3 flex gap-3 justify-center mb-4">
              <span className="text-xs font-semibold text-protein">P: {totals.protein}g</span>
              <span className="text-xs font-semibold text-carbs">C: {totals.carbs}g</span>
              <span className="text-xs font-semibold text-fat">G: {totals.fat}g</span>
            </div>

            {/* Save favorite */}
            <button onClick={handleSaveFavorite} className="w-full py-3 rounded-xl bg-card border-2 border-primary-border flex items-center justify-center gap-2 text-sm font-bold text-primary mb-4">
              <Heart size={16} /> Guardar como favorita
            </button>

            {/* Recurring */}
            <div className="bg-accent-light rounded-xl p-4 border border-accent/20">
              <p className="text-sm font-bold text-text mb-2">Repetir cada semana?</p>
              <p className="text-[11px] text-sub mb-2.5">Elige los dias de entrega:</p>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_CODES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setRecurDays((prev) => toggleDay(prev, d))}
                    className={`h-9 rounded-lg text-[11px] font-bold transition-all ${
                      recurDays.includes(d)
                        ? "bg-primary text-white"
                        : "bg-card border border-border text-sub"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {recurDays.length > 0 && (
                <p className="text-[11px] text-primary font-semibold mb-3">Entrega: {daysText(recurDays)}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleRecurring}
                  disabled={recurDays.length === 0}
                  className="flex-1 py-2.5 rounded-[10px] bg-primary text-white font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <RotateCw size={14} /> Activar
                </button>
                <button onClick={handleSkipRecurring} className="flex-1 py-2.5 rounded-[10px] bg-card border-2 border-border text-sub font-semibold text-xs">
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
