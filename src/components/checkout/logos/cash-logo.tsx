/**
 * Stylised Colombian peso bill — for the "Efectivo" method.
 * Not a real currency rendering, just a visual cue.
 */

type Props = { width?: number; height?: number; className?: string };

export function CashLogo({ width = 64, height = 32, className }: Props) {
  return (
    <svg
      viewBox="0 0 80 44"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Efectivo"
    >
      {/* Bill body */}
      <rect
        x="2"
        y="6"
        width="76"
        height="32"
        rx="3"
        fill="#EDF5F0"
        stroke="#2D6A4F"
        strokeWidth="1.5"
      />

      {/* Inner border (stylised security frame) */}
      <rect x="6" y="10" width="68" height="24" rx="1.5" fill="none" stroke="#2D6A4F" strokeWidth="0.6" strokeDasharray="2 1.5" opacity="0.5" />

      {/* Central oval portrait area */}
      <ellipse cx="40" cy="22" rx="11" ry="8" fill="white" stroke="#2D6A4F" strokeWidth="0.8" />

      {/* "$" symbol in oval */}
      <text
        x="40"
        y="26.5"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="900"
        fontSize="13"
        fill="#1B3D2A"
      >
        $
      </text>

      {/* Corner denomination */}
      <text
        x="9"
        y="17"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="800"
        fontSize="6.5"
        fill="#1B3D2A"
      >
        COP
      </text>
      <text
        x="71"
        y="32"
        textAnchor="end"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="800"
        fontSize="6.5"
        fill="#1B3D2A"
      >
        COP
      </text>
    </svg>
  );
}
