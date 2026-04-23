"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useGoalsStore } from "@/stores/goals-store";
import { useToastStore } from "@/stores/toast-store";

// Canonical restriction tag values (D-13) — snake_case internal, display labels for UI
const VALID_RESTRICTIONS = [
  "vegano",
  "sin_gluten",
  "sin_lactosa",
  "sin_mariscos",
  "alto_proteico",
] as const;

const CHIP_LABELS: Record<string, string> = {
  vegano: "Vegano",
  sin_gluten: "Sin gluten",
  sin_lactosa: "Sin lactosa",
  sin_mariscos: "Sin mariscos",
  alto_proteico: "Alto en proteína",
};

export default function CondicionesPage() {
  const { restrictions } = useGoalsStore();
  const [localRestrictions, setLocalRestrictions] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  // Sync from store on mount (pre-loaded by GoalsLoader — D-05)
  useEffect(() => {
    setLocalRestrictions(restrictions);
  }, [restrictions]);

  const handleToggle = async (tag: string) => {
    const newRestrictions = localRestrictions.includes(tag)
      ? localRestrictions.filter((r) => r !== tag)
      : [...localRestrictions, tag];

    // T-2-05-01: Allowlist guard — filter to canonical values before persisting
    // Prevents arbitrary string injection into dietary_restrictions column
    const safeRestrictions = newRestrictions.filter((r) =>
      (VALID_RESTRICTIONS as readonly string[]).includes(r)
    );

    setLocalRestrictions(safeRestrictions); // optimistic update
    setSaving(tag);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(null);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ dietary_restrictions: safeRestrictions })
      .eq("id", user.id);

    setSaving(null);

    if (error) {
      setLocalRestrictions(localRestrictions); // revert on failure
      useToastStore.getState().add("No se pudo guardar. Intenta de nuevo.", "error");
    }
  };

  return (
    <div className="px-5 pb-6 animate-[fadeUp_0.3s_ease]">
      {/* Back navigation — matches editar-metas/page.tsx line 53 */}
      <Link
        href="/perfil"
        className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline"
      >
        <ArrowLeft size={16} /> Volver
      </Link>

      {/* Page title — font-display font-bold (UI-SPEC: 700, not 900) */}
      <h1 className="font-display font-bold text-xl text-text mb-6">Condiciones de salud</h1>

      {/* Section label — matches period-selector pattern */}
      <p className="text-xs font-bold text-sub uppercase tracking-wider mb-2">
        Restricciones dietéticas
      </p>

      {/* Section description */}
      <p className="text-sm text-sub mb-6">
        Selecciona tus restricciones. Solo verás productos compatibles en tus recomendaciones.
      </p>

      {/* Chip grid — role="group" for accessibility */}
      <div
        role="group"
        aria-label="Restricciones dietéticas"
        className="flex flex-wrap gap-2"
      >
        {VALID_RESTRICTIONS.map((tag) => {
          const isSelected = localRestrictions.includes(tag);
          const isSaving = saving === tag;
          return (
            <button
              key={tag}
              onClick={() => handleToggle(tag)}
              disabled={saving !== null}
              role="checkbox"
              aria-checked={isSelected}
              aria-label={CHIP_LABELS[tag]}
              aria-busy={isSaving}
              className={[
                "px-4 py-3 rounded-full text-sm font-bold whitespace-nowrap border transition-all",
                isSelected
                  ? "bg-primary-light border-primary-border text-primary"
                  : "bg-card border-border text-sub",
                saving !== null ? "opacity-60" : "",
              ]
                .join(" ")
                .trim()}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                CHIP_LABELS[tag]
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
