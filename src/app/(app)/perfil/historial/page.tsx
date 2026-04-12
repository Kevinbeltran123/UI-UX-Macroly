import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, RotateCw } from "lucide-react";

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="px-5 pb-6">
      <Link href="/perfil" className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline">
        <ArrowLeft size={16} /> Volver
      </Link>
      <h1 className="font-display font-black text-xl text-text mb-4">Historial de pedidos</h1>

      {(!orders || orders.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-sm text-sub">Sin pedidos anteriores</p>
          <Link href="/catalogo" className="mt-3 inline-block px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm no-underline">
            Ir al catalogo
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
                  {(order.items as Array<{ qty: number }>).reduce((a, i) => a + i.qty, 0)} productos
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
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary-light text-primary font-bold text-[11px]">
              <RotateCw size={12} /> Repetir pedido
            </button>
          </div>
        ))
      )}
    </div>
  );
}
