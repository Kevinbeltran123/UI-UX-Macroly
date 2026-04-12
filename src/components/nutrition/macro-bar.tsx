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

  return (
    <div className={cn(compact ? "mb-2" : "mb-3.5")}>
      <div className="flex justify-between mb-1">
        <span className={cn("font-semibold", compact ? "text-[11px]" : "text-xs")} style={{ color }}>
          {label}
        </span>
        <span
          className={cn(
            compact ? "text-[11px]" : "text-xs",
            over ? "text-error font-bold" : "text-sub",
          )}
        >
          {current}{unit} / {goal}{unit}
        </span>
      </div>
      <div
        className={cn("rounded-full overflow-hidden", compact ? "h-1.5" : "h-2")}
        style={{ background: lightColor }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: over ? "var(--color-error)" : color,
          }}
        />
      </div>
    </div>
  );
};
