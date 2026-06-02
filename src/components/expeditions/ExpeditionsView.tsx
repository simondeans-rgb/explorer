import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Compass, Plane, Plus, RefreshCw } from 'lucide-react';
import { countryName } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import {
  JOURNEY_MODE_META,
  type Discovery,
  type Expedition,
  type Place,
} from '../../types';
import { AddExpeditionModal, type ExpeditionModalInitial } from './AddExpeditionModal';
import { ImportFlightyModal } from './ImportFlightyModal';
import { MapSkeleton } from '../map/MapSkeleton';
import { JOURNEY_ICON } from './journeyIcons';

const ExpeditionMap = lazy(() =>
  import('../map/WorldMaps').then((m) => ({ default: m.ExpeditionMap })),
);

// Lazy — pulls in the airport/city coordinate tables for distance maths, which
// shouldn't weigh down the initial load.
const TravelStatsPanel = lazy(() =>
  import('./TravelStatsPanel').then((m) => ({ default: m.TravelStatsPanel })),
);

interface Props {
  userId: string;
  expeditions: Expedition[];
  discoveries: Discovery[];
  places: Place[];
  /** When set (from Explore's "Add a trip"), opens a pre-filled new journey. */
  newTripCountry?: string | null;
  onNewTripConsumed?: () => void;
  /** One-shot: open the Flighty importer on mount (from the first-run welcome). */
  openImport?: boolean;
  onImportConsumed?: () => void;
  loading: boolean;
}

function formatRange(start?: string, end?: string): string {
  const fmt = (iso: string, withYear: boolean) =>
    new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      ...(withYear ? { year: 'numeric' } : {}),
    });
  if (start && end) {
    const sameYear = start.slice(0, 4) === end.slice(0, 4);
    return `${fmt(start, !sameYear)} – ${fmt(end, true)}`;
  }
  if (start) return fmt(start, true);
  if (end) return fmt(end, true);
  return '';
}

export function ExpeditionsView({
  userId,
  expeditions,
  discoveries,
  places,
  newTripCountry,
  onNewTripConsumed,
  openImport,
  onImportConsumed,
  loading,
}: Props) {
  const [modal, setModal] = useState<ExpeditionModalInitial | null>(null);
  const [importing, setImporting] = useState(false);
  const [reevaluating, setReevaluating] = useState(false);

  // Arriving from Explore's "Add a trip" — open a new journey for that country.
  useEffect(() => {
    if (!newTripCountry) return;
    setModal({ countryCodes: [newTripCountry] });
    onNewTripConsumed?.();
  }, [newTripCountry, onNewTripConsumed]);

  // Arriving from the first-run welcome — open the Flighty importer.
  useEffect(() => {
    if (!openImport) return;
    setImporting(true);
    onImportConsumed?.();
  }, [openImport, onImportConsumed]);

  const hasImported = useMemo(
    () =>
      expeditions.some((e) =>
        e.journeys.some((j) => j.id?.startsWith('fl_')),
      ),
    [expeditions],
  );

  const sorted = useMemo(
    () =>
      [...expeditions].sort((a, b) =>
        (b.startDate ?? '').localeCompare(a.startDate ?? ''),
      ),
    [expeditions],
  );

  const discoveryCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of discoveries) {
      if (d.expeditionId)
        counts.set(d.expeditionId, (counts.get(d.expeditionId) ?? 0) + 1);
    }
    return counts;
  }, [discoveries]);

  const isEmpty = !loading && expeditions.length === 0;

  return (
    <div className="animate-fade-in space-y-6">
      <header className="pt-2">
        <p className="text-sm font-medium text-passport-gold">
          {expeditions.length}{' '}
          {expeditions.length === 1 ? 'journey' : 'journeys'} on record
        </p>
        <h1 className="font-display text-[2rem] leading-tight font-semibold text-passport-navy dark:text-white">
          Journeys
        </h1>
        <p className="text-sm text-passport-ink2 dark:text-white/55 mt-1 max-w-md">
          Every trip — a weekend in Rome, a gap year across Asia — a record of
          how you travelled and what you found.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModal({})}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-brand-gradient text-white shadow-card hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Plus size={16} /> New journey
          </button>
          <button
            type="button"
            onClick={() => setImporting(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-white dark:bg-passport-carddark shadow-card text-passport-navy dark:text-white/85 hover:shadow-card-hover active:scale-[0.98] transition-all"
          >
            <Plane size={16} className="text-passport-gold" /> Import flights
          </button>
          {hasImported && (
            <button
              type="button"
              onClick={() => setReevaluating(true)}
              title="Rebuild imported trips from your residence history"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-passport-ink2 dark:text-white/70 hover:bg-passport-navy/[0.06] dark:hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <RefreshCw size={15} /> Re-evaluate
            </button>
          )}
        </div>
      </header>

      {expeditions.length > 0 && (
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-2">
          <Suspense fallback={<MapSkeleton />}>
            <ExpeditionMap expeditions={expeditions} />
          </Suspense>
        </div>
      )}

      {expeditions.length > 0 && (
        <Suspense fallback={null}>
          <TravelStatsPanel expeditions={expeditions} />
        </Suspense>
      )}

      {expeditions.length > 0 && (
        <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
          Your trips
        </h2>
      )}

      {isEmpty ? (
        <EmptyState onAdd={() => setModal({})} />
      ) : (
        <div className="space-y-3">
          {sorted.map((e) => (
            <ExpeditionCard
              key={e.id}
              expedition={e}
              discoveryCount={discoveryCount.get(e.id) ?? 0}
              onEdit={() =>
                setModal({
                  id: e.id,
                  title: e.title,
                  startDate: e.startDate,
                  endDate: e.endDate,
                  countryCodes: e.countryCodes,
                  journeys: e.journeys,
                  note: e.note,
                })
              }
            />
          ))}
        </div>
      )}

      {modal && (
        <AddExpeditionModal
          userId={userId}
          initial={modal}
          onClose={() => setModal(null)}
        />
      )}

      {importing && (
        <ImportFlightyModal
          userId={userId}
          places={places}
          expeditions={expeditions}
          onClose={() => setImporting(false)}
        />
      )}

      {reevaluating && (
        <ImportFlightyModal
          userId={userId}
          places={places}
          expeditions={expeditions}
          mode="reevaluate"
          onClose={() => setReevaluating(false)}
        />
      )}
    </div>
  );
}

