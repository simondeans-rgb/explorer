import { useMemo, useState } from 'react';
import { Award, MapPin, Plus } from 'lucide-react';
import type { CountryAggregate, PassportStats } from '../../lib/stats';
import { evaluateRecognitions } from '../../lib/recognitions';
import { flagEmoji } from '../../lib/flags';
import { useAuth } from '../../contexts/AuthContext';
import {
  RELATIONSHIP_META,
  type Place,
  type Relationship,
} from '../../types';
import { AddPlaceModal, type ModalInitial } from './AddPlaceModal';
import { DiscoveryRing } from './DiscoveryRing';
import { Stamp } from './Stamp';
import { RELATIONSHIP_ICON } from './relationshipIcons';

interface Props {
  userId: string;
  aggregates: CountryAggregate[];
  stats: PassportStats;
  loading: boolean;
}

function passportNumber(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = (hash * 31 + uid.charCodeAt(i)) | 0;
  const base = Math.abs(hash).toString(36).toUpperCase().padStart(6, '0');
  return `SD-${base.slice(0, 6)}`;
}

export function PassportView({ userId, aggregates, stats, loading }: Props) {
  const { user } = useAuth();
  const [modal, setModal] = useState<ModalInitial | null>(null);

  const discovered = useMemo(
    () =>
      aggregates
        .filter((a) => a.discovered)
        .sort(
          (a, b) =>
            b.discoveryScore - a.discoveryScore || a.name.localeCompare(b.name),
        ),
    [aggregates],
  );
  const aspiring = useMemo(
    () => aggregates.filter((a) => a.aspiring),
    [aggregates],
  );
  const recognitions = useMemo(
    () => evaluateRecognitions(stats),
    [stats],
  );

  const memberSinceYear = useMemo(() => {
    let min = Infinity;
    for (const a of aggregates) {
      if (a.countryPlace) min = Math.min(min, a.countryPlace.createdAt);
      for (const c of a.cities) min = Math.min(min, c.createdAt);
    }
    return Number.isFinite(min) ? new Date(min).getFullYear() : null;
  }, [aggregates]);

  function editCountry(a: CountryAggregate) {
    setModal({
      id: a.countryPlace?.id,
      kind: 'country',
      countryCode: a.code,
      name: a.name,
      relationships: a.countryPlace?.relationships,
      firstYear: a.countryPlace?.firstYear,
      note: a.countryPlace?.note,
      lockCountry: true,
    });
  }

  function addCity(a: CountryAggregate) {
    setModal({
      kind: 'city',
      countryCode: a.code,
      lockKind: true,
      lockCountry: true,
    });
  }

  function editCity(place: Place) {
    setModal({
      id: place.id,
      kind: 'city',
      countryCode: place.countryCode,
      name: place.name,
      relationships: place.relationships,
      firstYear: place.firstYear,
      note: place.note,
      lockKind: true,
      lockCountry: true,
    });
  }

  const isEmpty = !loading && aggregates.length === 0;

  return (
    <div className="animate-fade-in space-y-8">
      <IdentityCard
        name={user?.email?.split('@')[0] ?? 'Explorer'}
        email={user?.email ?? ''}
        number={passportNumber(userId || 'guest')}
        sinceYear={memberSinceYear}
      />

      <StatStrip stats={stats} />

      <div className="flex items-center justify-between">
        <SectionHeading>Your Passport</SectionHeading>
        <button
          type="button"
          onClick={() => setModal({ kind: 'country' })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink hover:opacity-90 active:scale-[0.98]"
        >
          <Plus size={15} /> Add
        </button>
      </div>

      {isEmpty && <EmptyState onAdd={() => setModal({ kind: 'country' })} />}

      {recognitions.some((r) => r.earned) && (
        <RecognitionsStrip recognitions={recognitions} />
      )}

      {stats.flagCodes.length > 0 && (
        <FlagWall codes={stats.flagCodes} onPick={(code) => {
          const a = discovered.find((d) => d.code === code);
          if (a) editCountry(a);
        }} />
      )}

      {discovered.length > 0 && (
        <div className="space-y-3">
          {discovered.map((a) => (
            <CountryCard
              key={a.code}
              agg={a}
              onEdit={() => editCountry(a)}
              onAddCity={() => addCity(a)}
              onEditCity={editCity}
            />
          ))}
        </div>
      )}

      {aspiring.length > 0 && (
        <div className="space-y-3">
          <SectionHeading>Aspiring — places to discover</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {aspiring.map((a) => (
              <button
                key={a.code}
                type="button"
                onClick={() => editCountry(a)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-dashed border-passport-gold/50 text-black/70 dark:text-white/70 hover:bg-passport-gold/10"
              >
                <span className="text-base leading-none">
                  {flagEmoji(a.code)}
                </span>
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <AddPlaceModal
          userId={userId}
          initial={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl text-passport-navy dark:text-white/90">
        {children}
      </h2>
      <div className="gold-rule mt-1.5 w-24" />
    </div>
  );
}

function IdentityCard({
  name,
  email,
  number,
  sinceYear,
}: {
  name: string;
  email: string;
  number: string;
  sinceYear: number | null;
}) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-page bg-passport-navy text-passport-parchment">
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="text-[10px] uppercase tracking-[0.3em] text-passport-goldsoft">
          Society of Discovery
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-passport-goldsoft/70">
          Explorer&rsquo;s Passport
        </span>
      </div>
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full border-2 border-passport-gold/60 flex items-center justify-center text-2xl font-display text-passport-goldsoft">
          {name[0]?.toUpperCase() ?? 'E'}
        </div>
        <div className="min-w-0">
          <div className="font-display text-2xl capitalize truncate">{name}</div>
          <div className="text-xs text-passport-parchment/60 truncate">
            {email}
          </div>
        </div>
      </div>
      <div className="px-5 pb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-passport-parchment/70 font-mono">
        <span>No. {number}</span>
        <span>Member since {sinceYear ?? '—'}</span>
      </div>
    </div>
  );
}

const STAT_ITEMS: {
  key: keyof PassportStats;
  label: string;
}[] = [
  { key: 'countriesDiscovered', label: 'Countries' },
  { key: 'citiesDiscovered', label: 'Cities' },
  { key: 'continentsDiscovered', label: 'Continents' },
  { key: 'countriesLived', label: 'Lived in' },
  { key: 'totalStamps', label: 'Stamps' },
  { key: 'avgDiscoveryScore', label: 'Avg. depth' },
];

function StatStrip({ stats }: { stats: PassportStats }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {STAT_ITEMS.map((item) => (
        <div
          key={item.key}
          className="rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10 px-3 py-3 text-center shadow-page"
        >
          <div className="font-display text-2xl text-passport-navy dark:text-passport-goldsoft">
            {stats[item.key] as number}
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-black/45 dark:text-white/45 mt-0.5">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecognitionsStrip({
  recognitions,
}: {
  recognitions: ReturnType<typeof evaluateRecognitions>;
}) {
  return (
    <div className="space-y-3">
      <SectionHeading>Recognitions</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {recognitions
          .filter((r) => r.earned)
          .map((r) => (
            <span
              key={r.id}
              title={r.description}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-passport-gold/15 text-passport-navy dark:text-passport-goldsoft border border-passport-gold/40"
            >
              <Award size={14} />
              {r.title}
            </span>
          ))}
      </div>
    </div>
  );
}

function FlagWall({
  codes,
  onPick,
}: {
  codes: string[];
  onPick: (code: string) => void;
}) {
  return (
    <div className="space-y-3">
      <SectionHeading>Flags collected</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {codes.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onPick(code)}
            className="text-3xl leading-none hover:scale-110 transition-transform"
            title={code}
          >
            {flagEmoji(code)}
          </button>
        ))}
      </div>
    </div>
  );
}

function CountryCard({
  agg,
  onEdit,
  onAddCity,
  onEditCity,
}: {
  agg: CountryAggregate;
  onEdit: () => void;
  onAddCity: () => void;
  onEditCity: (place: Place) => void;
}) {
  return (
    <div className="rounded-2xl bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10 shadow-page p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="text-4xl leading-none shrink-0 hover:scale-105 transition-transform"
        >
          {flagEmoji(agg.code)}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 min-w-0 text-left"
        >
          <div className="font-display text-lg text-passport-navy dark:text-white/90 truncate">
            {agg.name}
          </div>
          <div className="text-xs text-black/45 dark:text-white/45">
            {agg.continent}
            {agg.firstYear ? ` · since ${agg.firstYear}` : ''}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {agg.relationships
              .filter((r): r is Relationship => r !== 'aspiring')
              .map((r) => {
                const Icon = RELATIONSHIP_ICON[r];
                return (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-black/[0.04] dark:bg-white/[0.06] text-black/65 dark:text-white/65"
                  >
                    <Icon size={11} />
                    {RELATIONSHIP_META[r].label}
                  </span>
                );
              })}
          </div>
        </button>
        <DiscoveryRing score={agg.discoveryScore} />
      </div>

      {agg.stamps.length > 0 && (
        <div className="mt-3 flex gap-1.5 pl-1">
          {agg.stamps.map((s, i) => (
            <Stamp key={s} kind={s} seed={i + agg.code.charCodeAt(0)} />
          ))}
        </div>
      )}

      {agg.note && (
        <p className="mt-3 text-sm text-black/65 dark:text-white/65 italic border-l-2 border-passport-gold/40 pl-3">
          {agg.note}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {agg.cities.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onEditCity(c)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-passport-navy/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-passport-navy/10"
          >
            <MapPin size={11} />
            {c.name}
          </button>
        ))}
        <button
          type="button"
          onClick={onAddCity}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-black/15 dark:border-white/15 text-black/50 dark:text-white/50 hover:border-passport-gold/60"
        >
          <Plus size={11} /> City
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-10 text-center">
      <p className="font-display text-2xl text-passport-navy dark:text-white/90 mb-1">
        Your Passport is blank.
      </p>
      <p className="text-sm text-black/50 dark:text-white/50 mb-5">
        Add the first country you&rsquo;ve discovered — its flag and stamps
        begin your archive.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink font-medium hover:opacity-90"
      >
        <Plus size={16} /> Add a country
      </button>
    </div>
  );
}
