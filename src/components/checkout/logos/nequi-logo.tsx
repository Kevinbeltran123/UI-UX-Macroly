/**
 * Nequi wordmark — stylised representation for academic use.
 * Brand color: #DA0081 (Nequi pink/magenta).
 *
 * To use the official asset: replace this component's body with the SVG
 * downloaded from Nequi's press kit (https://www.nequi.com/prensa) — the
 * outer signature `width/height` props should remain compatible.
 */

type Props = { width?: number; height?: number; className?: string };

export function NequiLogo({ width = 70, height = 24, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 36"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Nequi"
    >
      {/* Hot-pink rounded background tile common in Nequi marketing chips */}
      <rect x="0" y="0" width="100" height="36" rx="10" fill="#DA0081" />
      {/* Lowercase wordmark */}
      <text
        x="50"
        y="25"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontSize="20"
        fontWeight="800"
        letterSpacing="-0.6"
        fill="white"
      >
        nequi
      </text>
      {/* Heart-shaped dot replacing the dot of the "i" — Nequi signature */}
      <path
        d="M68.5 7 c -1.2 -1.4 -3.4 -1.4 -4 0.4 c -0.6 -1.8 -2.8 -1.8 -4 -0.4 c -1.4 1.6 -0.4 4 4 6.4 c 4.4 -2.4 5.4 -4.8 4 -6.4 z"
        fill="white"
      />
    </svg>
  );
}