function ExpeditionCard({
  expedition: e,
  discoveryCount,
  onEdit,
}: {
  expedition: Expedition;
  discoveryCount: number;
  onEdit: () => void;
}) {
  const range = formatRange(e.startDate, e.endDate);

  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full text-left rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-5 hover:shadow-card-hover active:scale-[0.99] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {range && (
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-passport-gold mb-1">
              {range}
            </div>
          )}
          <div className="font-display text-xl font-semibold text-passport-navy dark:text-white leading-tight">
            {e.title}
          </div>
        </div>
        {e.countryCodes.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1 text-xl leading-none shrink-0 max-w-[40%]">
            {e.countryCodes.map((c) => (
              <span key={c} title={countryName(c)}>
                {flagEmoji(c)}
              </span>
            ))}
          </div>
        )}
      </div>

      {e.journeys.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {e.journeys.map((j) => {
            const Icon = JOURNEY_ICON[j.mode];
            const route = [j.from, j.to].filter(Boolean).join(' → ');
            const label =
              j.operator?.trim() || JOURNEY_MODE_META[j.mode].label;
            const tail = [route, j.reference, j.seat]
              .filter(Boolean)
              .join(' · ');
            return (
              <div
                key={j.id}
                className="flex items-baseline gap-2 text-xs text-passport-ink2 dark:text-white/65 min-w-0"
              >
                <Icon
                  size={13}
                  className="text-passport-gold shrink-0 translate-y-0.5"
                />
                <span className="font-medium shrink-0">{label}</span>
                {tail && (
                  <span className="text-passport-ink3 dark:text-white/45 truncate min-w-0">
                    {tail}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {discoveryCount > 0 && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs text-passport-ink2 dark:text-white/65">
          <Compass size={13} className="text-passport-gold" />
          {discoveryCount} {discoveryCount === 1 ? 'discovery' : 'discoveries'}
        </div>
      )}

      {e.note && (
        <p className="mt-3 font-display text-[15px] italic text-passport-ink2 dark:text-white/65 border-l-2 border-passport-gold/50 pl-3">
          {e.note}
        </p>
      )}
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-8 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-3xl bg-brand-gradient flex items-center justify-center shadow-card">
        <Plane size={26} className="text-white" />
      </div>
      <p className="font-display text-2xl font-semibold text-passport-navy dark:text-white mb-1.5">
        Log your first journey
      </p>
      <p className="text-sm text-passport-ink2 dark:text-white/60 mb-6 max-w-xs mx-auto">
        Add a trip — its dates, the countries it crossed, and how you travelled.
        Or import your flights to fill them in automatically.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-gradient text-white font-semibold shadow-card hover:opacity-95 active:scale-[0.99] transition-all"
      >
        <Plus size={17} /> New journey
      </button>
    </div>
  );
}
