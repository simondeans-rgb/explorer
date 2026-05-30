import { useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import type { CountryAggregate, PassportStats } from '../../lib/stats';
import type { DiscoveryStats } from '../../lib/discoveryStats';
import type { JourneyStats } from '../../lib/journeyStats';
import { evaluateRecognitions } from '../../lib/recognitions';
import { flagEmoji } from '../../lib/flags';
import {
  CONTINENTS,
  JOURNEY_MODES,
  JOURNEY_MODE_META,
  type Continent,
  type Discovery,
  type Expedition,
  type Place,
} from '../../types';
import { cn } from '../../lib/cn';
import { JOURNEY_ICON } from '../expeditions/journeyIcons';

interface Props {
  places: Place[];
  aggregates: CountryAggregate[];
  stats: PassportStats;
  discoveries: Discovery[];
  discoveryStats: DiscoveryStats;
  expeditions: Expedition[];
  journeyStats: JourneyStats;
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

  return (
    <div className="animate-fade-in space-y-7">
      <div className="text-center">
        <ScrollText
          size={26}
          className="mx-auto text-passport-gold mb-2"
        />
        <p className="text-[11px] uppercase tracking-[0.32em] text-passport-gold">
          Society of Discovery
        </p>
        <h1 className="font-display text-3xl font-semibold text-passport-navy dark:text-white/90">
          The Almanac
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50 mt-1">
          A record of your discoveries, published from your Passport.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
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
            label={y === currentYear ? `${y} (this year)` : String(y)}
          />
        ))}
      </div>

      {!yearView ? (
        <>
          <Figures
            items={[
              ['Countries discovered', stats.countriesDiscovered],
              ['Cities discovered', stats.citiesDiscovered],
              ['Expeditions completed', expeditions.length],
              ['Discoveries made', discoveryStats.total],
              ['Continents reached', stats.continentsDiscovered],
              ['Recognitions earned', earned.length],
            ]}
          />

          {journeyStats.total > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white/90">
                Journeys taken
              </h2>
              <div className="gold-rule w-24" />
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {JOURNEY_MODES.filter((m) => journeyStats.byMode[m] > 0).map(
                  (m) => {
                    const Icon = JOURNEY_ICON[m];
                    return (
                      <div
                        key={m}
                        className="rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10 px-3 py-3 shadow-page text-center"
                      >
                        <Icon
                          size={16}
                          className="mx-auto text-passport-gold mb-1"
                        />
                        <div className="font-display text-2xl font-semibold text-passport-navy dark:text-passport-goldsoft leading-none">
                          {journeyStats.byMode[m]}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mt-1">
                          {JOURNEY_MODE_META[m].label}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white/90">
              The world, by continent
            </h2>
            <div className="gold-rule w-24" />
            {CONTINENTS.filter((c) => byContinent.has(c)).map((c) => {
              const list = byContinent.get(c) ?? [];
              return (
                <div
                  key={c}
                  className="rounded-2xl bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10 shadow-page p-4"
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
              <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white/90">
                Recognitions
              </h2>
              <div className="gold-rule w-24" />
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
          <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white/90">
            The year {edition}
          </h2>
          <div className="gold-rule w-24" />
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
                    Expeditions of record
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {yearExpeditions.map((e) => (
                      <span
                        key={e.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10"
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10"
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
        'px-3 py-1.5 rounded-full text-sm border transition-colors',
        active
          ? 'bg-passport-navy text-passport-parchment border-passport-navy dark:bg-passport-gold dark:text-passport-ink dark:border-passport-gold'
          : 'border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-passport-gold/60',
      )}
    >
      {label}
    </button>
  );
}

function Figures({ items }: { items: [string, number][] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10 px-4 py-4 shadow-page"
        >
          <div className="font-display text-3xl font-semibold text-passport-navy dark:text-passport-goldsoft">
            {value}
          </div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mt-1">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
