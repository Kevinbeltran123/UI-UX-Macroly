"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { useGoalsStore } from "@/stores/goals-store";
import { useToastStore } from "@/stores/toast-store";

export default function PresupuestoPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setInitialLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("max_budget")
        .eq("id", user.id)
        .single();
      if (data) setBudget(data.max_budget ?? null);
      setInitialLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // T-3-03: clamp — save null when budget <= 0 (0 means "no budget active")
    const valueToSave = budget && budget > 0 ? budget : null;

    const { error } = await supabase
      .from("profiles")
      .update({ max_budget: valueToSave })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      useToastStore.getState().add("No se pudo guardar. Intenta de nuevo.", "error");
      return;
    }

    // Sync store immediately — no refetch needed (pattern from condiciones/page.tsx)
    useGoalsStore.setState({ budget: valueToSave });
    // Optional success toast
    useToastStore.getState().add("Presupuesto guardado", "success");
    router.push("/perfil");
    router.refresh();
  };

  return (
    <div className="px-5 pb-6 animate-[fadeUp_0.3s_ease]">
      <Link
        href="/perfil"
        className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline"
      >
        <ArrowLeft size={16} /> Volver
      </Link>

      <h1 className="font-display font-bold text-xl text-text mb-6">Presupuesto</h1>

      <p className="text-xs font-bold text-sub uppercase tracking-wider mb-2">
        Presupuesto máximo de compra
      </p>

      <p className="text-sm text-sub mb-6">
        Define cuánto quieres gastar por período de compra. Solo verás recomendaciones que caben en tu presupuesto.
      </p>

      <div className="relative mb-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-sub font-semibold pointer-events-none">$</span>
        <input
          id="budget-input"
          type="number"
          inputMode="numeric"
          min="0"
          step="1000"
          value={budget ?? ""}
          onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : null)}
          placeholder="0"
          disabled={initialLoading}
          aria-label="Presupuesto máximo de compra"
          aria-describedby="budget-helper"
          className="w-full rounded-[14px] border border-border bg-card pl-8 pr-4 py-4 font-display font-bold text-[17px] text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
        />
      </div>

      <p id="budget-helper" className="text-[11px] text-muted mb-6">
        Déjalo en 0 para no aplicar presupuesto
      </p>

      <button
        onClick={handleSave}
        disabled={loading || initialLoading}
        aria-busy={loading}
        className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-display font-bold text-sm rounded-[14px] shadow-[0_4px_16px_rgba(46,125,50,.3)] disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar presupuesto"}
      </button>
    </div>
  );
}
