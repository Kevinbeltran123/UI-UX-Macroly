"use client";

import { cn } from "@/lib/cn";
import type { MacroFilter } from "@/domain/catalog/filters";

const FILTERS: Array<{ id: MacroFilter; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "highProtein", label: "Alto en proteina" },
  { id: "lowCarb", label: "Bajo en carbos" },
  { id: "lowFat", label: "Bajo en grasa" },
  { id: "bestValue", label: "Mejor precio/g" },
];

type Props = {
  value: MacroFilter;
  onChange: (filter: MacroFilter) => void;
};

export const MacroFilterChips = ({ value, onChange }: Props) => (
  <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
    {FILTERS.map((f) => (
      <button
        key={f.id}
        onClick={() => onChange(f.id)}
        className={cn(
          "px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap border transition-all flex-shrink-0",
          value === f.id
            ? "bg-primary-light border-primary-border text-primary"
            : "bg-card border-border text-sub",
        )}
      >
        {f.label}
      </button>
    ))}
  </div>
);
