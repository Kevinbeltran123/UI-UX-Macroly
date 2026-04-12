"use client";

import { useCart } from "./use-cart";
import { useToastStore } from "@/stores/toast-store";
import type { Product } from "@/domain/catalog/product";

/**
 * Centralized add-to-cart with consistent macro warnings.
 */
export const useAddToCart = () => {
  const { add, totals, goals } = useCart();
  const toast = useToastStore((s) => s.add);

  return (product: Product) => {
    add(product);

    const newFat = totals.fat + product.fat;
    const newProtein = totals.protein + product.protein;
    const newCarbs = totals.carbs + product.carbs;

    if (newFat > goals.fat) {
      toast(`Grasas superadas (${newFat}g / ${goals.fat}g)`, "warning");
    } else if (newProtein > goals.protein) {
      toast(`Proteina superada (${newProtein}g / ${goals.protein}g)`, "warning");
    } else if (newCarbs > goals.carbs) {
      toast(`Carbos superados (${newCarbs}g / ${goals.carbs}g)`, "warning");
    } else {
      toast(`${product.name} agregado al carrito`, "success");
    }
  };
};
