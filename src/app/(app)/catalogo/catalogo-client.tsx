"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ProductCard } from "@/components/product/product-card";
import { MacroFilterChips } from "@/components/product/macro-filter-chips";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { useCart } from "@/hooks/use-cart";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { useGoalsStore } from "@/stores/goals-store";
import { applyFilters, type CategoryId, type MacroFilter, type CatalogFilters } from "@/domain/catalog/filters";
import { checkCompatibility } from "@/domain/catalog/compatibility";
import type { Product } from "@/domain/catalog/product";

type Props = {
  products: Product[];
  categories: Array<{ id: string; label: string }>;
};

export const CatalogoClient = ({ products, categories }: Props) => {
  const [category, setCategory] = useState<CategoryId>("todos");
  const [macroFilter, setMacroFilter] = useState<MacroFilter>("todos");
  const [search, setSearch] = useState("");
  const { goals: storeGoals } = useGoalsStore();
  const { totals, goals } = useCart(storeGoals);
  // goals is now period-scaled — checkCompatibility(p, totals, goals) unchanged
  const addToCart = useAddToCart();

  const filters: CatalogFilters = { category, macro: macroFilter, search };
  const filtered = applyFilters(products, filters);

  return (
    <div className="px-5 pt-4 pb-4 animate-[fadeUp_0.3s_ease]">
      <h1 className="font-display font-black text-xl text-text mb-3">Catálogo</h1>

      {/* Category chips — NOT sticky. Browse by ingredient type (scrolls away). */}
      <div className="flex gap-1 overflow-x-auto pb-3 mb-1 scrollbar-hide -mx-5 px-5">
        {[{ id: "todos", label: "Todos" }, ...categories].map((c) => {
          const active = category === (c.id as CategoryId);
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id as CategoryId)}
              className={cn(
                "px-3.5 py-1.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all duration-150 active:scale-95",
                active
                  ? "bg-primary-dark text-white rounded-lg"
                  : "text-muted hover:text-sub"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Sticky: search + macro progress + macro filter. Frosted glass + soft downward drop shadow. */}
      <div className="sticky top-0 z-30 -mx-5 px-5 pt-2 bg-bg/90 backdrop-blur-md shadow-[0_6px_16px_-8px_rgba(26,26,24,0.12)]">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-card rounded-xl px-3.5 py-3 mb-3 border border-border-l focus-within:border-primary transition-colors shadow-card">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 outline-none text-sm text-text bg-transparent placeholder:text-muted"
          />
        </div>

        {/* Cart macro mini-bars — sticky with search so users see progress while browsing */}
        {totals.itemCount > 0 && (
          <div className="bg-card rounded-xl p-3 mb-3 border border-border-l">
            <div className="flex gap-3">
              {[
                { l: "P", c: totals.protein, g: goals.protein, cl: "var(--color-protein)", bg: "var(--color-protein-light)" },
                { l: "C", c: totals.carbs, g: goals.carbs, cl: "var(--color-carbs)", bg: "var(--color-carbs-light)" },
                { l: "G", c: totals.fat, g: goals.fat, cl: "var(--color-fat)", bg: "var(--color-fat-light)" },
              ].map((m) => (
                <div key={m.l} className="flex-1">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] font-bold" style={{ color: m.cl }}>{m.l}</span>
                    <span className="text-[9px] text-sub tabular-nums">{m.c}/{m.g}g</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: m.bg }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-400"
                      style={{
                        width: `${Math.min((m.c / m.g) * 100, 100)}%`,
                        background: m.c > m.g ? "var(--color-error)" : m.cl,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Macro filter chips */}
        <MacroFilterChips value={macroFilter} onChange={setMacroFilter} />
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <Search size={32} className="text-muted mx-auto mb-3" />
          <p className="text-sm text-sub">No se encontraron productos</p>
          <button
            onClick={() => { setCategory("todos"); setMacroFilter("todos"); setSearch(""); }}
            className="mt-3 px-5 py-2.5 rounded-xl bg-primary-light text-primary font-bold text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        /* key remounts the grid on category/macro filter change, retriggering staggerFadeUp.
           Search is intentionally excluded — typing would re-animate on every keystroke. */
        <div key={`${category}-${macroFilter}`} className="grid grid-cols-2 gap-2.5">
          {filtered.map((p, index) => (
            <Link
              key={p.id}
              href={`/catalogo/${p.id}`}
              className="no-underline animate-[staggerFadeUp_0.4s_ease_both]"
              style={{ animationDelay: `${Math.min(index * 35, 500)}ms` }}
            >
              <ProductCard product={p} compatibility={checkCompatibility(p, totals, goals)} onAdd={() => addToCart(p)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
