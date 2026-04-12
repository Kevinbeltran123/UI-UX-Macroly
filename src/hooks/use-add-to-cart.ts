"use client";

import { useCart } from "./use-cart";
import { useToastStore } from "@/stores/toast-store";
import type { Product } from "@/domain/catalog/product";

/**
 * Centralized add-to-cart with consistent macro warnings.
 * Use this everywhere a product can be added (catalog, detail, home).
 */
export const useAddToCart = () => {
  const { add, totals, goals } = useCart();
  const toast = useToastStore((s) => s.add);

  return (product: Product, portion = 1) => {
    add(product, portion);

    const newFat = totals.fat + product.fat * portion;
    const newProtein = totals.protein + product.protein * portion;
    const newCarbs = totals.carbs + product.carbs * portion;

    if (newFat > goals.fat) {
      toast(`Grasas superadas (${Math.round(newFat)}g / ${goals.fat}g)`, "warning");
    } else if (newProtein > goals.protein) {
      toast(`Proteina superada (${Math.round(newProtein)}g / ${goals.protein}g)`, "warning");
    } else if (newCarbs > goals.carbs) {
      toast(`Carbos superados (${Math.round(newCarbs)}g / ${goals.carbs}g)`, "warning");
    } else {
      const label = portion < 1 ? `${product.name} (${Math.round(portion * 100)}%)` : product.name;
      toast(`${label} agregado al carrito`, "success");
    }
  };
};
