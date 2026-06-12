import { useMemo, useState } from 'react';
import { ChevronLeft, Download, Share2, Sparkles, X } from 'lucide-react';
import type { ReviewScope, ReviewStats } from '../../lib/review';
import { buildPosterSvg } from '../../lib/reviewPoster';
import { shareOrDownloadSvg } from '../../lib/shareImage';
import { flagEmoji } from '../../lib/flags';
import { cn } from '../../lib/cn';

// Each slide gets its own vivid gradient for a Wrapped-like rhythm.
const GRADIENTS = [
  'linear-gradient(150deg,#FF6B9A,#9B7CFF)',
  'linear-gradient(150deg,#9B7CFF,#24D1C3)',
  'linear-gradient(150deg,#FFB84D,#FF6B9A)',
  'linear-gradient(150deg,#24D1C3,#7C6BFF)',
  'linear-gradient(150deg,#FF6B9A,#FFB84D)',
  'linear-gradient(150deg,#7C6BFF,#FF6B9A)',
];

export function ReviewModal({
  review,
  name,
  scope,
  canYear,
  currentYear,
  onScopeChange,
  onClose,
}: {
  review: ReviewStats;
  name: string;
  scope: ReviewScope;
  canYear: boolean;
  currentYear: number;
  onScopeChange: (s: ReviewScope) => void;
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const first = (name || 'Explorer').split(' ')[0];

  const slides = useMemo(() => buildSlides(review, first), [review, first]);
  const last = slides.length - 1;

  function advance() {
    if (i < last) setI(i + 1);
    else onClose();
  }
  function back(e: React.MouseEvent) {
    e.stopPropagation();
    setI((n) => Math.max(0, n - 1));
  }

  async function share() {
    if (busy) return;
    setBusy(true);
    setDone(null);
    const svg = buildPosterSvg(review, name);
    const res = await shareOrDownloadSvg(svg, `worldly-${review.scope}.png`, {
      shareText:
        review.scope === 'lifetime'
          ? 'My travel story on Worldly ✈️'
          : `My ${review.scope} in travel ✈️`,
    });
    setBusy(false);
    setDone(
      res === 'shared'
        ? 'Shared!'
        : res === 'downloaded'
          ? 'Saved to your device'
          : 'Couldn’t share — try again',
    );
  }

  const slide = slides[i];

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col text-white animate-fade-in select-none"
      style={{ backgroundImage: GRADIENTS[i % GRADIENTS.length] }}
      onClick={advance}
    >
      {/* progress segments */}
      <div className="flex gap-1.5 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
          >
            <div
              className={cn(
                'h-full bg-white transition-all',
                idx < i ? 'w-full' : idx === i ? 'w-full' : 'w-0',
              )}
            />
          </div>
        ))}
      </div>

      {/* top controls */}
      <div className="flex items-center justify-between px-4 pt-2">
        {i > 0 ? (
          <button
            type="button"
            onClick={back}
            aria-label="Back"
            className="h-9 w-9 grid place-items-center rounded-full bg-white/15"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-sm font-bold tracking-wide">
            <Sparkles size={15} /> worldly
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
          className="h-9 w-9 grid place-items-center rounded-full bg-white/15"
        >
          <X size={18} />
        </button>
      </div>

      {/* slide body */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-rise-in" key={i}>
        {slide}
      </div>

      {/* footer hint / scope toggle on intro, actions on last */}
      <div className="px-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        {i === 0 && canYear && (
          <div className="mb-4 flex justify-center gap-2">
            {([currentYear, 'lifetime'] as ReviewScope[]).map((s) => (
              <button
                key={String(s)}
                type="button"
                onClick={() => {
                  onScopeChange(s);
                  setI(0);
                }}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-semibold transition-all',
                  scope === s ? 'bg-white text-passport-navy' : 'bg-white/20 text-white',
                )}
              >
                {s === 'lifetime' ? 'Lifetime' : 'This year'}
              </button>
            ))}
          </div>
        )}

        {i === last ? (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={share}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-passport-navy font-bold px-5 py-4 shadow-float active:scale-[0.99] disabled:opacity-60"
            >
              <Share2 size={18} /> {busy ? 'Preparing…' : 'Share my recap'}
            </button>
            <button
              type="button"
              onClick={share}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 text-white font-semibold px-5 py-3"
            >
              <Download size={16} /> Save image
            </button>
            {done && (
              <p className="text-center text-sm text-white/90 pt-1">{done}</p>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-white/70">Tap to continue</p>
        )}
      </div>
    </div>
  );
}

