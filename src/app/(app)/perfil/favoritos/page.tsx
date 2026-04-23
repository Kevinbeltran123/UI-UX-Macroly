"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Trash2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useRouter } from "next/navigation";

type Combo = {
  id: string;
  name: string;
  items: Array<{ id: string; name: string; qty: number; protein: number; carbs: number; fat: number; price: number; imageUrl: string | null; brand: string | null; weight: string | null; calories: number; categoryId: string | null; rating: number | null; dietaryTags: string[]; mealContext: 'any' | 'breakfast' | 'lunch' | 'dinner' }>;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_price: number;
  created_at: string;
};

export default function FavoritosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const loadItems = useCartStore((s) => s.loadItems);
  const cartItems = useCartStore((s) => s.items);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("favorite_combos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setCombos((data ?? []) as Combo[]);
      setLoading(false);
    };
    load();
  }, []);

  const handleLoad = (combo: Combo) => {
    if (cartItems.length > 0 && !confirm("Esto reemplazará tu carrito actual. ¿Continuar?")) return;
    loadItems(combo.items);
    router.push("/carrito");
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("favorite_combos").delete().eq("id", id);
    setCombos((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="px-5 pb-6">
      <Link href="/perfil" className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline">
        <ArrowLeft size={16} /> Volver
      </Link>
      <h1 className="font-display font-black text-xl text-text mb-4">Combinaciones guardadas</h1>

      {loading ? (
        <p className="text-sm text-sub text-center py-8">Cargando...</p>
      ) : combos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-sub">Sin combinaciones guardadas</p>
          <p className="text-xs text-muted mt-1">Guarda una desde el carrito o al pagar</p>
        </div>
      ) : (
        combos.map((combo) => (
          <div key={combo.id} className="bg-card rounded-xl p-4 border border-border-l mb-2.5">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-display font-bold text-sm text-text">{combo.name}</p>
                <p className="text-[11px] text-sub mt-0.5">
                  {new Date(combo.created_at).toLocaleDateString("es-CO")} · {combo.items.reduce((a, i) => a + i.qty, 0)} productos
                </p>
              </div>
              <span className="font-display font-extrabold text-[15px] text-primary">
                ${combo.total_price.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2 mb-2.5">
              <span className="text-[10px] font-semibold text-protein">P:{combo.total_protein}g</span>
              <span className="text-[10px] font-semibold text-carbs">C:{combo.total_carbs}g</span>
              <span className="text-[10px] font-semibold text-fat">G:{combo.total_fat}g</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleLoad(combo)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary-light text-primary font-bold text-[11px]"
              >
                <ShoppingCart size={12} /> Cargar al carrito
              </button>
              <button
                onClick={() => handleDelete(combo.id)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#FEE2E2] text-error font-bold text-[11px]"
              >
                <Trash2 size={12} /> Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
