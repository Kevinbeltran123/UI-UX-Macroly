"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, ShoppingCart, ShoppingBag, RefreshCw, Check,
  Leaf, WheatOff, MilkOff, Fish, Dumbbell,
} from "lucide-react";
import { useState } from "react";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { MacroChip } from "@/components/nutrition/macro-chip";
import { useCart } from "@/hooks/use-cart";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { useGoalsStore } from "@/stores/goals-store";
import { checkCompatibility, exceededMacros, findAlternatives } from "@/domain/catalog/compatibility";
import { cn } from "@/lib/cn";
import type { Product } from "@/domain/catalog/product";

type Props = {
  product: Product;
  allProducts: Product[];
};

const TAG_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  vegano:        { label: "Vegano",           icon: Leaf,     color: "text-primary", bg: "bg-primary-light" },
  sin_gluten:    { label: "Sin gluten",       icon: WheatOff, color: "text-accent",  bg: "bg-accent/10"     },
  sin_lactosa:   { label: "Sin lactosa",      icon: MilkOff,  color: "text-carbs",   bg: "bg-carbs-light"   },
  sin_mariscos:  { label: "Sin mariscos",     icon: Fish,     color: "text-fat",     bg: "bg-fat-light"     },
  alto_proteico: { label: "Alto en proteína", icon: Dumbbell, color: "text-protein", bg: "bg-protein-light" },
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Ideal para desayuno",
  lunch:     "Ideal para almuerzo",
  dinner:    "Ideal para cena",
};


export const ProductDetailClient = ({ product, allProducts }: Props) => {
  const { goals: storeGoals } = useGoalsStore();
  const { totals, goals } = useCart(storeGoals);
  const addToCart = useAddToCart();

  const [justAdded, setJustAdded] = useState(false);
  const compat = checkCompatibility(product, totals, goals);
  const alternatives = compat === "exceeds"
    ? findAlternatives(product, allProducts, totals, goals)
    : [];

  const hasTags = product.dietaryTags.length > 0;
  const hasMeal = product.mealContext !== "any";

  return (
    <div className="px-5 pb-6 animate-[fadeUp_0.3s_ease]">
      <Link
        href="/catalogo"
        className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline"
      >
        <ArrowLeft size={16} /> Volver
      </Link>

      <div className="h-45 rounded-2xl overflow-hidden mb-4 bg-linear-to-br from-primary-light to-primary-border relative">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="400px" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={40} className="text-primary-border" />
          </div>
        )}
      </div>

      <h2 className="font-display font-black text-xl text-text">{product.name}</h2>
      <p className="text-sm text-sub mt-1 mb-4">{product.brand} · {product.weight}</p>

      {/* Dietary tags + meal context */}
      {(hasTags || hasMeal) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.dietaryTags.map((tag) => {
            const meta = TAG_META[tag];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <span
                key={tag}
                className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold", meta.bg, meta.color)}
              >
                <Icon size={11} aria-hidden="true" />
                {meta.label}
              </span>
            );
          })}
          {hasMeal && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-border-l text-sub">
              {MEAL_LABELS[product.mealContext]}
            </span>
          )}
        </div>
      )}

      {/* Nutritional info */}
      <div className="bg-card rounded-xl p-4 border border-border-l mb-4">
        <h4 className="font-display font-bold text-sm mb-3">Información nutricional</h4>
        <MacroBar label="Proteína"      current={product.protein}  goal={goals.protein}  color="var(--color-protein)" lightColor="var(--color-protein-light)" compact />
        <MacroBar label="Carbohidratos" current={product.carbs}    goal={goals.carbs}    color="var(--color-carbs)"   lightColor="var(--color-carbs-light)"   compact />
        <MacroBar label="Grasas"        current={product.fat}      goal={goals.fat}      color="var(--color-fat)"     lightColor="var(--color-fat-light)"     compact />
        <MacroBar label="Calorías"      current={product.calories} goal={goals.calories} color="var(--color-cal)"     lightColor="var(--color-cal-light)"     unit="kcal" compact />
      </div>

      {/* Alternatives when exceeds */}
      {alternatives.length > 0 && (
        <div className="mb-4">
          <p className="flex items-center gap-2 text-xs font-bold text-sub mb-2.5">
            <RefreshCw size={13} /> Alternativas que caben en tus macros
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {alternatives.map((alt) => (
              <Link key={alt.id} href={`/catalogo/${alt.id}`} className="no-underline shrink-0">
                <div className="w-35 bg-card rounded-xl p-2.5 border border-border-l">
                  <div className="h-14 rounded-lg bg-linear-to-br from-primary-light to-primary-border mb-1.5 relative overflow-hidden">
                    {alt.imageUrl && <Image src={alt.imageUrl} alt={alt.name} fill className="object-cover" sizes="140px" unoptimized />}
                  </div>
                  <p className="font-display font-bold text-xs text-text mb-1">{alt.name}</p>
                  <div className="flex gap-1 mb-1">
                    <MacroChip type="protein" value={alt.protein} compact />
                    <MacroChip type="carbs" value={alt.carbs} compact />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-display font-extrabold text-xs">${alt.price.toLocaleString()}</span>
                    <span className="w-2 h-2 rounded-full bg-success" title="Cabe en tus macros" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Price + Add */}
      <div className="flex gap-3 items-center">
        <span className="font-display font-extrabold text-xl">
          ${product.price.toLocaleString()}
        </span>
        <button
          onClick={() => {
            if (justAdded) return;
            addToCart(product);
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 1200);
          }}
          className={`flex-1 py-3.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-colors duration-200 ${justAdded ? "bg-success text-white animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]" : "bg-primary-dark text-white"}`}
        >
          {justAdded
            ? <><Check size={16} /> Agregado</>
            : <><ShoppingCart size={16} /> Agregar al carrito</>}
        </button>
      </div>
    </div>
  );
};
