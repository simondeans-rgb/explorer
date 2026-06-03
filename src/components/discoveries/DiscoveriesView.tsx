import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Compass, Globe2, MapPinned, Plus } from 'lucide-react';
import { countryName } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_CATEGORY_META,
  VERDICT_META,
  type Discovery,
  type DiscoveryCategory,
  type Expedition,
} from '../../types';
import type { CountryPresence } from '../../lib/explore';
import { cn } from '../../lib/cn';
import { AddDiscoveryModal, type DiscoveryModalInitial } from './AddDiscoveryModal';
import { CATEGORY_ICON } from './categoryIcons';

// Lazy — carries the baked country facts dataset + the detail modal, so it only
// loads when the Explore tab is actually used.
const ExploreView = lazy(() =>
  import('./ExploreView').then((m) => ({ default: m.ExploreView })),
);
import { VERDICT_STYLE } from './verdictStyle';

interface Props {
  userId: string;
  discoveries: Discovery[];
  expeditions: Expedition[];
  presenceByCountry: Map<string, CountryPresence>;
  friendDiscoveries: Discovery[];
  onAddTrip: (code: string) => void;
  onGoToPlace: (countryCode: string, city?: string) => void;
  openAdd?: boolean;
  onAddConsumed?: () => void;
  loading: boolean;
}

type Filter = DiscoveryCategory | 'all';
type Tab = 'explore' | 'recorded';

