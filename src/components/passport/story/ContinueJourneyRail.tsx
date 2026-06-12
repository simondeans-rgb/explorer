import { ChevronRight } from 'lucide-react';
import type { Expedition } from '../../../types';
import { JOURNEY_MODE_META } from '../../../types';
import { DestinationImage } from '../../DestinationImage';
import { JOURNEY_ICON } from '../../expeditions/journeyIcons';
import { flagEmoji } from '../../../lib/flags';

function monthYear(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

/** Real, meaningful progress from a trip's dates. */
function tripProgress(e: Expedition): { pct: number; label: string } {
  const now = Date.now();
  const start = e.startDate ? Date.parse(e.startDate) : NaN;
  const end = e.endDate ? Date.parse(e.endDate) : NaN;
  if (!Number.isNaN(start) && !Number.isNaN(end)) {
    if (now >= end) return { pct: 1, label: 'Completed' };
    if (now < start) return { pct: 0, label: 'Upcoming' };
    return { pct: Math.min(1, Math.max(0, (now - start) / (end - start))), label: 'Underway' };
  }
  if (!Number.isNaN(start) && now < start) return { pct: 0, label: 'Upcoming' };
  return { pct: 1, label: 'Logged' };
}

export function ContinueJourneyRail({
  expeditions,
  onOpen,
}: {
  expeditions: Expedition[];
  onOpen: () => void;
}) {
  const recent = [...expeditions]
    .sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''))
    .slice(0, 8);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
          Continue your journey
        </h2>
        <button
          type="button"
          onClick={onOpen}
          className="text-sm font-semibold text-coral hover:underline inline-flex items-center gap-0.5"
        >
          View all <ChevronRight size={15} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {recent.map((e) => {
          const code = e.countryCodes[0] ?? '';
          const mode = e.journeys[0]?.mode;
          const ModeIcon = mode ? JOURNEY_ICON[mode] : null;
          const { pct, label } = tripProgress(e);
          const showPct = label === 'Underway';
          return (
            <button
              key={e.id}
              type="button"
              onClick={onOpen}
              className="group shrink-0 w-[230px] rounded-[1.75rem] overflow-hidden bg-white dark:bg-passport-carddark shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all text-left"
            >
              <DestinationImage code={code} className="h-32 flex">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {ModeIcon && (
                  <span className="absolute left-3 top-3 h-9 w-9 rounded-2xl bg-brand-gradient text-white grid place-items-center shadow-card">
                    <ModeIcon size={16} />
                  </span>
                )}
                {code && (
                  <span className="absolute right-3 top-3 text-lg leading-none drop-shadow">
                    {flagEmoji(code)}
                  </span>
                )}
              </DestinationImage>

              <div className="p-4">
                <h3 className="font-display text-[1.05rem] font-semibold leading-tight text-passport-navy dark:text-white line-clamp-1">
                  {e.title}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-passport-ink3">
                  {[mode ? JOURNEY_MODE_META[mode].label : null, monthYear(e.startDate)]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                <div className="mt-3 flex items-center gap-2.5">
                  <div className="h-2 flex-1 rounded-full bg-passport-cartridge dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-gradient transition-all"
                      style={{ width: `${Math.round(pct * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-coral shrink-0">
                    {showPct ? `${Math.round(pct * 100)}%` : label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
