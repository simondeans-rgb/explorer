import { useMemo } from 'react';
import { BarChart3, type LucideIcon } from 'lucide-react';
import type { CountryAggregate, PassportStats } from '../../lib/stats';
import type { DiscoveryStats } from '../../lib/discoveryStats';
import type { JourneyStats } from '../../lib/journeyStats';
import { flagEmoji } from '../../lib/flags';
import {
  JOURNEY_MODES,
  JOURNEY_MODE_META,
  RELATIONSHIPS,
  RELATIONSHIP_META,
  type Relationship,
} from '../../types';
import { RELATIONSHIP_ICON } from '../passport/relationshipIcons';
import { JOURNEY_ICON } from '../expeditions/journeyIcons';
import { CATEGORY_ICON } from '../discoveries/categoryIcons';

interface Props {
  aggregates: CountryAggregate[];
  stats: PassportStats;
  discoveryStats: DiscoveryStats;
  journeyStats: JourneyStats;
  expeditionCount: number;
}

export function StatisticsView({
  aggregates,
  stats,
  discoveryStats,
  journeyStats,
  expeditionCount,
}: Props) {
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

  return (
    <div className="animate-fade-in space-y-7">
      <header className="text-center">
        <BarChart3 size={26} className="mx-auto text-passport-gold mb-2" />
        <p className="text-[11px] uppercase tracking-[0.32em] text-passport-gold">
          Society of Discovery
        </p>
        <h1 className="font-display text-3xl font-semibold text-passport-navy dark:text-white/90">
          Statistics
        </h1>
        <p className="text-sm text-black/55 dark:text-white/55 mt-1">
          The measure of a life of discovery, tallied from your Passport.
        </p>
      </header>

      <Section title="Travel">
        <StatGrid>
          <Stat value={stats.countriesDiscovered} label="Countries" />
          <Stat value={stats.citiesDiscovered} label="Cities" />
          <Stat value={stats.continentsDiscovered} label="Continents" />
        </StatGrid>
        {stats.continents.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {stats.continents.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-full text-xs bg-passport-navy/[0.06] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/65"
              >
                {c}
              </span>
            ))}
          </div>
        )}
        <SubHeading>Relationships with places</SubHeading>
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
      </Section>

      <Section title="Journeys">
        <StatGrid>
          <Stat value={expeditionCount} label="Expeditions" />
          <Stat value={journeyStats.total} label="Journeys" />
        </StatGrid>
        {journeyStats.total > 0 && (
          <StatGrid>
            {JOURNEY_MODES.map((m) => (
              <Stat
                key={m}
                value={journeyStats.byMode[m]}
                label={JOURNEY_MODE_META[m].label}
                icon={JOURNEY_ICON[m]}
              />
            ))}
          </StatGrid>
        )}
      </Section>

      <Section title="Discoveries">
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
      </Section>

      {stats.flagCodes.length > 0 && (
        <Section title="Flags">
          <div className="flex flex-wrap gap-2 text-2xl leading-none">
            {stats.flagCodes.map((code) => (
              <span key={code} title={code}>
                {flagEmoji(code)}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white/90">
          {title}
        </h2>
        <div className="gold-rule mt-1.5 w-24" />
      </div>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel pt-1">
      {children}
    </div>
  );
}

function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{children}</div>;
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
    <div className="rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10 px-3 py-3 text-center shadow-page">
      {Icon && (
        <Icon size={14} className="mx-auto text-passport-gold mb-1" />
      )}
      <div className="font-display text-2xl font-semibold text-passport-navy dark:text-passport-goldsoft leading-none">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mt-1">
        {label}
      </div>
    </div>
  );
}
