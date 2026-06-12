import { CalendarPlus, ChevronRight, Plane } from 'lucide-react';
import type { Trip } from '../../types';
import { countryName } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import { daysUntil } from '../../hooks/useTrips';
import { DestinationImage } from '../DestinationImage';

function countdown(trip: Trip): { big: string; small: string } {
  const d = daysUntil(trip.startDate);
  if (d > 1) return { big: String(d), small: 'days to go' };
  if (d === 1) return { big: '1', small: 'day to go' };
  if (d === 0) return { big: 'Today', small: 'the day is here' };
  const end = trip.endDate ? daysUntil(trip.endDate) : d;
  return end >= 0
    ? { big: 'Now', small: 'happening' }
    : { big: '—', small: 'wrapping up' };
}

export function UpcomingTrips({
  trips,
  onOpen,
  onPlan,
}: {
  trips: Trip[];
  onOpen: (id: string) => void;
  onPlan: () => void;
}) {
  if (trips.length === 0) {
    return (
      <button
        type="button"
        onClick={onPlan}
        className="w-full flex items-center gap-3 rounded-3xl bg-white dark:bg-passport-carddark shadow-card px-4 py-4 hover:shadow-card-hover active:scale-[0.99] transition-all text-left"
      >
        <span className="h-12 w-12 rounded-2xl bg-brand-gradient grid place-items-center text-white shadow-card shrink-0">
          <CalendarPlus size={22} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-display text-[1.1rem] font-semibold text-passport-navy dark:text-white">
            Plan your next adventure
          </span>
          <span className="block text-xs text-passport-ink3 mt-0.5">
            Set the dates and we&rsquo;ll count down the days
          </span>
        </span>
        <ChevronRight size={18} className="text-passport-ink3 shrink-0" />
      </button>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
          Counting down
        </h2>
        <button
          type="button"
          onClick={onPlan}
          className="text-sm font-semibold text-coral hover:underline inline-flex items-center gap-1"
        >
          <CalendarPlus size={15} /> Plan
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {trips.map((t) => {
          const c = countdown(t);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onOpen(t.id)}
              className="shrink-0 w-[270px] rounded-[1.75rem] overflow-hidden shadow-float active:scale-[0.98] transition-transform text-left"
            >
              <DestinationImage code={t.countryCode} className="h-44 flex flex-col text-white">
                <div className="absolute inset-0 hero-scrim" />
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[11px] font-semibold text-white">
                  <Plane size={12} /> Upcoming
                </div>
                <div className="absolute right-3 top-3 text-lg leading-none drop-shadow">
                  {flagEmoji(t.countryCode)}
                </div>
                <div className="mt-auto p-4 relative">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[2.4rem] leading-none font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {c.big}
                    </span>
                    <span className="text-sm font-semibold text-white/90 mb-0.5">
                      {c.small}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-lg font-semibold leading-tight drop-shadow line-clamp-1">
                    {t.title}
                  </div>
                  <div className="text-[11px] font-medium text-white/85 mt-0.5">
                    {countryName(t.countryCode)}
                  </div>
                </div>
              </DestinationImage>
            </button>
          );
        })}
      </div>
    </section>
  );
}
