"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Star, ShoppingBag, Check, AlertTriangle, AlertCircle } from "lucide-react";
import { MacroChip } from "@/components/nutrition/macro-chip";
import { useToastStore, type ToastType } from "@/stores/toast-store";
import type { Product } from "@/domain/catalog/product";
import type { Compatibility } from "@/domain/catalog/compatibility";

const COMPAT_META: Record<Compatibility, {
  Icon: typeof Check;
  iconClass: string;
  textColor: string;
  label: string;
  toastType: ToastType;
}> = {
  fits: {
    Icon: Check,
    iconClass: "text-success",
    textColor: "text-success",
    label: "Cabe en tus macros",
    toastType: "success",
  },
  tight: {
    Icon: AlertTriangle,
    iconClass: "text-warning",
    textColor: "text-warning",
    label: "Casi al límite",
    toastType: "warning",
  },
  exceeds: {
    Icon: AlertCircle,
    iconClass: "text-error",
    textColor: "text-error",
    label: "Excede macros",
    toastType: "error",
  },
};

/* Add button color shifts with compatibility — communicates risk at the decision moment */
const ADD_BTN_CLASS: Record<Compatibility, string> = {
  fits: "bg-primary hover:bg-primary-dark",
  tight: "bg-warning hover:bg-amber-600",
  exceeds: "bg-muted",
};

type ProductCardProps = {
  product: Product;
  badge?: string;
  compatibility?: Compatibility;
  onAdd?: () => void;
};

export const ProductCard = ({ product, badge, compatibility, onAdd }: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const toast = useToastStore((s) => s.add);
  const compat = compatibility ? COMPAT_META[compatibility] : null;
  const addBtnClass = compatibility ? ADD_BTN_CLASS[compatibility] : "bg-primary hover:bg-primary-dark";

  const altText = `${product.name}${product.brand ? `, ${product.brand}` : ""}. ${product.protein}g proteína, ${product.carbs}g carbohidratos, ${product.fat}g grasa. $${product.price.toLocaleString()}.`;

  return (
    <article
      className="h-full flex flex-col bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:hover:transform-none motion-reduce:active:scale-100 transition-all duration-200 cursor-pointer"
      aria-label={altText}
    >
      {/* Image area with gradient overlay — no spanning banner */}
      <div className="relative h-27 overflow-hidden bg-linear-to-br from-primary-light to-primary-border">
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
            <ShoppingBag size={28} className="text-primary-border" aria-hidden="true" />
          </div>
        )}
        {/* Gradient fade to white at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-black/25 to-transparent pointer-events-none" />
        {/* Rating — minimal, no white pill */}
        <span className="absolute top-2 left-2 flex items-center gap-0.5 text-xs font-bold text-white drop-shadow-sm">
          <Star size={8} fill="currentColor" aria-hidden="true" /> {product.rating}
        </span>
        {/* Protein — minimal */}
        <span className="absolute top-2 right-2 text-xs font-bold text-white drop-shadow-sm tabular-nums">
          {product.protein}g P
        </span>
      </div>

      <div className="p-2.5 pt-2 flex-1 flex flex-col">
        {/* Badge — small chip above name instead of spanning banner */}
        {badge && (
          <span className="inline-block text-xs font-bold text-accent bg-accent-light px-1.5 py-0.5 rounded mb-1 leading-none">
            {badge}
          </span>
        )}

        <p className="font-display font-bold text-xs text-text leading-snug line-clamp-2 min-h-[2.6em]">{product.name}</p>

        {/* Brand + compatibility indicator on same row */}
        <div className="flex items-center justify-between mt-0.5 mb-2">
          <p className="text-xs text-muted">{product.brand} · {product.weight}</p>
          {compat && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast(compat.label, compat.toastType);
              }}
              className={`flex items-center justify-center -m-3.5 p-3.5 rounded-md active:opacity-60 transition-opacity ${compat.textColor}`}
              aria-label={compat.label}
            >
              <compat.Icon size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-2.5" role="list" aria-label="Macros del producto">
          <MacroChip type="protein" value={product.protein} compact />
          <MacroChip type="carbs" value={product.carbs} compact />
          <MacroChip type="fat" value={product.fat} compact />
        </div>

        <div className="mt-auto flex justify-between items-center">
          <span className="font-display font-extrabold text-sm text-text tabular-nums">
            ${product.price.toLocaleString()}
          </span>
          {onAdd && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (justAdded) return;
                onAdd();
                setJustAdded(true);
                setTimeout(() => setJustAdded(false), 1000);
              }}
              className={`h-11 w-11 rounded-lg text-white flex items-center justify-center transition-all duration-200 active:scale-90 motion-reduce:active:scale-100 focus-visible:ring-2 focus-visible:ring-primary-dark focus-visible:ring-offset-1 ${justAdded ? "bg-success animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]" : addBtnClass}`}
              aria-label={`Agregar ${product.name} al carrito`}
              disabled={compatibility === "exceeds"}
            >
              {justAdded ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
