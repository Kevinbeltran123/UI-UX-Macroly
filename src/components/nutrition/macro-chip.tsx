/* Bordered chips — less template-y than filled pills, same info density */
const MACRO_STYLES = {
  protein: { bg: "bg-protein-light", text: "text-protein", label: "P" },
  carbs:   { bg: "bg-carbs-light",   text: "text-carbs",   label: "C" },
  fat:     { bg: "bg-fat-light",     text: "text-fat",     label: "G" },
} as const;

type MacroChipProps = {
  type: keyof typeof MACRO_STYLES;
  value: number;
  compact?: boolean;
};

export const MacroChip = ({ type, value, compact = false }: MacroChipProps) => {
  const s = MACRO_STYLES[type];
  return (
    <span
      className={`${s.bg} ${s.text} font-semibold rounded tabular-nums ${
        compact ? "text-[8px] px-1.5 py-0.5" : "text-[11px] px-2.5 py-1"
      }`}
    >
      {s.label} {value}g
    </span>
  );
};