function Big({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-[6rem] leading-none font-semibold drop-shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
      {children}
    </div>
  );
}
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 font-display text-[1.8rem] leading-tight font-semibold max-w-[18ch]">
      {children}
    </p>
  );
}
function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-white/85 text-lg max-w-[24ch]">{children}</p>;
}

function buildSlides(r: ReviewStats, first: string): React.ReactNode[] {
  const scopeLabel =
    r.scope === 'lifetime' ? 'travel story' : `${r.scope} in travel`;

  const slides: React.ReactNode[] = [];

  // 0 — intro
  slides.push(
    <>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/80">
        Hey {first}
      </p>
      <Caption>Here&rsquo;s your {scopeLabel} ✨</Caption>
      <Sub>A look back at where the world took you.</Sub>
    </>,
  );

  // 1 — countries + flag wall
  slides.push(
    <>
      <Big>{r.countries}</Big>
      <Caption>
        {r.countries === 1 ? 'country' : 'countries'}{' '}
        {r.scope === 'lifetime' ? 'explored' : 'this year'}
      </Caption>
      {r.flagCodes.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-1.5 max-w-[20ch] text-3xl">
          {r.flagCodes.map((c) => (
            <span key={c}>{flagEmoji(c)}</span>
          ))}
        </div>
      )}
    </>,
  );

  // 2 — reach
  slides.push(
    <>
      <Big>{r.continents}</Big>
      <Caption>
        {r.continents === 1 ? 'continent' : 'continents'} reached
      </Caption>
      <Sub>
        across {r.cities} {r.cities === 1 ? 'city' : 'cities'}
        {r.newCountries > 0 && r.scope !== 'lifetime'
          ? ` · ${r.newCountries} new`
          : ''}
      </Sub>
    </>,
  );

  // 3 — journeys + discoveries
  slides.push(
    <>
      <Big>{r.journeys}</Big>
      <Caption>{r.journeys === 1 ? 'journey' : 'journeys'} logged</Caption>
      <Sub>
        and {r.discoveries} {r.discoveries === 1 ? 'place' : 'places'} worth
        remembering
      </Sub>
      {r.favourite && (
        <p className="mt-5 font-display text-xl italic text-white/90">
          &ldquo;{r.favourite.name}&rdquo;
        </p>
      )}
    </>,
  );

  // 4 — top country + level
  slides.push(
    <>
      {r.topCountryName ? (
        <>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
            You loved it here most
          </p>
          <Caption>
            {r.topCountryCode && (
              <span className="mr-2">{flagEmoji(r.topCountryCode)}</span>
            )}
            {r.topCountryName}
          </Caption>
        </>
      ) : (
        <Caption>Your adventure is just beginning</Caption>
      )}
      <Sub>
        Explorer level {r.level} · {r.levelTitle}
      </Sub>
    </>,
  );

  // 5 — share
  slides.push(
    <>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/80">
        That&rsquo;s a wrap
      </p>
      <Caption>Share your {scopeLabel}</Caption>
      <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
        {(
          [
            ['Countries', r.countries],
            ['Cities', r.cities],
            ['Journeys', r.journeys],
            ['Discoveries', r.discoveries],
          ] as [string, number][]
        ).map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/15 py-3">
            <div className="font-display text-3xl font-semibold">{value}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
              {label}
            </div>
          </div>
        ))}
      </div>
    </>,
  );

  return slides;
}
