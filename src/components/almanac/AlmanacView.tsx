import { useMemo, useState } from 'react';
import { type LucideIcon } from 'lucide-react';
import type { CountryAggregate, PassportStats } from '../../lib/stats';
import type { DiscoveryStats } from '../../lib/discoveryStats';
import type { JourneyStats } from '../../lib/journeyStats';
import { evaluateRecognitions } from '../../lib/recognitions';
import { flagEmoji } from '../../lib/flags';
import {
  CONTINENTS,
  JOURNEY_MODES,
  JOURNEY_MODE_META,
  RELATIONSHIPS,
  RELATIONSHIP_META,
  type Continent,
  type Discovery,
  type Expedition,
  type Place,
  type Relationship,
} from '../../types';
import { cn } from '../../lib/cn';
import { buildHistorianContext } from '../../lib/historian';
import { JOURNEY_ICON } from '../expeditions/journeyIcons';
import { RELATIONSHIP_ICON } from '../passport/relationshipIcons';
import { CATEGORY_ICON } from '../discoveries/categoryIcons';
import { TravelHistorian } from './TravelHistorian';

interface Props {
  places: Place[];
  aggregates: CountryAggregate[];
  stats: PassportStats;
  discoveries: Discovery[];
  discoveryStats: DiscoveryStats;
  expeditions: Expedition[];
  journeyStats: JourneyStats;
  memberName: string;
}

function expeditionYear(e: Expedition): number {
  return e.startDate
    ? new Date(e.startDate).getFullYear()
    : new Date(e.createdAt).getFullYear();
}

