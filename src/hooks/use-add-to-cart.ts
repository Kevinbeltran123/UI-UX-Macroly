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
    const newCount = totals.itemCount + 1;
    const newPrice = totals.price + product.price;
    const cartCtx = `Carrito: ${newCount} producto${newCount === 1 ? "" : "s"}, ${newPrice.toLocaleString()} pesos.`;

    if (newFat > goals.fat) {
      toast(`${product.name} agregado. Grasas superadas (${newFat}g de ${goals.fat}g). ${cartCtx}`, "warning");
    } else if (newProtein > goals.protein) {
      toast(`${product.name} agregado. Proteina superada (${newProtein}g de ${goals.protein}g). ${cartCtx}`, "warning");
    } else if (newCarbs > goals.carbs) {
      toast(`${product.name} agregado. Carbos superados (${newCarbs}g de ${goals.carbs}g). ${cartCtx}`, "warning");
    } else {
      toast(`${product.name} agregado al carrito. ${cartCtx}`, "success");
    }
  };
};
