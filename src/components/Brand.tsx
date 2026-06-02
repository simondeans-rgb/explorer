import { cn } from '../lib/cn';

/** The Worldly globe mark — a gradient roundel with a clean meridian globe. */
export function WorldlyMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="worldly-mark"
          x1="8"
          y1="8"
          x2="56"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FF6A55" />
          <stop offset="0.45" stopColor="#FF8B79" />
          <stop offset="1" stopColor="#5B6CFF" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#worldly-mark)" />
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <circle cx="32" cy="32" r="15" opacity="0.95" />
        <ellipse cx="32" cy="32" rx="6.4" ry="15" opacity="0.85" />
        <line x1="17" y1="32" x2="47" y2="32" opacity="0.85" />
        <path d="M20 24 Q32 30 44 24" opacity="0.7" />
        <path d="M20 40 Q32 34 44 40" opacity="0.7" />
      </g>
    </svg>
  );
}

/** The Worldly wordmark + optional tagline lockup. */
export function WorldlyLogo({
  size = 28,
  tagline,
  className,
}: {
  size?: number;
  tagline?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <WorldlyMark size={size} />
      <div className="leading-none">
        <div className="font-display font-semibold text-[1.15rem] tracking-tight text-passport-navy dark:text-white">
          Worldly
        </div>
        {tagline && (
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-passport-gold mt-0.5">
            {tagline}
          </div>
        )}
      </div>
    </div>
  );
}
