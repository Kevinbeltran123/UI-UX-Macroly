"use client";

import { useCart } from "./use-cart";
import { useGoalsStore } from "@/stores/goals-store";
import { useToastStore } from "@/stores/toast-store";
import type { Product } from "@/domain/catalog/product";

export const useAddToCart = () => {
  const { goals: storeGoals } = useGoalsStore();
  const { add, totals, goals } = useCart(storeGoals);
  const toast = useToastStore((s) => s.add);

  return (product: Product) => {
    // Capture which macros were already over before this add
    const alreadyOverProtein = totals.protein > goals.protein;
    const alreadyOverCarbs   = totals.carbs   > goals.carbs;
    const alreadyOverFat     = totals.fat     > goals.fat;

    add(product);

    // Only alert for macros that THIS add newly pushes over the goal
    const newlyExceeded: string[] = [];
    if (!alreadyOverProtein && totals.protein + product.protein > goals.protein) newlyExceeded.push("proteína");
    if (!alreadyOverCarbs   && totals.carbs   + product.carbs   > goals.carbs)   newlyExceeded.push("carbos");
    if (!alreadyOverFat     && totals.fat     + product.fat     > goals.fat)     newlyExceeded.push("grasas");

    if (newlyExceeded.length > 0) {
      toast(`Meta de ${newlyExceeded.join(" y ")} superada`, "error");
    }
  };
};
