import { useEffect, useRef, useState } from 'react';
import { flagEmoji } from '../../lib/flags';
import type { StoryCard } from '../../lib/homeStory';
import { DestinationImage } from '../DestinationImage';
import { cn } from '../../lib/cn';

/**
 * The opening experience: a full-bleed, swipeable carousel of emotional story
 * cards (current trip, last trip, a memory, a friend's recommendation, a
 * favourite). Content and imagery first — no statistics. Auto-advances gently
 * until the user interacts, then yields to them.
 */
export function StoryHero({
  cards,
  onOpen,
}: {
  cards: StoryCard[];
  onOpen: (card: StoryCard) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const paused = useRef(false);

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) {
      setActive(i);
      activeRef.current = i;
    }
  }

  // Gentle auto-advance (every 5.5s). Pauses on touch/pointer, respects
  // reduced-motion, and never fights a user mid-scroll.
  useEffect(() => {
    if (cards.length < 2) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const el = scroller.current;
    if (!el) return;
    const pause = () => {
      paused.current = true;
    };
    el.addEventListener('pointerdown', pause, { passive: true });
    el.addEventListener('touchstart', pause, { passive: true });
    const id = window.setInterval(() => {
      if (paused.current || !scroller.current) return;
      const next = (activeRef.current + 1) % cards.length;
      scroller.current.scrollTo({
        left: next * scroller.current.clientWidth,
        behavior: 'smooth',
      });
    }, 5500);
    return () => {
      window.clearInterval(id);
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('touchstart', pause);
    };
  }, [cards.length]);

  return (
    <div className="relative -mx-4 sm:-mx-6">
      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
      >
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onOpen(card)}
            className="shrink-0 w-full snap-center text-left"
          >
            <DestinationImage
              code={card.code}
              className="h-[58vh] max-h-[460px] min-h-[360px] flex flex-col rounded-b-[2.5rem]"
            >
              {/* top + bottom scrims */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />
              <div className="absolute inset-0 hero-scrim" />

              {/* content pinned to the bottom */}
              <div className="relative mt-auto px-6 pb-10">
                <div className="flex items-center gap-2 mb-3">
                  {card.code && (
                    <span className="text-xl leading-none drop-shadow">
                      {flagEmoji(card.code)}
                    </span>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">
                    {card.eyebrow}
                  </span>
                </div>
                <h2 className="font-display text-[2.6rem] leading-[0.98] font-semibold text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] max-w-[14ch]">
                  {card.title}
                </h2>
                {card.subtitle && (
                  <p className="mt-2.5 text-[15px] font-medium text-white/90 max-w-[26ch]">
                    {card.subtitle}
                  </p>
                )}
                {card.note && (
                  <p className="mt-3 font-display text-[17px] italic leading-snug text-white/85 max-w-[30ch] line-clamp-3">
                    &ldquo;{card.note}&rdquo;
                  </p>
                )}
                {card.meta && (
                  <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70">
                    {card.meta}
                  </p>
                )}
              </div>
            </DestinationImage>
          </button>
        ))}
      </div>

      {/* progress dots */}
      {cards.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
          {cards.map((c, i) => (
            <span
              key={c.id}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/45',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
