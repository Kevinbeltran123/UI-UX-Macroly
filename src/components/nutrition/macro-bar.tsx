import { cn } from "@/lib/cn";

type MacroBarProps = {
  label: string;
  current: number;
  goal: number;
  color: string;
  lightColor: string;
  unit?: string;
  compact?: boolean;
};

export const MacroBar = ({
  label,
  current,
  goal,
  color,
  lightColor,
  unit = "g",
  compact = false,
}: MacroBarProps) => {
  const pct = Math.min((current / goal) * 100, 100);
  const over = current > goal;
  const fillColor = over ? "var(--color-error)" : color;

  return (
    <div className={cn(compact ? "mb-2" : "mb-3.5")}>
      <div className="flex justify-between mb-1.5">
        <span
          className={cn("font-semibold", "text-xs")}
          style={{ color }}
        >
          {label}
        </span>
        <span
          className={cn(
            "tabular-nums",
            "text-xs",
            over ? "text-error font-bold" : "text-sub",
          )}
        >
          {current}{unit} / {goal}{unit}
        </span>
      </div>

      {/* Bar with tracking dot at fill endpoint */}
      <div className="relative" style={{ paddingBottom: compact ? 0 : "1px" }}>
        <div
          className={cn("rounded-full overflow-hidden", compact ? "h-1.5" : "h-1.5")}
          style={{ background: lightColor }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%`, background: fillColor }}
          />
        </div>
        {/* Tracking dot — only shown when there's meaningful progress */}
        {!compact && pct > 2 && pct <= 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-card shadow-sm transition-[left] duration-700 ease-out"
            style={{
              left: `calc(${pct}% - 5px)`,
              background: fillColor,
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};
