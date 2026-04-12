import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";
import { Bell, Zap, Calendar, BookOpen } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import Link from "next/link";

export default async function InicioPage() {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  const firstName = user.user?.user_metadata?.full_name?.split(" ")[0] ?? "Usuario";

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("protein", { ascending: false })
    .limit(6);

  const mapped = (products ?? []).map(mapProduct);

  return (
    <div className="px-5 pt-4 pb-4">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-xs text-sub">Buenos dias</p>
          <h1 className="font-display font-black text-xl text-text mt-0.5">
            Hola, {firstName}
          </h1>
        </div>
        <button
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
          aria-label="Notificaciones"
        >
          <Bell size={18} className="text-text" />
        </button>
      </div>

      {/* Macro progress placeholder */}
      <div className="bg-gradient-to-br from-primary-dark to-primary rounded-xl p-5 text-white mb-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/5" />
        <div className="flex justify-between items-center mb-3">
          <span className="text-[13px] font-semibold opacity-90">Macros del carrito</span>
          <span className="text-[11px] bg-white/15 px-2.5 py-1 rounded-lg font-semibold">0%</span>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Proteina", value: "0g", color: "#43A047", pct: 0 },
            { label: "Carbos", value: "0g", color: "#FB8C00", pct: 0 },
            { label: "Grasas", value: "0g", color: "#1E88E5", pct: 0 },
          ].map((m) => (
            <div key={m.label} className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] opacity-70">{m.label}</span>
                <span className="text-[10px] font-bold">{m.value}</span>
              </div>
              <div className="h-1 bg-white/15 rounded-full">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${m.pct}%`, background: m.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2.5 mb-5">
        {[
          { icon: Zap, label: "Completar", bg: "bg-accent-light", href: "/catalogo" },
          { icon: Calendar, label: "Planificar", bg: "bg-protein-light", href: "/catalogo" },
          { icon: BookOpen, label: "Educacion", bg: "bg-carbs-light", href: "/educacion" },
        ].map(({ icon: Icon, label, bg, href }) => (
          <Link
            key={label}
            href={href}
            className={`flex-1 ${bg} rounded-xl py-3.5 flex flex-col items-center gap-1.5 no-underline`}
          >
            <Icon size={20} className="text-text" />
            <span className="text-[10px] font-bold text-text">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recommended products */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display font-extrabold text-base">Recomendados</h3>
        <Link href="/catalogo" className="text-xs text-primary font-semibold no-underline">
          Ver todo
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {mapped.map((p) => (
          <ProductCard key={p.id} product={p} badge="Alto en proteina" />
        ))}
      </div>
    </div>
  );
}