export function AlmanacView({
  places,
  aggregates,
  stats,
  discoveries,
  discoveryStats,
  expeditions,
  journeyStats,
  memberName,
}: Props) {
  const currentYear = new Date().getFullYear();
  const [edition, setEdition] = useState<'lifetime' | number>('lifetime');

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const p of places) if (p.firstYear) set.add(p.firstYear);
    for (const d of discoveries) set.add(new Date(d.createdAt).getFullYear());
    for (const e of expeditions) set.add(expeditionYear(e));
    return [...set].sort((a, b) => b - a);
  }, [places, discoveries, expeditions]);

  const relationshipCounts = useMemo(() => {
    const counts = {} as Record<Relationship, number>;
    for (const r of RELATIONSHIPS) {
      counts[r] =
        r === 'aspiring'
          ? aggregates.filter((a) => a.aspiring).length
          : aggregates.filter((a) => a.discovered && a.relationships.includes(r))
              .length;
    }
    return counts;
  }, [aggregates]);

  const discovered = aggregates.filter((a) => a.discovered);
  const byContinent = useMemo(() => {
    const map = new Map<Continent, CountryAggregate[]>();
    for (const a of discovered) {
      if (!a.continent) continue;
      const list = map.get(a.continent) ?? [];
      list.push(a);
      map.set(a.continent, list);
    }
    return map;
  }, [discovered]);

  const yearView = typeof edition === 'number';
  const yearPlaces = yearView
    ? places.filter((p) => p.firstYear === edition)
    : [];
  const yearDiscoveries = yearView
    ? discoveries.filter((d) => new Date(d.createdAt).getFullYear() === edition)
    : [];
  const yearExpeditions = yearView
    ? expeditions.filter((e) => expeditionYear(e) === edition)
    : [];
  const earned = evaluateRecognitions(stats, discoveryStats).filter(
    (r) => r.earned,
  );

  const historianContext = useMemo(
    () =>
      buildHistorianContext({
        memberName,
        scope: edition,
        aggregates,
        discoveries,
        expeditions,
        stats,
      }),
    [memberName, edition, aggregates, discoveries, expeditions, stats],
  );

  return (
    <div className="animate-fade-in space-y-7">
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white p-6 shadow-float">
        <div
          className="pointer-events-none absolute -left-10 -bottom-12 h-44 w-44 rounded-full border border-white/15"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
            Your travel story
          </p>
          <h1 className="font-display text-[2.4rem] leading-none font-semibold mt-1">
            The Almanac
          </h1>
          <p className="text-sm text-white/80 mt-2 max-w-sm">
            A beautiful record of everywhere you&rsquo;ve been — published from
            your own world.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        <EditionChip
          active={edition === 'lifetime'}
          onClick={() => setEdition('lifetime')}
          label="Lifetime"
        />
        {years.map((y) => (
          <EditionChip
            key={y}
            active={edition === y}
            onClick={() => setEdition(y)}
            label={y === currentYear ? `${y} · this year` : String(y)}
          />
        ))}
      </div>

      <TravelHistorian
        key={String(edition)}
        context={historianContext}
        scopeLabel={yearView ? `${edition} story` : 'lifetime story'}
      />

      {!yearView ? (
        <>
          <Figures
            items={[
              ['Countries discovered', stats.countriesDiscovered],
              ['Cities discovered', stats.citiesDiscovered],
              ['Journeys completed', expeditions.length],
              ['Discoveries made', discoveryStats.total],
              ['Continents reached', stats.continentsDiscovered],
              ['Recognitions earned', earned.length],
            ]}
          />

          <section className="space-y-3">
            <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
              Relationships with places
            </h2>
            <StatGrid>
              {RELATIONSHIPS.map((r) => (
                <Stat
                  key={r}
                  value={relationshipCounts[r]}
                  label={RELATIONSHIP_META[r].label}
                  icon={RELATIONSHIP_ICON[r]}
                />
              ))}
            </StatGrid>
          </section>

          {journeyStats.total > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
                Journeys taken
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {JOURNEY_MODES.filter((m) => journeyStats.byMode[m] > 0).map(
                  (m) => {
                    const Icon = JOURNEY_ICON[m];
                    return (
                      <div
                        key={m}
                        className="min-w-0 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-2 py-3 text-center"
                      >
                        <Icon
                          size={16}
                          className="mx-auto text-passport-gold mb-1"
                        />
                        <div className="font-display text-2xl font-semibold text-passport-navy dark:text-passport-goldsoft leading-none">
                          {journeyStats.byMode[m]}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.1em] text-black/45 dark:text-white/45 mt-1 break-words">
                          {JOURNEY_MODE_META[m].label}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          )}

          {discoveryStats.total > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
                Discoveries
              </h2>
              <StatGrid>
                <Stat value={discoveryStats.total} label="Total" />
                <Stat
                  value={discoveryStats.recommended}
                  label="Recommended"
                />
                <Stat
                  value={discoveryStats.byCategory.food}
                  label="Food & Drink"
                  icon={CATEGORY_ICON.food}
                />
                <Stat
                  value={discoveryStats.byCategory.accommodation}
                  label="Stays"
                  icon={CATEGORY_ICON.accommodation}
                />
                <Stat
                  value={discoveryStats.byCategory.culture}
                  label="Culture"
                  icon={CATEGORY_ICON.culture}
                />
                <Stat
                  value={discoveryStats.byCategory.experience}
                  label="Experiences"
                  icon={CATEGORY_ICON.experience}
                />
                <Stat
                  value={discoveryStats.byCategory.nature}
                  label="Nature"
                  icon={CATEGORY_ICON.nature}
                />
              </StatGrid>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
              The world, by continent
            </h2>
            {CONTINENTS.filter((c) => byContinent.has(c)).map((c) => {
              const list = byContinent.get(c) ?? [];
              return (
                <div
                  key={c}
                  className="rounded-2xl bg-white dark:bg-passport-carddark shadow-card p-4"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-display text-lg font-semibold text-passport-navy dark:text-white/90">
                      {c}
                    </span>
                    <span className="text-xs text-black/45 dark:text-white/45">
                      {list.length}{' '}
                      {list.length === 1 ? 'country' : 'countries'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-2xl leading-none">
                    {list.map((a) => (
                      <span key={a.code} title={a.name}>
                        {flagEmoji(a.code)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {earned.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
                Recognitions
              </h2>
              <ul className="space-y-1.5">
                {earned.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-baseline gap-2 text-sm text-black/70 dark:text-white/70"
                  >
                    <span className="text-passport-gold">{r.symbol}</span>
                    <span className="font-medium">{r.title}</span>
                    <span className="text-black/45 dark:text-white/45">
                      {r.description}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <section className="space-y-3">
          <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
            The year {edition}
          </h2>
          {yearPlaces.length === 0 &&
          yearDiscoveries.length === 0 &&
          yearExpeditions.length === 0 ? (
            <p className="text-sm text-black/50 dark:text-white/50">
              Nothing dated to this year yet.
            </p>
          ) : (
            <div className="space-y-4">
              {yearExpeditions.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel mb-2">
                    Journeys of record
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {yearExpeditions.map((e) => (
                      <span
                        key={e.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white dark:bg-passport-carddark shadow-card"
                      >
                        {e.countryCodes[0] && (
                          <span className="text-base leading-none">
                            {flagEmoji(e.countryCodes[0])}
                          </span>
                        )}
                        {e.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {yearPlaces.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {yearPlaces.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white dark:bg-passport-carddark shadow-card"
                    >
                      <span className="text-base leading-none">
                        {flagEmoji(p.countryCode)}
                      </span>
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
              {yearDiscoveries.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel mb-2">
                    {yearDiscoveries.length}{' '}
                    {yearDiscoveries.length === 1
                      ? 'discovery'
                      : 'discoveries'}{' '}
                    recorded
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {yearDiscoveries.map((d) => (
                      <span
                        key={d.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white dark:bg-passport-carddark shadow-card"
                      >
                        {d.countryCode && (
                          <span className="text-base leading-none">
                            {flagEmoji(d.countryCode)}
                          </span>
                        )}
                        {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function EditionChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.97]',
        active
          ? 'bg-passport-navy text-white dark:bg-white dark:text-passport-navy shadow-card'
          : 'bg-white dark:bg-passport-carddark shadow-card text-passport-ink2 dark:text-white/65',
      )}
    >
      {label}
    </button>
  );
}

function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">{children}</div>;
}

function Stat({
  value,
  label,
  icon: Icon,
}: {
  value: number;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-2 py-3.5 text-center">
      {Icon && (
        <div className="mx-auto mb-1.5 h-7 w-7 rounded-lg bg-passport-goldpale dark:bg-white/10 flex items-center justify-center">
          <Icon size={14} className="text-passport-gold" />
        </div>
      )}
      <div className="font-display text-2xl font-semibold text-passport-navy dark:text-white leading-none">
        {value}
      </div>
      <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-passport-ink3 mt-1 break-words hyphens-auto">
        {label}
      </div>
    </div>
  );
}

function Figures({ items }: { items: [string, number][] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="min-w-0 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-4 py-5"
        >
          <div className="font-display text-[2rem] font-semibold text-brand-gradient leading-none">
            {value}
          </div>
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-passport-ink3 mt-1.5 break-words">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
