import { useMemo, useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import type { CountryAggregate, PassportStats } from '../../lib/stats';
import { evaluateRecognitions, type Recognition } from '../../lib/recognitions';
import { flagEmoji } from '../../lib/flags';
import { useAuth } from '../../contexts/AuthContext';
import { RELATIONSHIP_META, type Place, type Relationship } from '../../types';
import { AddPlaceModal, type ModalInitial } from './AddPlaceModal';
import { DiscoveryRing } from './DiscoveryRing';
import { Stamp } from './Stamp';
import { Crest } from './Crest';
import { RELATIONSHIP_ICON } from './relationshipIcons';

interface Props {
  userId: string;
  aggregates: CountryAggregate[];
  stats: PassportStats;
  loading: boolean;
}

function hashOf(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function memberNo(uid: string): string {
  return String(hashOf(uid || 'guest') % 1_000_000).padStart(6, '0');
}

function displayName(email: string): string {
  const local = (email.split('@')[0] || 'Explorer').replace(/[._-]+/g, ' ');
  return local
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function pad(s: string, n: number): string {
  return (s + '<'.repeat(n)).slice(0, n);
}

function mrzLines(name: string, no: string): [string, string] {
  const clean = name.toUpperCase().replace(/[^A-Z]+/g, '<');
  return [
    pad(`P<SOD<${clean}`, 36),
    pad(`SOD${no}<<EXP000000`, 36),
  ];
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
  const recognitions = useMemo(() => evaluateRecognitions(stats), [stats]);
  const earned = recognitions.filter((r) => r.earned);

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
    setModal({ kind: 'city', countryCode: a.code, lockKind: true, lockCountry: true });
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
      <BioPage
        name={displayName(user?.email ?? '')}
        no={memberNo(userId)}
        sinceYear={memberSinceYear}
        stats={stats}
        recognitionsEarned={earned.length}
      />

      <div className="flex items-center justify-between">
        <SectionHeading>Your Passport</SectionHeading>
        <button
          type="button"
          onClick={() => setModal({ kind: 'country' })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-passport-navy text-passport-parchment hover:opacity-90 active:scale-[0.98]"
        >
          <Plus size={15} /> Add
        </button>
      </div>

      {isEmpty && <EmptyState onAdd={() => setModal({ kind: 'country' })} />}

      {earned.length > 0 && <RecognitionsStrip recognitions={earned} />}

      {stats.flagCodes.length > 0 && (
        <FlagWall
          codes={stats.flagCodes}
          onPick={(code) => {
            const a = discovered.find((d) => d.code === code);
            if (a) editCountry(a);
          }}
        />
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-dashed border-passport-gold/50 text-passport-ink2 dark:text-white/70 hover:bg-passport-gold/10"
              >
                <span className="text-base leading-none">{flagEmoji(a.code)}</span>
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
      <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white/90">
        {children}
      </h2>
      <div className="gold-rule mt-1.5 w-24" />
    </div>
  );
}

const FIELD_LABEL =
  'text-[10px] font-medium uppercase tracking-[0.18em] text-passport-fieldlabel';

function BioPage({
  name,
  no,
  sinceYear,
  stats,
  recognitionsEarned,
}: {
  name: string;
  no: string;
  sinceYear: number | null;
  stats: PassportStats;
  recognitionsEarned: number;
}) {
  const [mrz1, mrz2] = mrzLines(name, no);
  const figures: [string, number][] = [
    ['Countries', stats.countriesDiscovered],
    ['Cities', stats.citiesDiscovered],
    ['Continents', stats.continentsDiscovered],
    ['Lived In', stats.countriesLived],
    ['Stamps', stats.totalStamps],
    ['Recognitions', recognitionsEarned],
  ];

  return (
    <div className="rounded-xl overflow-hidden shadow-page border border-black/10 dark:border-white/10">
      {/* Header band — always navy with gold type (Brand Book §08). */}
      <div className="bg-passport-navy px-5 py-3 flex items-center justify-between">
        <div className="leading-tight">
          <div className="text-[9px] font-medium uppercase tracking-[0.22em] text-passport-gold">
            Explorer&rsquo;s Passport
          </div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-passport-gold/60">
            Society of Discovery
          </div>
        </div>
        <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-passport-gold/80">
          Member Record
        </div>
      </div>
      <div className="h-px bg-passport-gold/40" />

      {/* Body — parchment. */}
      <div className="bg-passport-card text-passport-ink px-5 pt-4">
        <div className="page-divide pb-2 mb-4 flex items-center justify-between text-[9px] tracking-[0.14em] text-passport-fieldlabel uppercase">
          <span>Type · M&nbsp;&nbsp; Code · SOD&nbsp;&nbsp; No. {no}</span>
          <span>Page 1 / 1</span>
        </div>

        <div className="flex gap-4">
          <div className="relative w-[68px] h-[84px] shrink-0 rounded-sm bg-passport-paged border border-black/10 flex items-center justify-center">
            <span className="font-display text-3xl font-semibold text-passport-fieldlabel">
              {name[0]?.toUpperCase() ?? 'E'}
            </span>
            <Corner className="top-1 left-1 border-t border-l" />
            <Corner className="top-1 right-1 border-t border-r" />
            <Corner className="bottom-1 left-1 border-b border-l" />
            <Corner className="bottom-1 right-1 border-b border-r" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-2.5">
            <div>
              <div className={FIELD_LABEL}>Member</div>
              <div className="font-display text-2xl font-semibold leading-tight truncate text-passport-navy">
                {name}
              </div>
            </div>
            <div className="relative">
              <div className={FIELD_LABEL}>Nationality</div>
              <div className="font-display text-[15px] text-passport-ink">
                Member · Society of Discovery
              </div>
              <div className="absolute right-0 -top-1 border-[1.5px] border-passport-navy/30 rounded px-1.5 py-0.5 rotate-[-9deg]">
                <span className="text-[7px] font-medium uppercase tracking-[0.16em] text-passport-navy/40">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="page-divide grid grid-cols-2 gap-3 mt-4 pb-4">
          <div>
            <div className={FIELD_LABEL}>Member Since</div>
            <div className="text-sm font-medium uppercase tracking-wide">
              {sinceYear ?? '—'}
            </div>
          </div>
          <div>
            <div className={FIELD_LABEL}>Standing</div>
            <div className="font-display text-[15px]">Known to us</div>
          </div>
        </div>

        <div className="page-divide grid grid-cols-3 gap-y-3 gap-x-2 mt-4 pb-4">
          {figures.map(([label, value]) => (
            <div key={label}>
              <div className={FIELD_LABEL}>{label}</div>
              <div className="font-display text-2xl font-semibold text-passport-navy leading-none">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between mt-4 pb-4">
          <div>
            <div className={`${FIELD_LABEL} mb-1.5`}>Signature of Bearer</div>
            <div className="font-display text-lg italic text-passport-ink">
              {name}
            </div>
            <div className="h-px bg-black/20 mt-1.5 w-36" />
          </div>
          <Crest />
        </div>
      </div>

      {/* MRZ strip — aged parchment, monospace (Brand Book §08). */}
      <div className="bg-passport-paged px-5 py-2 font-mono text-[8px] leading-relaxed tracking-[0.1em] text-passport-fieldtext/70 break-all">
        <div>{mrz1}</div>
        <div>{mrz2}</div>
      </div>
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      className={`absolute w-2 h-2 border-passport-fieldlabel/70 ${className}`}
    />
  );
}

function RecognitionsStrip({ recognitions }: { recognitions: Recognition[] }) {
  return (
    <div className="space-y-3">
      <SectionHeading>Recognitions</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {recognitions.map((r) => (
          <span
            key={r.id}
            title={r.description}
            className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-sm bg-passport-gold/10 text-passport-navy dark:text-passport-goldsoft border border-passport-gold/40"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-passport-gold/60 text-passport-gold text-xs">
              {r.symbol}
            </span>
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
    <div className="rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 shadow-page p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="text-4xl leading-none shrink-0 hover:scale-105 transition-transform"
        >
          {flagEmoji(agg.code)}
        </button>
        <button type="button" onClick={onEdit} className="flex-1 min-w-0 text-left">
          <div className="font-display text-lg font-semibold text-passport-navy dark:text-white/90 truncate">
            {agg.name}
          </div>
          <div className="text-xs text-passport-ink3 dark:text-white/45">
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-passport-navy/[0.06] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/65"
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
        <div className="mt-4 flex flex-wrap gap-2">
          {agg.stamps.map((s, i) => (
            <Stamp
              key={s}
              kind={s}
              code={agg.code}
              year={agg.firstYear}
              seed={i + agg.code.charCodeAt(0)}
            />
          ))}
        </div>
      )}

      {agg.note && (
        <p className="mt-4 font-display text-[15px] italic text-passport-ink2 dark:text-white/65 border-l-2 border-passport-gold/50 pl-3">
          {agg.note}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {agg.cities.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onEditCity(c)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-passport-navy/5 dark:bg-white/5 text-passport-ink2 dark:text-white/70 hover:bg-passport-navy/10"
          >
            <MapPin size={11} />
            {c.name}
          </button>
        ))}
        <button
          type="button"
          onClick={onAddCity}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-black/15 dark:border-white/15 text-passport-ink3 dark:text-white/50 hover:border-passport-gold/60"
        >
          <Plus size={11} /> City
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-10 text-center">
      <p className="font-display text-2xl font-semibold text-passport-navy dark:text-white/90 mb-1">
        Your Passport is blank.
      </p>
      <p className="text-sm text-passport-ink2 dark:text-white/50 mb-5 max-w-sm mx-auto">
        Record the first country you have discovered. Its flag and stamps begin
        the archive.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-passport-navy text-passport-parchment font-medium hover:opacity-90"
      >
        <Plus size={16} /> Add a country
      </button>
    </div>
  );
}
