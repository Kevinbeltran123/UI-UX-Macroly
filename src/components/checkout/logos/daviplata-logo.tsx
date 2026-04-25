/**
 * DaviPlata wordmark — stylised for academic use.
 * Brand color: #ED1C27 (Davivienda red).
 * Replace with official SVG from Davivienda's brand portal if available.
 */

type Props = { width?: number; height?: number; className?: string };

export function DaviplataLogo({ width = 96, height = 24, className }: Props) {
  return (
    <svg
      viewBox="0 0 130 36"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="DaviPlata"
    >
      {/* Davivienda little house mark on the left (simplified) */}
      <g transform="translate(2, 5)">
        <path
          d="M2 14 L13 4 L24 14 L24 26 L16 26 L16 18 L10 18 L10 26 L2 26 Z"
          fill="#ED1C27"
        />
        {/* small chimney / accent */}
        <rect x="18" y="6" width="3" height="4" fill="#ED1C27" />
      </g>

      {/* Wordmark: Davi (red) + Plata (dark) */}
      <text
        x="32"
        y="24"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontSize="18"
        fontWeight="900"
        letterSpacing="-0.4"
      >
        <tspan fill="#ED1C27">Davi</tspan>
        <tspan fill="#1A1A18">Plata</tspan>
      </text>

      {/* Signature dot above the "i" of Plata */}
      <circle cx="91" cy="9" r="1.6" fill="#FBA61A" />
    </svg>
  );
}
