"use client";

import { useState, useEffect } from "react";
import { Bell, AlertCircle, Wallet, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { useCart } from "@/hooks/use-cart";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { recommend } from "@/domain/recommendation/recommendation-engine";
import { checkCompatibility } from "@/domain/catalog/compatibility";
import { createClient } from "@/lib/supabase/client";
import { useGoalsStore } from "@/stores/goals-store";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import type { Product } from "@/domain/catalog/product";

const BADGE_BY_CATEGORY: Record<string, string> = {
  proteina: "Alto en proteína",
  carbohidrato: "Buena fuente de energía",
  grasa: "Grasas saludables",
  lacteo: "Rico en calcio",
  fruta: "Natural y fresco",
  suplemento: "Suplemento premium",
};

const MEAL_CHIPS = [
  { value: "any",       label: "Todo" },
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch",     label: "Almuerzo" },
  { value: "dinner",    label: "Cena" },
] as const;

type Props = {
  allProducts: Product[];
};

export const InicioClient = ({ allProducts }: Props) => {
  const { goals: storeGoals, restrictions, budget } = useGoalsStore();
  const { totals, goals } = useCart(storeGoals);
  const addToCart = useAddToCart();
  const [firstName, setFirstName] = useState("Usuario");
  const [mealContext, setMealContext] = useState<"any" | "breakfast" | "lunch" | "dinner">("any");

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const meta = user.user_metadata ?? {};
      const name = meta.full_name ?? meta.name ?? meta.display_name ?? "";
      if (name) setFirstName(name.split(" ")[0]);
    };
    loadUser();
  }, []);

  const recommended = recommend(
    allProducts, totals, goals, 6, restrictions,
    budget && budget > 0 ? budget : undefined,
    mealContext
  );

  const calPct = goals.calories > 0 ? Math.round((totals.calories / goals.calories) * 100) : 0;

  const calStatus =
    calPct === 0
      ? "Agrega productos para cubrir tus metas de hoy"
      : calPct < 50
      ? `Llevas el ${calPct}% de tus calorías — sigue sumando`
      : calPct < 90
      ? `¡Vas bien! ${calPct}% de tu meta calórica cubierta`
      : `${calPct}% de tus calorías — casi listo`;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const handleAdd = (p: Product) => addToCart(p);

  return (
    <div className="px-5 pt-4 pb-4 animate-[fadeUp_0.3s_ease]">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="font-display font-extrabold text-xl text-text">
            {greeting}, {firstName}
          </h1>
        </div>
        <button
          className="w-10 h-10 rounded-xl bg-card border border-border-l flex items-center justify-center shadow-card"
          aria-label="Notificaciones"
        >
          <Bell size={17} className="text-sub" />
        </button>
      </div>

      {/* Single contextual calorie status */}
      <p className="text-xs text-sub mb-5" aria-live="polite">{calStatus}</p>

      {/* Meal context — tab underline style, sticky with frosted glass */}
      <div
        role="group"
        aria-label="Filtrar recomendaciones por momento"
        className="sticky top-0 z-30 -mx-5 px-5 pt-2 mb-4 bg-bg/90 backdrop-blur-md shadow-[0_6px_16px_-8px_rgba(26,26,24,0.12)]"
      >
        <div className="flex justify-center overflow-x-auto scrollbar-hide border-b border-border-l">
          {MEAL_CHIPS.map((chip) => {
            const active = mealContext === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => setMealContext(chip.value)}
                role="radio"
                aria-checked={active}
                aria-label={chip.label}
                className={cn(
                  "px-4 pb-2.5 pt-2 text-sm font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 min-h-11 relative",
                  active ? "text-primary" : "text-muted"
                )}
              >
                {chip.label}
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200",
                    active ? "w-5 bg-primary" : "w-0 bg-transparent"
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display font-bold text-base text-text">Recomendados</h3>
        <Link href="/catalogo" className="text-xs text-primary font-semibold no-underline">
          Ver todo
        </Link>
      </div>

      {recommended.length === 0 ? (
        (() => {
          if (mealContext !== "any") {
            return (
              <EmptyState
                icon={UtensilsCrossed}
                title="No hay productos para este momento."
                actionLabel="Ver todos los productos"
                actionHref="/catalogo"
              />
            );
          }
          const hasBudget = budget !== null && budget > 0;
          const hasRestrictions = restrictions.length > 0;
          if (hasBudget && hasRestrictions) {
            return (
              <EmptyState
                icon={AlertCircle}
                title="Sin recomendaciones disponibles"
                description="No encontramos productos dentro de tu presupuesto y restricciones."
                actionLabel="Ajustar presupuesto →"
                actionHref="/perfil/presupuesto"
              />
            );
          }
          if (hasBudget) {
            return (
              <EmptyState
                icon={Wallet}
                title="Sin recomendaciones disponibles"
                description="Ningún producto cabe en el presupuesto restante de tu carrito."
                actionLabel="Ajustar presupuesto →"
                actionHref="/perfil/presupuesto"
              />
            );
          }
          return (
            <EmptyState
              icon={AlertCircle}
              title="Sin recomendaciones disponibles"
              description="No encontramos productos compatibles con tus restricciones."
              actionLabel="Revisar condiciones de salud →"
              actionHref="/perfil/condiciones"
            />
          );
        })()
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {recommended.map((p, index) => (
            <Link
              key={p.id}
              href={`/catalogo/${p.id}`}
              className="no-underline animate-[staggerFadeUp_0.4s_ease_both]"
              style={{ animationDelay: `${index * 65}ms` }}
            >
              <ProductCard
                product={p}
                badge={
                  p.reason === "Mejor relación proteína/precio"
                    ? "Mejor relación proteína/precio"
                    : (BADGE_BY_CATEGORY[p.categoryId ?? ""] ?? p.reason)
                }
                compatibility={checkCompatibility(p, totals, goals)}
                onAdd={() => handleAdd(p)}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