export function DiscoveriesView({
  userId,
  discoveries,
  expeditions,
  presenceByCountry,
  friendDiscoveries,
  onAddTrip,
  onGoToPlace,
  openAdd,
  onAddConsumed,
  loading,
}: Props) {
  const [modal, setModal] = useState<DiscoveryModalInitial | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [tab, setTab] = useState<Tab>('explore');

  useEffect(() => {
    if (!openAdd) return;
    setTab('recorded');
    setModal({});
    onAddConsumed?.();
  }, [openAdd, onAddConsumed]);

  const counts = useMemo(() => {
    const c = { all: discoveries.length } as Record<Filter, number>;
    for (const cat of DISCOVERY_CATEGORIES) {
      c[cat] = discoveries.filter((d) => d.category === cat).length;
    }
    return c;
  }, [discoveries]);

  const expeditionTitle = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of expeditions) m.set(e.id, e.title);
    return m;
  }, [expeditions]);

  const visible = useMemo(() => {
    const list =
      filter === 'all'
        ? discoveries
        : discoveries.filter((d) => d.category === filter);
    const order = (d: Discovery) => DISCOVERY_CATEGORIES.indexOf(d.category);
    return [...list].sort(
      (a, b) => order(a) - order(b) || a.name.localeCompare(b.name),
    );
  }, [discoveries, filter]);

  const isEmpty = !loading && discoveries.length === 0;

  return (
    <div className="animate-fade-in space-y-6">
      <header className="pt-2">
        <p className="text-sm font-medium text-passport-gold">
          The world, country by country
        </p>
        <h1 className="font-display text-[2rem] leading-tight font-semibold text-passport-navy dark:text-white">
          Explore
        </h1>
        <p className="text-sm text-passport-ink2 dark:text-white/55 mt-1 max-w-md">
          Discover destinations, see where friends have been, and keep the
          places worth remembering.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-passport-navy/[0.05] dark:bg-white/[0.06]">
        {(
          [
            ['explore', 'Explore', Globe2],
            ['recorded', 'My discoveries', Compass],
          ] as [Tab, string, typeof Globe2][]
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              tab === id
                ? 'bg-white dark:bg-passport-carddark text-passport-navy dark:text-white shadow-card'
                : 'text-passport-ink3 dark:text-white/55',
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'explore' ? (
        <Suspense
          fallback={
            <div className="py-10 text-center text-sm text-black/40 dark:text-white/40">
              Loading the world…
            </div>
          }
        >
          <ExploreView
            userId={userId}
            presenceByCountry={presenceByCountry}
            myDiscoveries={discoveries}
            friendDiscoveries={friendDiscoveries}
            onAddTrip={onAddTrip}
            onOpenDiscovery={(id) => {
              const d = discoveries.find((x) => x.id === id);
              if (d)
                setModal({
                  id: d.id,
                  name: d.name,
                  category: d.category,
                  countryCode: d.countryCode,
                  city: d.city,
                  landmark: d.landmark,
                  expeditionId: d.expeditionId,
                  verdict: d.verdict,
                  note: d.note,
                });
            }}
            onRecordLandmark={(countryCode, landmark) =>
              setModal({
                countryCode,
                landmark,
                name: landmark,
                category: 'culture',
              })
            }
          />
        </Suspense>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-passport-ink2 dark:text-white/55">
              {discoveries.length}{' '}
              {discoveries.length === 1 ? 'discovery' : 'discoveries'} recorded
            </div>
            <button
              type="button"
              onClick={() => setModal({})}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold bg-brand-gradient text-white shadow-card hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <Plus size={16} /> Record
            </button>
          </div>

          {isEmpty ? (
            <EmptyState onAdd={() => setModal({})} />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="All"
                  count={counts.all}
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                />
                {DISCOVERY_CATEGORIES.filter((c) => counts[c] > 0).map((c) => (
                  <FilterChip
                    key={c}
                    label={DISCOVERY_CATEGORY_META[c].label}
                    count={counts[c]}
                    active={filter === c}
                    onClick={() => setFilter(c)}
                  />
                ))}
              </div>

              <div className="space-y-3">
                {visible.map((d) => (
                  <DiscoveryCard
                    key={d.id}
                    discovery={d}
                    expeditionTitle={
                      d.expeditionId
                        ? expeditionTitle.get(d.expeditionId)
                        : undefined
                    }
                    onEdit={() =>
                      setModal({
                        id: d.id,
                        name: d.name,
                        category: d.category,
                        countryCode: d.countryCode,
                        city: d.city,
                        landmark: d.landmark,
                        expeditionId: d.expeditionId,
                        verdict: d.verdict,
                        note: d.note,
                      })
                    }
                    onGoToPlace={onGoToPlace}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {modal && (
        <AddDiscoveryModal
          userId={userId}
          initial={modal}
          expeditions={expeditions}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.97]',
        active
          ? 'bg-passport-navy text-white dark:bg-white dark:text-passport-navy shadow-card'
          : 'bg-white dark:bg-passport-carddark shadow-card text-passport-ink2 dark:text-white/65',
      )}
    >
      {label}
      <span className="opacity-50">{count}</span>
    </button>
  );
}

function DiscoveryCard({
  discovery: d,
  expeditionTitle,
  onEdit,
  onGoToPlace,
}: {
  discovery: Discovery;
  expeditionTitle?: string;
  onEdit: () => void;
  onGoToPlace: (countryCode: string, city?: string) => void;
}) {
  const Icon = CATEGORY_ICON[d.category];
  const place = [d.city, d.countryCode ? countryName(d.countryCode) : null]
    .filter(Boolean)
    .join(', ');
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onEdit();
        }
      }}
      className="w-full text-left rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-4 cursor-pointer hover:shadow-card-hover transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-passport-goldpale dark:bg-white/10 text-passport-gold shrink-0">
          <Icon size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="font-display text-lg font-semibold text-passport-navy dark:text-white/90 leading-tight">
              {d.name}
            </div>
            {d.verdict && (
              <span
                className={cn(
                  'shrink-0 px-2.5 py-0.5 rounded-full text-[11px] border',
                  VERDICT_STYLE[d.verdict].chip,
                )}
              >
                {VERDICT_META[d.verdict].label}
              </span>
            )}
          </div>
          {d.countryCode ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGoToPlace(d.countryCode!, d.city);
              }}
              title="View in your Passport"
              className="text-xs text-passport-ink3 dark:text-white/45 mt-0.5 flex items-center gap-1.5 hover:text-passport-navy dark:hover:text-passport-goldsoft hover:underline"
            >
              <span className="text-sm leading-none">
                {flagEmoji(d.countryCode)}
              </span>
              <span>
                {place}
                {' · '}
                {DISCOVERY_CATEGORY_META[d.category].label}
              </span>
            </button>
          ) : (
            <div className="text-xs text-passport-ink3 dark:text-white/45 mt-0.5">
              {DISCOVERY_CATEGORY_META[d.category].label}
            </div>
          )}
          {expeditionTitle && (
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-passport-ink3 dark:text-white/45">
              <MapPinned size={11} className="text-passport-gold" />
              {expeditionTitle}
            </div>
          )}
          {d.note && (
            <p className="mt-2 font-display text-[15px] italic text-passport-ink2 dark:text-white/65 border-l-2 border-passport-gold/50 pl-3">
              {d.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-8 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-3xl bg-brand-gradient flex items-center justify-center shadow-card">
        <Compass size={26} className="text-white" />
      </div>
      <p className="font-display text-2xl font-semibold text-passport-navy dark:text-white mb-1.5">
        Keep what you love
      </p>
      <p className="text-sm text-passport-ink2 dark:text-white/60 mb-6 max-w-xs mx-auto">
        A restaurant, a museum, a viewpoint — anywhere worth remembering. Mark
        whether you&rsquo;d recommend it and build your own guide.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-gradient text-white font-semibold shadow-card hover:opacity-95 active:scale-[0.99] transition-all"
      >
        <Plus size={17} /> Record a discovery
      </button>
    </div>
  );
}
