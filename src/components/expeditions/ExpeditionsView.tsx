import { useMemo, useState } from 'react';
import { Compass, MapPinned, Plane, Plus } from 'lucide-react';
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
import { JOURNEY_ICON } from './journeyIcons';

interface Props {
  userId: string;
  expeditions: Expedition[];
  discoveries: Discovery[];
  places: Place[];
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
  loading,
}: Props) {
  const [modal, setModal] = useState<ExpeditionModalInitial | null>(null);
  const [importing, setImporting] = useState(false);

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
      <header className="text-center">
        <MapPinned size={26} className="mx-auto text-passport-gold mb-2" />
        <h1 className="font-display text-3xl font-semibold text-passport-navy dark:text-white/90">
          Expeditions
        </h1>
        <p className="text-sm text-black/55 dark:text-white/55 mt-1 max-w-md mx-auto">
          Every trip — a weekend in Rome, a gap year across Asia — is an
          Expedition: a container for your journeys, discoveries and notes.
        </p>
      </header>

      <div className="flex items-center justify-between">
        <div className="text-sm text-black/50 dark:text-white/50">
          {expeditions.length}{' '}
          {expeditions.length === 1 ? 'expedition' : 'expeditions'}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setImporting(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-black/15 dark:border-white/15 text-passport-navy dark:text-white/80 hover:border-passport-gold/60 active:scale-[0.98]"
          >
            <Plane size={15} /> Import
          </button>
          <button
            type="button"
            onClick={() => setModal({})}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-passport-navy text-passport-parchment hover:opacity-90 active:scale-[0.98]"
          >
            <Plus size={15} /> New
          </button>
        </div>
      </div>

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
      className="w-full text-left rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 shadow-page p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-lg font-semibold text-passport-navy dark:text-white/90 leading-tight">
            {e.title}
          </div>
          {range && (
            <div className="text-xs text-passport-ink3 dark:text-white/45 mt-0.5">
              {range}
            </div>
          )}
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
                className="flex items-baseline gap-2 text-xs text-passport-ink2 dark:text-white/65"
              >
                <Icon
                  size={13}
                  className="text-passport-gold shrink-0 translate-y-0.5"
                />
                <span className="font-medium">{label}</span>
                {tail && (
                  <span className="text-passport-ink3 dark:text-white/45 truncate">
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
    <div className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-10 text-center">
      <p className="font-display text-2xl font-semibold text-passport-navy dark:text-white/90 mb-1">
        No expeditions yet.
      </p>
      <p className="text-sm text-black/50 dark:text-white/50 mb-5 max-w-sm mx-auto">
        Log your first trip — its dates, the countries it crossed, and how you
        travelled.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-passport-navy text-passport-parchment font-medium hover:opacity-90"
      >
        <Plus size={16} /> New expedition
      </button>
    </div>
  );
}
