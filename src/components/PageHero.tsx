import { ChevronLeft, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * The organic wave edge that melts a coloured header into the page below —
 * the signature motif borrowed from the Story hero, shared across every page so
 * the whole app reads as one continuous surface.
 */
export function WaveEdge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn(
        'absolute -bottom-px inset-x-0 w-full h-[42px] text-warmwhite dark:text-passport-night',
        className,
      )}
    >
      <path
        fill="currentColor"
        d="M0,64 C220,118 460,16 720,44 C980,72 1220,120 1440,70 L1440,121 L0,121 Z"
      />
    </svg>
  );
}

/**
 * A cohesive coloured page header in the Story hero's language: an eyebrow, a
 * Fraunces title, optional subtitle, a faded duotone icon, soft decorative
 * shapes, and the wave edge. Each page passes its own on-brand gradient so the
 * surfaces feel like distinct chapters of the same book.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  gradient = 'bg-brand-gradient',
  trailing,
  onBack,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Tailwind background class (e.g. an arbitrary linear-gradient). */
  gradient?: string;
  trailing?: React.ReactNode;
  /** When set, renders a back chevron (used on sub-pages). */
  onBack?: () => void;
}) {
  return (
    <div className="relative -mx-4 sm:-mx-6">
      <div
        className={cn(
          'relative overflow-hidden text-white px-5 pb-12',
          'pt-[max(1.4rem,calc(env(safe-area-inset-top)+0.6rem))]',
          gradient,
        )}
      >
        {/* warm tint + soft decorative shapes */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent mix-blend-soft-light" />
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-20 top-8 h-16 w-16 rounded-full border border-white/15" />
        {Icon && (
          <Icon
            size={132}
            strokeWidth={1.5}
            className="pointer-events-none absolute -right-3 bottom-2 opacity-[0.16]"
          />
        )}

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="relative -ml-1 mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/85">
              {eyebrow}
            </p>
            <h1 className="mt-1 font-display text-[2.1rem] leading-[1.04] font-semibold drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm font-medium text-white/85 max-w-[34ch]">
                {subtitle}
              </p>
            )}
          </div>
          {trailing && <div className="relative shrink-0">{trailing}</div>}
        </div>

        <WaveEdge />
      </div>
    </div>
  );
}
