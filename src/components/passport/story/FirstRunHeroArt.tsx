/**
 * A bespoke, vibrant illustration for the brand-new (first-run) Story hero —
 * a sunrise sky, rolling hills, a hot-air balloon and a dotted flight path.
 * Pure SVG, scales to fill its container. Decorative only.
 */
export function FirstRunHeroArt({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 480"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9B7CFF" />
          <stop offset="0.45" stopColor="#FF6B9A" />
          <stop offset="1" stopColor="#FFB84D" />
        </linearGradient>
        <radialGradient id="fr-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF6E0" />
          <stop offset="0.6" stopColor="#FFD98A" />
          <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fr-hillA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2EE6D6" />
          <stop offset="1" stopColor="#24D1C3" />
        </linearGradient>
        <linearGradient id="fr-hillB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7C6BFF" />
          <stop offset="1" stopColor="#6B5BE6" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="400" height="480" fill="url(#fr-sky)" />

      {/* Sun glow */}
      <circle cx="300" cy="150" r="120" fill="url(#fr-sun)" />
      <circle cx="300" cy="150" r="44" fill="#FFF3D6" />

      {/* Clouds */}
      <g fill="#FFFFFF" opacity="0.85">
        <ellipse cx="92" cy="120" rx="42" ry="16" />
        <ellipse cx="120" cy="110" rx="30" ry="14" />
        <ellipse cx="330" cy="250" rx="34" ry="13" opacity="0.7" />
      </g>

      {/* Dotted flight path */}
      <path
        d="M40 300 C 130 230, 210 360, 360 230"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 12"
        opacity="0.9"
      />
      {/* Little plane at the end of the path */}
      <g transform="translate(356 226) rotate(-32)" fill="#FFFFFF">
        <path d="M0 0 L18 5 L0 10 L4 5 Z" />
      </g>

      {/* Hot-air balloon */}
      <g transform="translate(150 150)">
        <path
          d="M0 0 C -34 0 -52 -26 -52 -52 C -52 -86 -26 -110 0 -110 C 26 -110 52 -86 52 -52 C 52 -26 34 0 0 0 Z"
          fill="#FF6B9A"
        />
        <path
          d="M-18 -104 C -30 -86 -34 -44 -22 -6 L -10 -1 C -20 -44 -16 -86 -6 -108 Z"
          fill="#FFB84D"
          opacity="0.95"
        />
        <path
          d="M18 -104 C 30 -86 34 -44 22 -6 L 10 -1 C 20 -44 16 -86 6 -108 Z"
          fill="#9B7CFF"
          opacity="0.9"
        />
        {/* lines + basket */}
        <g stroke="#14213D" strokeWidth="1.4" opacity="0.55">
          <line x1="-14" y1="-4" x2="-7" y2="14" />
          <line x1="14" y1="-4" x2="7" y2="14" />
        </g>
        <rect x="-8" y="13" width="16" height="12" rx="3" fill="#7A4A1E" />
      </g>

      {/* Hills */}
      <path
        d="M0 400 C 90 350 150 410 240 380 C 320 354 360 392 400 372 L400 480 L0 480 Z"
        fill="url(#fr-hillB)"
      />
      <path
        d="M0 430 C 80 398 170 446 260 420 C 330 400 372 430 400 418 L400 480 L0 480 Z"
        fill="url(#fr-hillA)"
      />
    </svg>
  );
}
