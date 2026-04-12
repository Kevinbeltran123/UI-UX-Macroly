"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, ShoppingBag, Info, Check, RefreshCw } from "lucide-react";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { MacroChip } from "@/components/nutrition/macro-chip";
import { useCart } from "@/hooks/use-cart";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { checkCompatibility, exceededMacros, findAlternatives } from "@/domain/catalog/compatibility";
import type { Product } from "@/domain/catalog/product";

type Props = {
  product: Product;
  allProducts: Product[];
};

export const ProductDetailClient = ({ product, allProducts }: Props) => {
  const { totals, goals } = useCart();
  const addToCart = useAddToCart();

  const compat = checkCompatibility(product, totals, goals);
  const exceeded = exceededMacros(product, totals, goals);
  const alternatives = compat === "exceeds"
    ? findAlternatives(product, allProducts, totals, goals)
    : [];

  const impact = {
    protein: totals.protein + product.protein,
    carbs: totals.carbs + product.carbs,
    fat: totals.fat + product.fat,
  };

  return (
    <div className="px-5 pb-6 animate-[fadeUp_0.3s_ease]">
      <Link
        href="/catalogo"
        className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline"
      >
        <ArrowLeft size={16} /> Volver
      </Link>

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

      {/* Nutritional info */}
      <div className="bg-card rounded-[14px] p-4 border border-border-l mb-4">
        <h4 className="font-display font-bold text-sm mb-3">Informacion nutricional</h4>
        <MacroBar label="Proteina" current={product.protein} goal={goals.protein} color="var(--color-protein)" lightColor="var(--color-protein-light)" compact />
        <MacroBar label="Carbohidratos" current={product.carbs} goal={goals.carbs} color="var(--color-carbs)" lightColor="var(--color-carbs-light)" compact />
        <MacroBar label="Grasas" current={product.fat} goal={goals.fat} color="var(--color-fat)" lightColor="var(--color-fat-light)" compact />
        <MacroBar label="Calorias" current={product.calories} goal={goals.calories} color="var(--color-cal)" lightColor="var(--color-cal-light)" unit="kcal" compact />
      </div>

      {/* Cart impact preview */}
      <div className={`rounded-[14px] p-4 border mb-4 ${
        compat === "exceeds" ? "bg-error/5 border-error/20" : "bg-primary-light border-primary-border"
      }`}>
        <p className="flex items-center gap-2 text-xs font-semibold mb-2.5" style={{ color: compat === "exceeds" ? "var(--color-error)" : "var(--color-primary-dark)" }}>
          <Info size={14} />
          {compat === "exceeds" ? `Excede tu limite de ${exceeded.join(", ")}` : "Impacto en tu carrito"}
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

      {/* Alternatives when exceeds */}
      {alternatives.length > 0 && (
        <div className="mb-4">
          <p className="flex items-center gap-2 text-xs font-bold text-sub mb-2.5">
            <RefreshCw size={13} /> Alternativas que caben en tus macros
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {alternatives.map((alt) => (
              <Link key={alt.id} href={`/catalogo/${alt.id}`} className="no-underline flex-shrink-0">
                <div className="w-[140px] bg-card rounded-xl p-2.5 border border-border-l">
                  <div className="h-[56px] rounded-lg bg-gradient-to-br from-primary-light to-primary-border mb-1.5 relative overflow-hidden">
                    {alt.imageUrl && <Image src={alt.imageUrl} alt={alt.name} fill className="object-cover" sizes="140px" unoptimized />}
                  </div>
                  <p className="font-display font-bold text-[11px] text-text mb-1">{alt.name}</p>
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
          onClick={() => addToCart(product)}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(46,125,50,.3)]"
        >
          <ShoppingCart size={16} /> Agregar al carrito
        </button>
      </div>
    </div>
  );
};
