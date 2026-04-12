export const LogoIsotipo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <g transform="translate(32,30)">
      <path d="M-16,2 L-11,-14 L21,-14 L18,12 L-13,12 Z" fill="none" stroke="#1B5E20" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M-23,-6 L-16,2" fill="none" stroke="#1B5E20" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="-8" cy="19" r="4" fill="#1B5E20" />
      <circle cx="13" cy="19" r="4" fill="#1B5E20" />
      <rect x="-7" y="-9" width="22" height="4.5" rx="2.25" fill="#C8E6C9" />
      <rect x="-7" y="-9" width="17" height="4.5" rx="2.25" fill="#43A047" />
      <rect x="-7" y="-2.5" width="22" height="4.5" rx="2.25" fill="#FFE0B2" />
      <rect x="-7" y="-2.5" width="13" height="4.5" rx="2.25" fill="#FB8C00" />
      <rect x="-7" y="4" width="22" height="4.5" rx="2.25" fill="#BBDEFB" />
      <rect x="-7" y="4" width="9" height="4.5" rx="2.25" fill="#1E88E5" />
    </g>
  </svg>
);

export const LogoText = ({ size = 20 }: { size?: number }) => (
  <span className="font-display font-black" style={{ fontSize: size }}>
    <span className="text-primary-dark">Macro</span>
    <span className="text-primary-mid">ly</span>
  </span>
);

export const Logo = ({ iconSize = 32, textSize = 18 }: { iconSize?: number; textSize?: number }) => (
  <div className="flex items-center gap-2">
    <LogoIsotipo size={iconSize} />
    <LogoText size={textSize} />
  </div>
);
