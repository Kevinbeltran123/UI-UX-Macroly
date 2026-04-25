"use client";

import { cn } from "@/lib/cn";
import type { MacroFilter } from "@/domain/catalog/filters";

const FILTERS: Array<{ id: MacroFilter; label: string }> = [
  { id: "todos",       label: "Todos" },
  { id: "highProtein", label: "Alto en proteína" },
  { id: "lowCarb",     label: "Bajo en carbos" },
  { id: "lowFat",      label: "Bajo en grasa" },
  { id: "bestValue",   label: "Mejor precio/g" },
];

type Props = {
  value: MacroFilter;
  onChange: (filter: MacroFilter) => void;
};

/* Tab-underline style — visually different from the category pills above */
export const MacroFilterChips = ({ value, onChange }: Props) => (
  <div className="flex overflow-x-auto scrollbar-hide border-b border-border-l mb-3">
    {FILTERS.map((f) => {
      const active = value === f.id;
      return (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          aria-pressed={active}
          className={cn(
            "px-3 pb-2 pt-1.5 text-xs font-semibold whitespace-nowrap shrink-0 relative transition-all duration-150 active:scale-95 min-h-11",
            active ? "text-primary" : "text-muted"
          )}
        >
          {f.label}
          <span
            className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200",
              active ? "w-4/5 bg-primary" : "w-0 bg-transparent"
            )}
            aria-hidden="true"
          />
        </button>
      );
    })}
  </div>
);
