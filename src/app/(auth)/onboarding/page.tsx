"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Minus, Plus } from "lucide-react";
import { computeCalories } from "@/domain/nutrition/macro-goals";
import { cn } from "@/lib/cn";

const SLIDERS = [
  { key: "protein" as const, label: "Proteína",      min: 50,  max: 300, color: "var(--color-protein)", light: "var(--color-protein-light)", tokenColor: "text-protein" },
  { key: "carbs"   as const, label: "Carbohidratos", min: 100, max: 500, color: "var(--color-carbs)",   light: "var(--color-carbs-light)",   tokenColor: "text-carbs"   },
  { key: "fat"     as const, label: "Grasas",        min: 20,  max: 150, color: "var(--color-fat)",     light: "var(--color-fat-light)",     tokenColor: "text-fat"     },
];

type MacroKey = "protein" | "carbs" | "fat";
type Goals = Record<MacroKey, number>;

function MacroSlider({
  label, value, min, max, color, light, tokenColor, onChange,
}: {
  label: string; value: number; min: number; max: number;
  color: string; light: string; tokenColor: string;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const pct = ((value - min) / (max - min)) * 100;

  const handleValueClick = () => {
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitDraft = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed)) onChange(clamp(parsed));
    setEditing(false);
  };

  return (
    <div className="mb-7">
      <div className="flex justify-between items-center mb-3">
        <span className={cn("text-sm font-bold", tokenColor)}>{label}</span>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => e.key === "Enter" && commitDraft()}
            className="w-20 text-right font-display font-extrabold text-base bg-transparent border-b-2 focus:outline-none"
            style={{ color, borderColor: color }}
          />
        ) : (
          <button
            onClick={handleValueClick}
            className="font-display font-extrabold text-base tabular-nums rounded px-1 active:opacity-60 transition-opacity"
            style={{ color }}
            aria-label={`Editar ${label}: ${value}g`}
          >
            {value}g
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(clamp(value - 1))}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center shrink-0 active:bg-border-l transition-colors"
          aria-label={`Reducir ${label}`}
        >
          <Minus size={13} className="text-sub" />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} ${pct}%, ${light} ${pct}%)`,
            accentColor: color,
          }}
          aria-label={label}
        />
        <button
          onClick={() => onChange(clamp(value + 1))}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center shrink-0 active:bg-border-l transition-colors"
          aria-label={`Aumentar ${label}`}
        >
          <Plus size={13} className="text-sub" />
        </button>
      </div>

      <div className="flex justify-between mt-1 px-10">
        <span className="text-[10px] text-muted">{min}g</span>
        <span className="text-[10px] text-muted">{max}g</span>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goals>({ protein: 150, carbs: 250, fat: 65 });
  const [loading, setLoading] = useState(false);

  const setMacro = (key: MacroKey) => (v: number) => setGoals((g) => ({ ...g, [key]: v }));
  const calories = computeCalories({ ...goals });

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("macro_goals").upsert({ user_id: user.id, ...goals });
    }
    router.push("/inicio");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <div className="flex-1 px-5 pt-10 pb-6 flex flex-col">
        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-6 h-2.5 rounded-[5px] bg-primary" />
        </div>

        <div className="mb-8">
          <h1 className="font-display font-black text-xl text-text">Configura tus metas</h1>
          <p className="text-sm text-sub mt-1">Define tus objetivos diarios de macronutrientes</p>
        </div>

        <div className="flex-1">
          {SLIDERS.map((s) => (
            <MacroSlider
              key={s.key}
              label={s.label}
              value={goals[s.key]}
              min={s.min}
              max={s.max}
              color={s.color}
              light={s.light}
              tokenColor={s.tokenColor}
              onChange={setMacro(s.key)}
            />
          ))}
        </div>

        {/* Calorie + action — unified bottom row */}
        <div className="mt-2 flex items-center gap-3 bg-card rounded-xl p-4 border border-border-l mb-4">
          <div className="flex-1">
            <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">Total</p>
            <p className="font-display font-extrabold text-2xl text-text tabular-nums leading-none">
              {calories.toLocaleString()}
              <span className="text-sm font-semibold text-sub ml-1">kcal/día</span>
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-3 bg-primary-dark text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-opacity shrink-0"
          >
            {loading ? "Guardando…" : "Comenzar"}
          </button>
        </div>

        <button
          onClick={() => router.push("/inicio")}
          className="text-center text-sm text-primary-mid font-semibold bg-transparent border-none cursor-pointer"
        >
          Saltar por ahora
        </button>
      </div>
    </div>
  );
}
