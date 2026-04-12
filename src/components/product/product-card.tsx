"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Star, ShoppingBag } from "lucide-react";
import { MacroChip } from "@/components/nutrition/macro-chip";
import type { Product } from "@/domain/catalog/product";
import type { Compatibility } from "@/domain/catalog/compatibility";

const COMPAT_STYLES: Record<Compatibility, { dot: string; title: string }> = {
  fits: { dot: "bg-success", title: "Cabe en tus macros" },
  tight: { dot: "bg-warning", title: "Casi al limite" },
  exceeds: { dot: "bg-error", title: "Excede tus macros" },
};

type ProductCardProps = {
  product: Product;
  badge?: string;
  compatibility?: Compatibility;
  onAdd?: () => void;
};

export const ProductCard = ({ product, badge, compatibility, onAdd }: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);
  const compat = compatibility ? COMPAT_STYLES[compatibility] : null;

  return (
    <div className="bg-card rounded-[14px] overflow-hidden border border-border-l hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer relative">
      {badge && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-accent text-white text-center py-0.5 text-[9px] font-bold">
          {badge}
        </div>
      )}
      <div className="relative h-[110px] overflow-hidden bg-gradient-to-br from-primary-light to-primary-border">
        {product.imageUrl && !imgError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="200px"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-primary-border" />
          </div>
        )}
        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[9px] font-bold text-protein">
          {product.protein}g prot
        </span>
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[9px] font-semibold text-carbs flex items-center gap-1">
          <Star size={9} fill="currentColor" /> {product.rating}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          {compat && (
            <span className={`w-2 h-2 rounded-full ${compat.dot} flex-shrink-0`} title={compat.title} />
          )}
          <p className="font-display font-bold text-xs text-text leading-tight">{product.name}</p>
        </div>
        <p className="text-[10px] text-sub mt-0.5 mb-2">{product.brand} · {product.weight}</p>
        <div className="flex gap-1 mb-2">
          <MacroChip type="protein" value={product.protein} compact />
          <MacroChip type="carbs" value={product.carbs} compact />
          <MacroChip type="fat" value={product.fat} compact />
        </div>
        <div className="flex justify-between items-center">
          <span className="font-display font-extrabold text-sm text-text">
            ${product.price.toLocaleString()}
          </span>
          {onAdd && (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center"
              aria-label="Agregar al carrito"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
