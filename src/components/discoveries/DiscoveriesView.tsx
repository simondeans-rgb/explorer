import { useMemo, useState } from 'react';
import { Compass, Plus } from 'lucide-react';
import { countryName } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_CATEGORY_META,
  VERDICT_META,
  type Discovery,
  type DiscoveryCategory,
} from '../../types';
import { cn } from '../../lib/cn';
import { AddDiscoveryModal, type DiscoveryModalInitial } from './AddDiscoveryModal';
import { CATEGORY_ICON } from './categoryIcons';
import { VERDICT_STYLE } from './verdictStyle';

interface Props {
  userId: string;
  discoveries: Discovery[];
  loading: boolean;
}

type Filter = DiscoveryCategory | 'all';

export function DiscoveriesView({ userId, discoveries, loading }: Props) {
  const [modal, setModal] = useState<DiscoveryModalInitial | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const c = { all: discoveries.length } as Record<Filter, number>;
    for (const cat of DISCOVERY_CATEGORIES) {
      c[cat] = discoveries.filter((d) => d.category === cat).length;
    }
    return c;
  }, [discoveries]);

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
      <header className="text-center">
        <Compass size={26} className="mx-auto text-passport-gold mb-2" />
        <h1 className="font-display text-3xl font-semibold text-passport-navy dark:text-white/90">
          Discoveries
        </h1>
        <p className="text-sm text-black/55 dark:text-white/55 mt-1 max-w-md mx-auto">
          Any place or experience worth remembering — and the recommendations
          that become the most valuable guide your friends will ever have.
        </p>
      </header>

      <div className="flex items-center justify-between">
        <div className="text-sm text-black/50 dark:text-white/50">
          {discoveries.length}{' '}
          {discoveries.length === 1 ? 'discovery' : 'discoveries'} recorded
        </div>
        <button
          type="button"
          onClick={() => setModal({})}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-passport-navy text-passport-parchment hover:opacity-90 active:scale-[0.98]"
        >
          <Plus size={15} /> Record
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
                onEdit={() =>
                  setModal({
                    id: d.id,
                    name: d.name,
                    category: d.category,
                    countryCode: d.countryCode,
                    city: d.city,
                    verdict: d.verdict,
                    note: d.note,
                  })
                }
              />
            ))}
          </div>
        </>
      )}

      {modal && (
        <AddDiscoveryModal
          userId={userId}
          initial={modal}
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
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors',
        active
          ? 'bg-passport-navy text-passport-parchment border-passport-navy dark:bg-passport-gold dark:text-passport-ink dark:border-passport-gold'
          : 'border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-passport-gold/60',
      )}
    >
      {label}
      <span className="opacity-60">{count}</span>
    </button>
  );
}

function DiscoveryCard({
  discovery: d,
  onEdit,
}: {
  discovery: Discovery;
  onEdit: () => void;
}) {
  const Icon = CATEGORY_ICON[d.category];
  const place = [d.city, d.countryCode ? countryName(d.countryCode) : null]
    .filter(Boolean)
    .join(', ');
  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full text-left rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 shadow-page p-4"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-passport-navy/[0.06] dark:bg-white/[0.06] text-passport-navy dark:text-passport-goldsoft shrink-0">
          <Icon size={17} />
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
          <div className="text-xs text-passport-ink3 dark:text-white/45 mt-0.5 flex items-center gap-1.5">
            {d.countryCode && (
              <span className="text-sm leading-none">
                {flagEmoji(d.countryCode)}
              </span>
            )}
            <span>
              {place || DISCOVERY_CATEGORY_META[d.category].label}
              {place ? ` · ${DISCOVERY_CATEGORY_META[d.category].label}` : ''}
            </span>
          </div>
          {d.note && (
            <p className="mt-2 font-display text-[15px] italic text-passport-ink2 dark:text-white/65 border-l-2 border-passport-gold/50 pl-3">
              {d.note}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-10 text-center">
      <p className="font-display text-2xl font-semibold text-passport-navy dark:text-white/90 mb-1">
        No discoveries yet.
      </p>
      <p className="text-sm text-black/50 dark:text-white/50 mb-5 max-w-sm mx-auto">
        Record a restaurant, a museum, a viewpoint — anywhere worth
        remembering — and mark whether you would recommend it.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-passport-navy text-passport-parchment font-medium hover:opacity-90"
      >
        <Plus size={16} /> Record a discovery
      </button>
    </div>
  );
}
