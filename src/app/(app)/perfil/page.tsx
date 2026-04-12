import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { User, Clock, Save, Shield, Settings, ChevronRight } from "lucide-react";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const name = user?.user_metadata?.full_name ?? "Usuario Macroly";

  const { data: goals } = await supabase
    .from("macro_goals")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  const { data: recurring } = await supabase
    .from("recurring_orders")
    .select("*")
    .eq("user_id", user?.id)
    .eq("active", true)
    .single();

  const goalCards = [
    { label: "Proteina", value: `${goals?.protein ?? 150}g`, color: "text-protein", bg: "bg-protein-light", k: "P" },
    { label: "Carbos", value: `${goals?.carbs ?? 250}g`, color: "text-carbs", bg: "bg-carbs-light", k: "C" },
    { label: "Grasas", value: `${goals?.fat ?? 65}g`, color: "text-fat", bg: "bg-fat-light", k: "G" },
    { label: "Calorias", value: `${goals?.calories ?? 2185}`, color: "text-cal", bg: "bg-cal-light", k: "K" },
  ];

  const dayNames: Record<string, string> = { L: "Lunes", M: "Martes", Mi: "Miercoles", J: "Jueves", V: "Viernes", S: "Sabado", D: "Domingo" };

  return (
    <div className="px-5 pt-4 pb-4">
      <h1 className="font-display font-black text-xl text-text mb-3.5">Mi Perfil</h1>

      {/* User card */}
      <div className="bg-card rounded-[14px] p-5 border border-border-l text-center mb-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark mx-auto mb-2.5 flex items-center justify-center">
          <User size={26} className="text-white" />
        </div>
        <h3 className="font-display font-black text-[17px] text-text">{name}</h3>
      </div>

      {/* Goals */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-text">Metas diarias</span>
        <Link href="/perfil/editar-metas" className="text-xs text-primary font-semibold no-underline">
          Editar
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3.5">
        {goalCards.map((m) => (
          <div key={m.k} className={`${m.bg} rounded-xl p-3 border border-${m.color}/10`}>
            <span className="text-[10px] text-sub">{m.label}</span>
            <span className={`font-display font-extrabold text-lg ${m.color} block mt-0.5`}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Recurring order status */}
      <div className="bg-card rounded-[14px] p-4 border border-border-l mb-3.5">
        <span className="text-sm font-bold text-text">Pedido Recurrente</span>
        {recurring ? (
          <div className="mt-2.5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs font-semibold text-success">
                Activo · {(recurring.days as string[]).map((d: string) => dayNames[d] ?? d).join(", ")}
              </span>
            </div>
            <p className="text-[11px] text-sub mb-2.5">
              {(recurring.items as Array<{ name: string }>).map((i) => i.name).join(", ")}
            </p>
            <div className="flex gap-1.5">
              <Link href="/carrito" className="px-3 py-2 rounded-lg bg-primary-light text-primary font-bold text-[11px] no-underline">
                Editar
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-muted mt-2">Activa al pagar desde el carrito</p>
        )}
      </div>

      {/* Menu */}
      <div className="bg-card rounded-[14px] overflow-hidden border border-border-l">
        {[
          { icon: Clock, label: "Historial de pedidos", href: "/perfil/historial" },
          { icon: Save, label: "Combinaciones guardadas", href: "/perfil/favoritos" },
          { icon: Shield, label: "Condiciones de salud", href: "#" },
          { icon: Settings, label: "Configuracion", href: "#" },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-border-l last:border-b-0 no-underline"
          >
            <item.icon size={17} className="text-sub" />
            <span className="flex-1 text-sm font-medium text-text">{item.label}</span>
            <ChevronRight size={14} className="text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}
