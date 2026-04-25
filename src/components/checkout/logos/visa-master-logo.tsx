/**
 * Composite mark for the "Tarjeta" payment method — shows Visa + Mastercard
 * side by side, the way Colombian processors (PayU, Mercado Pago) do.
 *
 * The Visa wordmark and Mastercard interlocking circles are used here as
 * brand identifiers for a payment-method picker (fair use / nominative use).
 * Swap for the official SVG assets from each network's brand center if needed.
 */

type Props = { width?: number; height?: number; className?: string };

export function VisaMasterLogo({ width = 92, height = 28, className }: Props) {
  return (
    <svg
      viewBox="0 0 132 40"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Acepta Visa, Mastercard, American Express y Diners"
    >
      {/* Visa wordmark */}
      <text
        x="2"
        y="28"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontStyle="italic"
        fontWeight="900"
        fontSize="22"
        letterSpacing="-0.5"
        fill="#1A1F71"
      >
        VISA
      </text>
      {/* Visa underline accent */}
      <rect x="2" y="32" width="58" height="2.5" fill="#F7B600" />

      {/* Divider */}
      <line x1="68" y1="6" x2="68" y2="34" stroke="#E0E0E0" strokeWidth="1" />

      {/* Mastercard interlocking circles */}
      <g transform="translate(80, 8)">
        <circle cx="11" cy="12" r="11" fill="#EB001B" />
        <circle cx="22" cy="12" r="11" fill="#F79E1B" />
        {/* Overlap region — multiply effect rendered as solid orange */}
        <path
          d="M16.5 4 a 11 11 0 0 1 0 16 a 11 11 0 0 1 0 -16 z"
          fill="#FF5F00"
        />
      </g>
      {/* Mastercard tiny wordmark */}
      <text
        x="80"
        y="38"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="700"
        fontSize="6"
        letterSpacing="0.5"
        fill="#1A1A18"
      >
        mastercard
      </text>
    </svg>
  );
}
