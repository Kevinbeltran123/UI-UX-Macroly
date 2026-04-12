"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Info, Check } from "lucide-react";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/domain/catalog/product";

export const ProductDetailClient = ({ product }: { product: Product }) => {
  const { add, totals, goals } = useCart();

  const impact = {
    protein: totals.protein + product.protein,
    carbs: totals.carbs + product.carbs,
    fat: totals.fat + product.fat,
  };

  const handleAdd = () => {
    add(product);
  };

  return (
    <div className="px-5 pb-6">
      <Link
        href="/catalogo"
        className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline"
      >
        <ArrowLeft size={16} /> Volver
      </Link>

      {/* Product image */}
      <div className="h-[180px] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-primary-light to-primary-border relative">
        {product.imageUrl && (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="400px" />
        )}
      </div>

      <h2 className="font-display font-black text-xl text-text">{product.name}</h2>
      <p className="text-sm text-sub mt-1 mb-4">{product.brand} · {product.weight}</p>

      {/* Nutritional info */}
      <div className="bg-card rounded-[14px] p-4 border border-border-l mb-4">
        <h4 className="font-display font-bold text-sm mb-3">Informacion nutricional</h4>
        <MacroBar label="Proteina" current={product.protein} goal={goals.protein} color="var(--color-protein)" lightColor="var(--color-protein-light)" compact />
        <MacroBar label="Carbohidratos" current={product.carbs} goal={goals.carbs} color="var(--color-carbs)" lightColor="var(--color-carbs-light)" compact />
        <MacroBar label="Grasas" current={product.fat} goal={goals.fat} color="var(--color-fat)" lightColor="var(--color-fat-light)" compact />
        <MacroBar label="Calorias" current={product.calories} goal={goals.calories} color="var(--color-cal)" lightColor="var(--color-cal-light)" unit="kcal" compact />
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
                {m.l}: {m.v}g/{m.g}g
                {over
                  ? <Info size={13} className="text-error" />
                  : <Check size={13} className="text-success" />
                }
              </span>
            );
          })}
        </div>
      </div>

      {/* Price + Add */}
      <div className="flex gap-3 items-center">
        <span className="font-display font-extrabold text-xl">
          ${product.price.toLocaleString()}
        </span>
        <button
          onClick={handleAdd}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(46,125,50,.3)]"
        >
          <ShoppingCart size={16} /> Agregar al carrito
        </button>
      </div>
    </div>
  );
};
