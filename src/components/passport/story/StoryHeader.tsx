import { Bell, Plus, Search } from 'lucide-react';
import { DestinationImage } from '../../DestinationImage';
import { WorldlyMark } from '../../Brand';
import { FirstRunHeroArt } from './FirstRunHeroArt';

/**
 * The Story hero — a warm, personal opening that asks "what's next?".
 * Full-bleed destination photography (with a slow Ken Burns drift) under a
 * sunset gradient, an organic wave edge, a personal greeting, headline, search
 * pill and a handwritten flourish. Brand-new Members get a bespoke illustrated
 * scene and an "add your first place" call to action instead.
 */
export function StoryHeader({
  name,
  photo,
  heroCode,
  onSearch,
  onOpenFriends,
  hasFriendActivity = false,
  onPickPhoto,
  firstRun = false,
  onStart,
}: {
  name: string;
  photo: string | null;
  heroCode: string;
  onSearch: () => void;
  onOpenFriends?: () => void;
  hasFriendActivity?: boolean;
  onPickPhoto: () => void;
  firstRun?: boolean;
  onStart?: () => void;
}) {
  const first = name?.split(' ')[0] || 'Explorer';

  const content = (
    <>
      {/* Warm sunrise tint + legibility scrims */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sunburst/40 via-coral/25 to-lavender/40 mix-blend-soft-light" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/45 via-black/15 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14213D]/80 via-[#14213D]/10 to-transparent" />

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-[max(0.85rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <WorldlyMark size={28} />
          <span className="font-display text-xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            worldly
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {!firstRun && onOpenFriends && (
            <button
              type="button"
              onClick={onOpenFriends}
              aria-label="Friends & activity"
              className="relative h-10 w-10 grid place-items-center rounded-full glass text-white shadow-card active:scale-95 transition-transform"
            >
              <Bell size={18} />
              {hasFriendActivity && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-coral ring-2 ring-white/80" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onPickPhoto}
            aria-label={photo ? 'Change photo' : 'Add photo'}
            className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white shadow-card grid place-items-center bg-brand-gradient active:scale-95 transition-transform"
          >
            {photo ? (
              <img src={photo} alt="You" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">
                {first[0]?.toUpperCase() ?? 'E'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Greeting + headline ─────────────────────────────────── */}
      <div className="relative z-10 mt-auto px-6 pb-16">
        <p className="text-sm font-semibold text-white/85 drop-shadow">
          Hi {first},
        </p>
        <h1 className="mt-1.5 font-display text-[2.5rem] leading-[0.98] font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] max-w-[15ch]">
          {firstRun
            ? 'Your story starts here.'
            : 'Where will your next story take you?'}
        </h1>

        {firstRun ? (
          <button
            type="button"
            onClick={onStart}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white shadow-float pl-4 pr-5 py-3.5 active:scale-[0.99] transition-transform"
          >
            <span className="h-7 w-7 grid place-items-center rounded-full bg-brand-gradient text-white">
              <Plus size={16} strokeWidth={2.6} />
            </span>
            <span className="text-[15px] font-semibold text-passport-navy">
              Add your first place
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSearch}
            className="mt-5 w-full max-w-md flex items-center gap-3 rounded-full bg-white/95 dark:bg-white/90 shadow-float px-5 py-3.5 text-left active:scale-[0.99] transition-transform"
          >
            <Search size={18} className="text-coral shrink-0" />
            <span className="text-[15px] font-medium text-passport-ink2">
              Search places, food &amp; journeys…
            </span>
          </button>
        )}

        {/* Handwritten flourish */}
        <div className="mt-5 inline-block">
          <p className="font-script text-[1.7rem] leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            Life is better when you explore.
          </p>
          <svg
            viewBox="0 0 220 12"
            preserveAspectRatio="none"
            className="mt-1 h-2.5 w-[15rem] max-w-full text-sunburst"
            aria-hidden="true"
          >
            <path
              d="M3 8 C 60 2, 150 2, 217 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* ── Organic wave edge melting into the page ─────────────── */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute -bottom-px inset-x-0 w-full h-[58px] text-warmwhite dark:text-passport-night"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,64 C220,118 460,16 720,44 C980,72 1220,120 1440,70 L1440,121 L0,121 Z"
        />
      </svg>
    </>
  );

  return (
    <div className="relative -mx-4 sm:-mx-6">
      {firstRun ? (
        <div className="relative overflow-hidden min-h-[480px] bg-brand-gradient">
          <FirstRunHeroArt className="absolute inset-0 h-full w-full" />
          <div className="relative flex min-h-[480px] flex-col">{content}</div>
        </div>
      ) : (
        <DestinationImage code={heroCode} motion className="min-h-[480px]">
          <div className="relative flex min-h-[480px] h-full flex-col">
            {content}
          </div>
        </DestinationImage>
      )}
    </div>
  );
}
