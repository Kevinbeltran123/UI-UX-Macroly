"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { computeCalories } from "@/domain/nutrition/macro-goals";
import Link from "next/link";

export default function EditarMetasPage() {
  const router = useRouter();
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(250);
  const [fat, setFat] = useState(65);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("macro_goals").select("*").eq("user_id", user.id).single();
      if (data) {
        setProtein(data.protein);
        setCarbs(data.carbs);
        setFat(data.fat);
      }
    };
    load();
  }, []);

  const calories = computeCalories({ protein, carbs, fat });

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("macro_goals").upsert({ user_id: user.id, protein, carbs, fat });
    }
    router.push("/perfil");
    router.refresh();
  };

  const sliders = [
    { label: "Proteína", value: protein, set: setProtein, min: 50, max: 300, color: "#43A047", light: "#E8F5E9" },
    { label: "Carbohidratos", value: carbs, set: setCarbs, min: 100, max: 500, color: "#FB8C00", light: "#FFF3E0" },
    { label: "Grasas", value: fat, set: setFat, min: 20, max: 150, color: "#1E88E5", light: "#E3F2FD" },
  ];

  return (
    <div className="px-5 pb-6">
      <Link href="/perfil" className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline">
        <ArrowLeft size={16} /> Volver
      </Link>

      <h1 className="font-display font-black text-xl text-text mb-6">Editar metas</h1>

      {sliders.map((s) => (
        <div key={s.label} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold" style={{ color: s.color }}>{s.label}</span>
            <span className="font-display font-extrabold text-base" style={{ color: s.color }}>{s.value}g</span>
          </div>
          <input
            type="range"
            min={s.min}
            max={s.max}
            value={s.value}
            onChange={(e) => s.set(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${s.color} ${((s.value - s.min) / (s.max - s.min)) * 100}%, ${s.light} ${((s.value - s.min) / (s.max - s.min)) * 100}%)`,
              accentColor: s.color,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-muted">{s.min}g</span>
            <span className="text-[11px] text-muted">{s.max}g</span>
          </div>
        </div>
      ))}

      <div className="bg-cal-light rounded-[14px] p-4 flex items-center gap-3.5 mb-6 border border-cal/15">
        <div className="w-10 h-10 rounded-xl bg-cal flex items-center justify-center flex-shrink-0">
          <BarChart3 size={20} className="text-white" />
        </div>
        <div>
          <p className="font-display font-black text-xl text-cal">= {calories.toLocaleString()} kcal/día</p>
          <p className="text-[11px] text-muted mt-0.5">Calculado automáticamente</p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-display font-bold text-[15px] rounded-[14px] shadow-[0_4px_16px_rgba(46,125,50,.3)] disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar metas"}
      </button>
    </div>
  );
}
