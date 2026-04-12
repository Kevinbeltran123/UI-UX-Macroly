"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Star, ShoppingBag, Check, AlertTriangle, AlertCircle } from "lucide-react";
import { MacroChip } from "@/components/nutrition/macro-chip";
import type { Product } from "@/domain/catalog/product";
import type { Compatibility } from "@/domain/catalog/compatibility";

const COMPAT_META: Record<Compatibility, {
  Icon: typeof Check;
  iconClass: string;
  bg: string;
  label: string;
}> = {
  fits: {
    Icon: Check,
    iconClass: "text-success",
    bg: "bg-success/15",
    label: "Cabe en tus macros",
  },
  tight: {
    Icon: AlertTriangle,
    iconClass: "text-warning",
    bg: "bg-warning/15",
    label: "Casi al limite de macros",
  },
  exceeds: {
    Icon: AlertCircle,
    iconClass: "text-error",
    bg: "bg-error/10",
    label: "Excede tus macros",
  },
};

type ProductCardProps = {
  product: Product;
  badge?: string;
  compatibility?: Compatibility;
  onAdd?: () => void;
};

export const ProductCard = ({ product, badge, compatibility, onAdd }: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);
  const compat = compatibility ? COMPAT_META[compatibility] : null;

  const altText = `${product.name}${product.brand ? `, ${product.brand}` : ""}. ${product.protein} gramos de proteina, ${product.carbs} gramos de carbohidratos, ${product.fat} gramos de grasa. ${product.price.toLocaleString()} pesos.`;

  return (
    <article
      className="bg-card rounded-[14px] overflow-hidden border border-border-l hover:shadow-card-hover hover:-translate-y-0.5 motion-reduce:hover:transform-none transition-all cursor-pointer relative"
      aria-label={altText}
    >
      {badge && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-accent text-white text-center py-0.5 text-[9px] font-bold">
          {badge}
        </div>
      )}
      <div className="relative h-[110px] overflow-hidden bg-gradient-to-br from-primary-light to-primary-border">
        {product.imageUrl && !imgError ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="200px"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" role="presentation">
            <ShoppingBag size={32} className="text-primary-border" aria-hidden="true" />
          </div>
        )}
        <span className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-primary-dark">
          {product.protein}g prot
        </span>
        <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-text flex items-center gap-1">
          <Star size={10} fill="currentColor" aria-hidden="true" /> {product.rating}
        </span>
      </div>
      <div className="p-3">
        {compat && (
          <div
            className={`${compat.bg} rounded-md px-1.5 py-0.5 mb-1.5 inline-flex items-center gap-1`}
            role="status"
          >
            <compat.Icon size={11} className={compat.iconClass} aria-hidden="true" />
            <span className={`text-[9px] font-semibold ${compat.iconClass}`}>
              {compat.label}
            </span>
          </div>
        )}
        <p className="font-display font-bold text-xs text-text leading-tight">{product.name}</p>
        <p className="text-[11px] text-sub mt-0.5 mb-2">{product.brand} · {product.weight}</p>
        <div className="flex gap-1 mb-2" role="list" aria-label="Macros del producto">
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
              className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary-dark focus-visible:ring-offset-2"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
