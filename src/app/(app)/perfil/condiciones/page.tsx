"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Check, Leaf, WheatOff, MilkOff, Fish, Dumbbell } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useGoalsStore } from "@/stores/goals-store";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/cn";

const VALID_RESTRICTIONS = [
  "vegano",
  "sin_gluten",
  "sin_lactosa",
  "sin_mariscos",
  "alto_proteico",
] as const;

const RESTRICTION_META: Record<string, {
  label: string;
  description: string;
  icon: React.ElementType;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
}> = {
  vegano: {
    label: "Vegano",
    description: "Sin productos de origen animal",
    icon: Leaf,
    activeColor: "text-primary",
    activeBg: "bg-primary-light",
    activeBorder: "border-primary-border",
  },
  sin_gluten: {
    label: "Sin gluten",
    description: "Sin trigo, cebada ni centeno",
    icon: WheatOff,
    activeColor: "text-accent",
    activeBg: "bg-accent/10",
    activeBorder: "border-accent/30",
  },
  sin_lactosa: {
    label: "Sin lactosa",
    description: "Sin leche ni derivados",
    icon: MilkOff,
    activeColor: "text-carbs",
    activeBg: "bg-carbs-light",
    activeBorder: "border-carbs/30",
  },
  sin_mariscos: {
    label: "Sin mariscos",
    description: "Sin mariscos ni crustáceos",
    icon: Fish,
    activeColor: "text-fat",
    activeBg: "bg-fat-light",
    activeBorder: "border-fat/30",
  },
  alto_proteico: {
    label: "Alto en proteína",
    description: "Prioriza alimentos ricos en proteína",
    icon: Dumbbell,
    activeColor: "text-protein",
    activeBg: "bg-protein-light",
    activeBorder: "border-protein/30",
  },
};

export default function CondicionesPage() {
  const { restrictions } = useGoalsStore();
  const [localRestrictions, setLocalRestrictions] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [justToggled, setJustToggled] = useState<string | null>(null);

  useEffect(() => {
    setLocalRestrictions(restrictions);
  }, [restrictions]);

  const handleToggle = async (tag: string) => {
    const newRestrictions = localRestrictions.includes(tag)
      ? localRestrictions.filter((r) => r !== tag)
      : [...localRestrictions, tag];

    const safeRestrictions = newRestrictions.filter((r) =>
      (VALID_RESTRICTIONS as readonly string[]).includes(r)
    );

    setLocalRestrictions(safeRestrictions);
    setJustToggled(tag);
    setTimeout(() => setJustToggled(null), 350);
    setSaving(tag);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(null); return; }

    const { error } = await supabase
      .from("profiles")
      .update({ dietary_restrictions: safeRestrictions })
      .eq("id", user.id);

    setSaving(null);

    if (error) {
      setLocalRestrictions(localRestrictions);
      useToastStore.getState().add("No se pudo guardar. Intenta de nuevo.", "error");
    } else {
      useGoalsStore.setState({ restrictions: safeRestrictions });
    }
  };

  const activeCount = localRestrictions.length;

  return (
    <div className="px-5 pb-8 animate-[fadeUp_0.3s_ease]">
      <Link
        href="/perfil"
        className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline"
      >
        <ArrowLeft size={16} /> Volver
      </Link>

      <h1 className="font-display font-bold text-xl text-text mb-1">Condiciones de salud</h1>
      <p className="text-sm text-sub mb-6">
        Solo verás productos compatibles con tus restricciones en recomendaciones.
      </p>

      <div
        role="group"
        aria-label="Restricciones dietéticas"
        className="grid grid-cols-2 gap-2.5"
      >
        {VALID_RESTRICTIONS.map((tag, index) => {
          const meta = RESTRICTION_META[tag];
          const Icon = meta.icon;
          const isSelected = localRestrictions.includes(tag);
          const isSaving = saving === tag;
          const isPopping = justToggled === tag;

          return (
            <button
              key={tag}
              onClick={() => handleToggle(tag)}
              disabled={saving !== null}
              role="checkbox"
              aria-checked={isSelected}
              aria-label={meta.label}
              aria-busy={isSaving}
              className={cn(
                "relative p-4 rounded-xl border text-left transition-all duration-200 animate-[staggerFadeUp_0.35s_ease_both]",
                isPopping && "animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)_both]",
                isSelected
                  ? cn("border", meta.activeBorder, meta.activeBg)
                  : "bg-card border-border-l",
                saving !== null && !isSaving ? "opacity-50" : ""
              )}
              style={{ animationDelay: `${index * 55}ms` }}
            >
              {/* Checkmark or spinner — top-right corner */}
              <div className="absolute top-3 right-3">
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin text-muted" />
                ) : isSelected ? (
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", meta.activeBg, meta.activeColor)}>
                    <Check size={11} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border" />
                )}
              </div>

              {/* Icon container */}
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors duration-200",
                isSelected ? cn(meta.activeBg, meta.activeColor) : "bg-border-l text-muted"
              )}>
                <Icon size={17} aria-hidden="true" />
              </div>

              <p className={cn(
                "text-xs font-bold mb-0.5 transition-colors duration-200",
                isSelected ? meta.activeColor : "text-text"
              )}>
                {meta.label}
              </p>
              <p className="text-xs text-sub leading-tight">{meta.description}</p>
            </button>
          );
        })}
      </div>

      {/* Active restrictions summary — only shown when at least one is active */}
      {activeCount > 0 && (
        <div className="mt-5 rounded-xl px-4 py-3 border bg-primary-light border-primary-border">
          <p className="text-xs font-semibold text-primary">
            {activeCount} restricción{activeCount !== 1 ? "es" : ""} activa{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
