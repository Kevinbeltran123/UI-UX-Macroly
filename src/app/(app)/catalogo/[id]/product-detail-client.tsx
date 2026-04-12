"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, ShoppingBag, Info, Check } from "lucide-react";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { useCart } from "@/hooks/use-cart";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { portionLabel } from "@/domain/cart/cart-operations";
import type { Product } from "@/domain/catalog/product";
import { cn } from "@/lib/cn";

const PORTIONS = [0.25, 0.5, 0.75, 1] as const;

export const ProductDetailClient = ({ product }: { product: Product }) => {
  const { totals, goals } = useCart();
  const addToCart = useAddToCart();
  const [portion, setPortion] = useState(1);

  const p = portion;
  const macros = {
    protein: Math.round(product.protein * p),
    carbs: Math.round(product.carbs * p),
    fat: Math.round(product.fat * p),
    calories: Math.round(product.calories * p),
    price: Math.round(product.price * p),
  };

  const impact = {
    protein: totals.protein + macros.protein,
    carbs: totals.carbs + macros.carbs,
    fat: totals.fat + macros.fat,
  };

  return (
    <div className="px-5 pb-6 animate-[fadeUp_0.3s_ease]">
      <Link
        href="/catalogo"
        className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline"
      >
        <ArrowLeft size={16} /> Volver
      </Link>

      {/* Product image */}
      <div className="h-[180px] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-primary-light to-primary-border relative">
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

      {/* Portion selector */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-sub mb-2">Porcion del paquete</p>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {PORTIONS.map((v) => (
            <button
              key={v}
              onClick={() => setPortion(v)}
              className={cn(
                "py-2.5 rounded-xl text-sm font-bold transition-all",
                portion === v
                  ? "bg-primary text-white shadow-[0_2px_8px_rgba(46,125,50,.3)]"
                  : "bg-card border border-border text-sub",
              )}
            >
              {v === 1 ? "Completo" : portionLabel(v)}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">
          {portion < 1 ? `${portionLabel(portion)} paquete` : "Paquete completo"} · P:{macros.protein}g · C:{macros.carbs}g · G:{macros.fat}g · ${macros.price.toLocaleString()}
        </p>
      </div>

      {/* Nutritional info for selected portion */}
      <div className="bg-card rounded-[14px] p-4 border border-border-l mb-4">
        <h4 className="font-display font-bold text-sm mb-3">
          Informacion nutricional {portion < 1 && `(${portionLabel(portion)})`}
        </h4>
        <MacroBar label="Proteina" current={macros.protein} goal={goals.protein} color="var(--color-protein)" lightColor="var(--color-protein-light)" compact />
        <MacroBar label="Carbohidratos" current={macros.carbs} goal={goals.carbs} color="var(--color-carbs)" lightColor="var(--color-carbs-light)" compact />
        <MacroBar label="Grasas" current={macros.fat} goal={goals.fat} color="var(--color-fat)" lightColor="var(--color-fat-light)" compact />
        <MacroBar label="Calorias" current={macros.calories} goal={goals.calories} color="var(--color-cal)" lightColor="var(--color-cal-light)" unit="kcal" compact />
      </div>

      {/* Cart impact preview */}
      <div className="bg-primary-light rounded-[14px] p-4 border border-primary-border mb-4">
        <p className="flex items-center gap-2 text-xs font-semibold text-primary-dark mb-2.5">
          <Info size={14} /> Impacto en tu carrito
        </p>
        <div className="flex gap-4">
          {[
            { l: "P", v: impact.protein, g: goals.protein, c: "var(--color-protein)" },
            { l: "C", v: impact.carbs, g: goals.carbs, c: "var(--color-carbs)" },
            { l: "G", v: impact.fat, g: goals.fat, c: "var(--color-fat)" },
          ].map((m) => {
            const over = m.v > m.g;
            return (
              <span key={m.l} className="text-xs font-bold flex items-center gap-1" style={{ color: over ? "var(--color-error)" : m.c }}>
                {m.l}: {Math.round(m.v)}g/{m.g}g
                {over ? <Info size={13} className="text-error" /> : <Check size={13} className="text-success" />}
              </span>
            );
          })}
        </div>
      </div>

      {/* Price + Add */}
      <div className="flex gap-3 items-center">
        <span className="font-display font-extrabold text-xl">
          ${macros.price.toLocaleString()}
        </span>
        <button
          onClick={() => addToCart(product, portion)}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(46,125,50,.3)]"
        >
          <ShoppingCart size={16} />
          Agregar {portion < 1 ? `(${portionLabel(portion)})` : ""}
        </button>
      </div>
    </div>
  );
};
