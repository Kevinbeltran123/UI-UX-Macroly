"use client";

import { Minus, Plus, ShoppingCart, Heart, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { useCart } from "@/hooks/use-cart";

export default function CarritoPage() {
  const { items, totals, goals, add, remove } = useCart();

  return (
    <div className="px-5 pt-4 pb-4">
      <h1 className="font-display font-black text-xl text-text mb-4">Mi Carrito</h1>

      {/* Macro progress card */}
      <div className="bg-card rounded-[14px] p-4 border border-border-l mb-4">
        <MacroBar
          label="Proteina"
          current={totals.protein}
          goal={goals.protein}
          color="var(--color-protein)"
          lightColor="var(--color-protein-light)"
          compact
        />
        <MacroBar
          label="Carbohidratos"
          current={totals.carbs}
          goal={goals.carbs}
          color="var(--color-carbs)"
          lightColor="var(--color-carbs-light)"
          compact
        />
        <MacroBar
          label="Grasas"
          current={totals.fat}
          goal={goals.fat}
          color="var(--color-fat)"
          lightColor="var(--color-fat-light)"
          compact
        />
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-border-l mx-auto mb-3.5 flex items-center justify-center">
            <ShoppingCart size={24} className="text-muted" />
          </div>
          <p className="text-sm text-sub mb-3.5">Agrega productos del catalogo</p>
          <Link
            href="/catalogo"
            className="inline-block px-7 py-2.5 rounded-xl bg-primary text-white font-bold text-sm no-underline"
          >
            Ir al catalogo
          </Link>
        </div>
      )}

      {/* Cart items */}
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-card rounded-xl p-3 mb-2 border border-border-l flex items-center gap-2.5"
        >
          <div className="w-12 h-12 rounded-[10px] overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-light to-primary-border relative">
            {item.imageUrl && (
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="48px" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-xs text-text">{item.name}</p>
            <span className="text-[10px] text-sub">
              P:{item.protein * item.qty}g · C:{item.carbs * item.qty}g · G:
              {item.fat * item.qty}g
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => remove(item.id)}
              className="w-[26px] h-[26px] rounded-lg bg-fat-light flex items-center justify-center"
              aria-label="Reducir cantidad"
            >
              <Minus size={12} className="text-fat" />
            </button>
            <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
            <button
              onClick={() => add(item)}
              className="w-[26px] h-[26px] rounded-lg bg-primary-light flex items-center justify-center"
              aria-label="Aumentar cantidad"
            >
              <Plus size={12} className="text-primary" />
            </button>
          </div>
        </div>
      ))}

      {/* Cart footer */}
      {items.length > 0 && (
        <>
          {/* Save favorite */}
          <button className="w-full mt-2 bg-primary-light rounded-xl py-3 border border-primary-border flex items-center justify-center gap-2 text-xs text-primary font-semibold">
            <Heart size={16} /> Guardar combinacion como favorita
          </button>

          {/* Total + Pay */}
          <div className="mt-4 bg-card rounded-[14px] p-4 border border-border-l">
            <div className="flex justify-between mb-3.5">
              <span className="font-display font-extrabold text-base">Total</span>
              <span className="font-display font-extrabold text-lg text-primary">
                ${totals.price.toLocaleString()}
              </span>
            </div>
            <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-[#E65100] text-white font-bold text-sm">
              Pagar ${totals.price.toLocaleString()}
            </button>
            <p className="text-[11px] text-muted text-center mt-1.5">
              Al pagar podras guardar y programar recurrencia
            </p>
          </div>
        </>
      )}
    </div>
  );
}
