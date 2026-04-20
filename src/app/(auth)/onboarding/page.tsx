"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoIsotipo } from "@/components/layout/logo";
import { BarChart3 } from "lucide-react";
import { computeCalories } from "@/domain/nutrition/macro-goals";

export default function OnboardingPage() {
  const router = useRouter();
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(250);
  const [fat, setFat] = useState(65);
  const [loading, setLoading] = useState(false);

  const calories = computeCalories({ protein, carbs, fat });

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("macro_goals")
        .upsert({ user_id: user.id, protein, carbs, fat });
    }
    router.push("/inicio");
    router.refresh();
  };

  const sliders = [
    { label: "Proteína", value: protein, set: setProtein, min: 50, max: 300, color: "#43A047", light: "#E8F5E9" },
    { label: "Carbohidratos", value: carbs, set: setCarbs, min: 100, max: 500, color: "#FB8C00", light: "#FFF3E0" },
    { label: "Grasas", value: fat, set: setFat, min: 20, max: 150, color: "#1E88E5", light: "#E3F2FD" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <div className="flex-1 px-7 pt-10 pb-6 flex flex-col">
        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-6 h-2.5 rounded-[5px] bg-primary" />
        </div>

        <div className="text-center mb-8">
          <LogoIsotipo size={44} />
          <h1 className="font-display font-black text-2xl text-text mt-4">Configura tus metas</h1>
          <p className="text-sm text-sub mt-1.5">Define tus objetivos diarios de macronutrientes</p>
        </div>

        {/* Sliders */}
        <div className="flex-1 flex flex-col gap-6">
          {sliders.map((s) => {
            const sliderId = `slider-${s.label.toLowerCase()}`;
            return (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-2.5">
                  <label htmlFor={sliderId} className="text-sm font-bold" style={{ color: s.color }}>{s.label}</label>
                  <span className="font-display font-extrabold text-base" style={{ color: s.color }} aria-hidden="true">{s.value}g</span>
                </div>
                <input
                  id={sliderId}
                  type="range"
                  min={s.min}
                  max={s.max}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  aria-valuetext={`${s.value} gramos de ${s.label.toLowerCase()}`}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
            );
          })}
        </div>

        {/* Calories auto-calc */}
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
          className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-display font-bold text-base rounded-[14px] shadow-[0_4px_16px_rgba(46,125,50,.3)] disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Comenzar"}
        </button>
        <button
          onClick={() => router.push("/inicio")}
          className="mt-3.5 text-center text-sm text-primary-mid font-semibold bg-transparent border-none cursor-pointer"
        >
          Saltar por ahora
        </button>
      </div>
    </div>
  );
}
