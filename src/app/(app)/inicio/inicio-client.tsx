"use client";

import { useState, useEffect } from "react";
import { Bell, Zap, Calendar, BookOpen, AlertCircle, Wallet } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { useCart } from "@/hooks/use-cart";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { recommend } from "@/domain/recommendation/recommendation-engine";
import { checkCompatibility } from "@/domain/catalog/compatibility";
import { createClient } from "@/lib/supabase/client";
import { useGoalsStore } from "@/stores/goals-store";
import { useSessionBudgetStore } from "@/stores/session-budget-store";
import { PurchasePeriodSelector } from "@/components/period/purchase-period-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/domain/catalog/product";

const BADGE_BY_CATEGORY: Record<string, string> = {
  proteina: "Alto en proteína",
  carbohidrato: "Buena fuente de energia",
  grasa: "Grasas saludables",
  lacteo: "Rico en calcio",
  fruta: "Natural y fresco",
  suplemento: "Suplemento premium",
};

type Props = {
  allProducts: Product[];
};

export const InicioClient = ({ allProducts }: Props) => {
  const { goals: storeGoals, loading: goalsLoading, restrictions, budget: profileBudget } = useGoalsStore();
  const { budget: sessionBudget } = useSessionBudgetStore();
  // Session override takes priority; falls back to profile budget (D-04)
  const budget = sessionBudget ?? profileBudget;
  const { totals, goals, purchaseDays } = useCart(storeGoals);
  // goals is now period-scaled — pass unchanged to recommend() and checkCompatibility()
  const addToCart = useAddToCart();
  const [firstName, setFirstName] = useState("Usuario");

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
    budget && budget > 0 ? budget : undefined  // T-3-02: 0 and null → undefined (budget mode off)
  );
  const calPct = goals.calories > 0 ? Math.round((totals.calories / goals.calories) * 100) : 0;

  const macros = [
    { label: "Proteína", value: `${totals.protein}g`, color: "#43A047", pct: Math.min((totals.protein / goals.protein) * 100, 100) },
    { label: "Carbos", value: `${totals.carbs}g`, color: "#FB8C00", pct: Math.min((totals.carbs / goals.carbs) * 100, 100) },
    { label: "Grasas", value: `${totals.fat}g`, color: "#1E88E5", pct: Math.min((totals.fat / goals.fat) * 100, 100) },
  ];

  const handleAdd = (p: Product) => addToCart(p);

  return (
    <div className="px-5 pt-4 pb-4 animate-[fadeUp_0.3s_ease]">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-xs text-sub">Buenos días</p>
          <h1 className="font-display font-black text-xl text-text mt-0.5">
            Hola, {firstName}
          </h1>
        </div>
        <button
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
          aria-label="Notificaciones"
        >
          <Bell size={18} className="text-text" />
        </button>
      </div>

      {/* Macro progress — real data from cart store */}
      {goalsLoading ? (
        <Skeleton className="h-[88px] w-full rounded-xl mb-5" />
      ) : (
        <div className="bg-gradient-to-br from-primary-dark to-primary rounded-xl p-5 text-white mb-3 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/5" />
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-semibold opacity-90">Macros del carrito</span>
            <span className="text-[11px] bg-white/15 px-2.5 py-1 rounded-lg font-semibold">{calPct}%</span>
          </div>
          <div className="flex gap-3">
            {macros.map((m) => (
              <div key={m.label} className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] opacity-70">{m.label}</span>
                  <span className="text-[10px] font-bold">{m.value}</span>
                </div>
                <div className="h-1 bg-white/15 rounded-full">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${m.pct}%`, background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D-02, PERIOD-02: Period selector placed below macro progress section (same position as carrito view) */}
      <PurchasePeriodSelector />

      {/* Quick actions */}
      <div className="flex gap-2.5 mb-5">
        {[
          { icon: Zap, label: "Completar", bg: "bg-accent-light", href: "/catalogo" },
          { icon: Calendar, label: "Planificar", bg: "bg-protein-light", href: "/catalogo" },
          { icon: BookOpen, label: "Educación", bg: "bg-carbs-light", href: "/educacion" },
        ].map(({ icon: Icon, label, bg, href }) => (
          <Link
            key={label}
            href={href}
            className={`flex-1 ${bg} rounded-xl py-3.5 flex flex-col items-center gap-1.5 no-underline`}
          >
            <Icon size={20} className="text-text" />
            <span className="text-[10px] font-bold text-text">{label}</span>
          </Link>
        ))}
      </div>

      {/* Smart recommendations from domain engine */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display font-extrabold text-base">Recomendados</h3>
        <Link href="/catalogo" className="text-xs text-primary font-semibold no-underline">
          Ver todo
        </Link>
      </div>
      {recommended.length === 0 ? (
        (() => {
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
          // Default: restriction-only (Phase 2 copy)
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
          {recommended.map((p) => (
            <Link key={p.id} href={`/catalogo/${p.id}`} className="no-underline">
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
