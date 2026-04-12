import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { MacroChip } from "@/components/nutrition/macro-chip";
import type { Product } from "@/domain/catalog/product";

type ProductCardProps = {
  product: Product;
  badge?: string;
  onAdd?: () => void;
};

export const ProductCard = ({ product, badge, onAdd }: ProductCardProps) => (
  <div className="bg-card rounded-[14px] overflow-hidden border border-border-l hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer relative">
    {badge && (
      <div className="absolute top-0 left-0 right-0 z-10 bg-accent text-white text-center py-0.5 text-[9px] font-bold">
        {badge}
      </div>
    )}
    <div className="relative h-[110px] overflow-hidden bg-gradient-to-br from-primary-light to-primary-border">
      {product.imageUrl && (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="200px"
        />
      )}
      <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[9px] font-bold text-protein">
        {product.protein}g prot
      </span>
      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[9px] font-semibold text-carbs flex items-center gap-1">
        <Star size={9} fill="currentColor" /> {product.rating}
      </span>
    </div>
    <div className="p-3">
      <p className="font-display font-bold text-xs text-text leading-tight">{product.name}</p>
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
