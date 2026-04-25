"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Clock, Save, Shield, Settings, ChevronRight, LogOut, Accessibility } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DAY_NAMES: Record<string, string> = {
  L: "Lunes", M: "Martes", Mi: "Miércoles", J: "Jueves",
  V: "Viernes", S: "Sábado", D: "Domingo",
};

type Props = {
  userMeta: Record<string, string>;
  goals: { protein: number; carbs: number; fat: number; calories: number } | null;
  recurring: { days: string[]; items: Array<{ name: string }> } | null;
};

export const PerfilClient = ({ userMeta, goals, recurring }: Props) => {
  const router = useRouter();
  const name = userMeta.full_name ?? userMeta.name ?? "Usuario Macroly";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  /* White cards with colored left-accent bar — far less generic than pastel blocks */
  const goalCards = [
    { label: "Proteína", value: `${goals?.protein ?? 150}g`,   color: "text-protein", bar: "bg-protein", k: "P" },
    { label: "Carbos",   value: `${goals?.carbs ?? 250}g`,     color: "text-carbs",   bar: "bg-carbs",   k: "C" },
    { label: "Grasas",   value: `${goals?.fat ?? 65}g`,        color: "text-fat",     bar: "bg-fat",     k: "G" },
    { label: "Calorías", value: `${goals?.calories ?? 2185}`,  color: "text-cal",     bar: "bg-cal",     k: "K" },
  ];

  return (
    <div className="px-5 pt-4 pb-4 animate-[fadeUp_0.3s_ease]">
      <h1 className="font-display font-extrabold text-xl text-text mb-4">Mi Perfil</h1>

      {/* User card */}
      <div className="bg-card rounded-xl p-5 border border-border-l text-center mb-4">
        <div
          className="w-14 h-14 rounded-xl mx-auto mb-2.5 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2D6A4F 0%, #1B3D2A 100%)" }}
        >
          <User size={26} className="text-white" aria-hidden="true" />
        </div>
        <h2 className="font-display font-bold text-[17px] text-text">{name}</h2>
      </div>

      {/* Goals */}
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-sm font-bold text-text">Metas diarias</span>
        <Link href="/perfil/editar-metas" className="text-xs text-primary font-semibold no-underline">
          Editar
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {goalCards.map((m) => (
          <div key={m.k} className="bg-card rounded-xl p-3 border border-border-l relative overflow-hidden">
            {/* Colored top-accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${m.bar}`} aria-hidden="true" />
            <span className="text-xs text-sub">{m.label}</span>
            <span className={`font-display font-extrabold text-xl ${m.color} tabular-nums block mt-1`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Recurring order status */}
      <div className="bg-card rounded-xl p-4 border border-border-l mb-4">
        <span className="text-sm font-bold text-text">Pedido Recurrente</span>
        {recurring ? (
          <div className="mt-2.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <span className="text-xs font-semibold text-success">
                Activo · {recurring.days.map((d: string) => DAY_NAMES[d] ?? d).join(", ")}
              </span>
            </div>
            <p className="text-xs text-sub mb-2.5">
              {recurring.items.map((i) => i.name).join(", ")}
            </p>
            <Link href="/carrito" className="px-3 py-1.5 rounded-lg bg-primary-light text-primary font-bold text-xs no-underline">
              Editar
            </Link>
          </div>
        ) : (
          <p className="text-xs text-muted mt-2">Activa al pagar desde el carrito</p>
        )}
      </div>

      {/* Menu list */}
      <div className="bg-card rounded-xl overflow-hidden border border-border-l mb-4">
        {[
          { icon: Clock,         label: "Historial de pedidos",     href: "/perfil/historial" },
          { icon: Save,          label: "Combinaciones guardadas",  href: "/perfil/favoritos" },
          { icon: Shield,        label: "Condiciones de salud",     href: "/perfil/condiciones" },
          { icon: Accessibility, label: "Accesibilidad",            href: "/accesibilidad" },
          { icon: Settings,      label: "Configuración",            href: "#" },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-border-l last:border-b-0 no-underline transition-colors duration-150 active:bg-border-l"
          >
            <item.icon size={16} className="text-muted shrink-0" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-text">{item.label}</span>
            <ChevronRight size={13} className="text-muted" aria-hidden="true" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 rounded-xl border border-error/25 bg-error/5 text-error font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-95"
      >
        <LogOut size={15} aria-hidden="true" /> Cerrar sesión
      </button>
    </div>
  );
};
