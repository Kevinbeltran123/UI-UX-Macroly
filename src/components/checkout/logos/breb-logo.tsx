/**
 * Bre-B wordmark — stylised for academic use.
 * Bre-B is Colombia's interbank instant payments system, launched by the
 * Banco de la República in 2024. Brand color: deep teal.
 *
 * Official assets: https://www.banrep.gov.co/es/Bre-B (press materials)
 */

type Props = { width?: number; height?: number; className?: string };

export function BrebLogo({ width = 64, height = 24, className }: Props) {
  return (
    <svg
      viewBox="0 0 80 36"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Bre-B"
    >
      {/* Stylised "B" mark on the left — chunky bracket form to evoke the official mark */}
      <g transform="translate(2, 4)">
        <path
          d="M0 0 L18 0 Q26 0 26 7 Q26 12 22 14 Q26 16 26 21 Q26 28 18 28 L0 28 Z M6 5 L17 5 Q21 5 21 8 Q21 11 17 11 L6 11 Z M6 16 L17 16 Q21 16 21 20 Q21 23 17 23 L6 23 Z"
          fill="#0E7C7B"
        />
        {/* Accent dot — like the diacritical mark on the official Bre-B logo */}
        <circle cx="29" cy="14" r="2.4" fill="#52B788" />
      </g>

      {/* Wordmark: Bre-B */}
      <text
        x="40"
        y="24"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontSize="18"
        fontWeight="900"
        letterSpacing="-0.4"
      >
        <tspan fill="#0E7C7B">Bre</tspan>
        <tspan fill="#1A1A18">-</tspan>
        <tspan fill="#0E7C7B">B</tspan>
      </text>
    </svg>
  );
}
