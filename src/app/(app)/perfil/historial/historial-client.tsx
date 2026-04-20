"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCw, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useToastStore } from "@/stores/toast-store";
import type { CartItem } from "@/domain/cart/cart-summary";

type Order = {
  id: string;
  items: CartItem[];
  total_price: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_calories: number;
  created_at: string;
};

export const HistorialClient = ({ orders }: { orders: Order[] }) => {
  const loadItems = useCartStore((s) => s.loadItems);
  const cartItems = useCartStore((s) => s.items);
  const toast = useToastStore((s) => s.add);
  const router = useRouter();

  const handleRepeat = (order: Order) => {
    if (cartItems.length > 0 && !confirm("Esto reemplazará tu carrito actual. ¿Continuar?")) return;
    loadItems(order.items);
    toast("Pedido cargado al carrito", "success");
    router.push("/carrito");
  };

  return (
    <div className="px-5 pb-6 animate-[fadeUp_0.3s_ease]">
      <Link href="/perfil" className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline">
        <ArrowLeft size={16} /> Volver
      </Link>
      <h1 className="font-display font-black text-xl text-text mb-4">Historial de pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-2xl bg-border-l mx-auto mb-3.5 flex items-center justify-center">
            <ShoppingCart size={24} className="text-muted" />
          </div>
          <p className="text-sm text-sub mb-1">Sin pedidos anteriores</p>
          <p className="text-xs text-muted mb-4">Tus pedidos aparecerán aquí</p>
          <Link href="/catalogo" className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm no-underline">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-card rounded-xl p-4 border border-border-l mb-2.5">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-display font-bold text-sm text-text">
                  {new Date(order.created_at).toLocaleDateString("es-CO")}
                </p>
                <p className="text-[11px] text-sub mt-0.5">
                  {order.items.reduce((a: number, i: CartItem) => a + i.qty, 0)} productos
                </p>
              </div>
              <span className="font-display font-extrabold text-[15px] text-primary">
                ${order.total_price.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2 mb-2.5">
              <span className="text-[10px] font-semibold text-protein">P:{order.total_protein}g</span>
              <span className="text-[10px] font-semibold text-carbs">C:{order.total_carbs}g</span>
              <span className="text-[10px] font-semibold text-fat">G:{order.total_fat}g</span>
              <span className="text-[10px] font-semibold text-cal">{order.total_calories} kcal</span>
            </div>
            <button
              onClick={() => handleRepeat(order)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary-light text-primary font-bold text-[11px]"
            >
              <RotateCw size={12} /> Repetir pedido
            </button>
          </div>
        ))
      )}
    </div>
  );
};
