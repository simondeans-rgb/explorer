import { useEffect, useState } from 'react';
import { Globe2, MapPinned } from 'lucide-react';
import type { CountryAggregate, PassportStats } from '../../lib/stats';
import type { DiscoveryStats } from '../../lib/discoveryStats';
import type { Discovery, Expedition, Place } from '../../types';
import type { FriendPresence } from '../../lib/friends';
import type { SavedItem } from '../../lib/saved';
import { cn } from '../../lib/cn';
import { PageHero } from '../PageHero';
import { PassportView } from '../passport/PassportView';
import { ExpeditionsView } from '../expeditions/ExpeditionsView';

type AtlasTab = 'places' | 'journeys';

interface Props {
  userId: string;
  places: Place[];
  discoveries: Discovery[];
  expeditions: Expedition[];
  aggregates: CountryAggregate[];
  stats: PassportStats;
  discoveryStats: DiscoveryStats;
  friendCountryMap: Map<string, FriendPresence[]>;
  /** Saved bookmarks — surfaced as wishlist shading on the Atlas map. */
  saved?: SavedItem[];
  /** Promote a saved country into a tracked aspiring place. */
  onAddAspiring?: (code: string) => void;
  // Passport (Places) one-shot flags
  openImport?: 'countries' | 'photos' | null;
  onImportConsumed?: () => void;
  focusPlace?: { code: string; city?: string } | null;
  onFocusConsumed?: () => void;
  openAddPlace?: boolean;
  onAddPlaceConsumed?: () => void;
  onExplore?: () => void;
  // Journeys one-shot flags
  newTripCountry?: string | null;
  onNewTripConsumed?: () => void;
  openFlighty?: boolean;
  onFlightyConsumed?: () => void;
  openAddJourney?: boolean;
  onAddJourneyConsumed?: () => void;
  /** Which tab to land on (e.g. focusPlace/new-trip set this). */
  initialTab?: AtlasTab;
  loading: boolean;
  expeditionsLoading: boolean;
}

export function AtlasView(props: Props) {
  const [tab, setTab] = useState<AtlasTab>(props.initialTab ?? 'places');

  // When the shell routes here with a specific intent (focus a place / add a
  // trip), follow the requested sub-tab.
  const requested = props.initialTab;
  useEffect(() => {
    if (requested) setTab(requested);
  }, [requested, props.focusPlace, props.newTripCountry]);

  return (
    <div className="animate-fade-in space-y-5">
      <PageHero
        eyebrow="Your collection"
        title="Atlas"
        subtitle="Every place you've been — on the map, by country, journey by journey."
        icon={Globe2}
        gradient="bg-[linear-gradient(135deg,#7C6BFF_0%,#5B6CFF_45%,#24D1C3_100%)]"
      />

      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-passport-navy/[0.05] dark:bg-white/[0.06]">
        {(
          [
            ['places', 'Places', Globe2],
            ['journeys', 'Journeys', MapPinned],
          ] as [AtlasTab, string, typeof Globe2][]
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

      {tab === 'places' ? (
        <PassportView
          mode="atlas"
          userId={props.userId}
          places={props.places}
          discoveries={props.discoveries}
          expeditions={props.expeditions}
          aggregates={props.aggregates}
          stats={props.stats}
          discoveryStats={props.discoveryStats}
          expeditionCount={props.expeditions.length}
          friendCountryMap={props.friendCountryMap}
          saved={props.saved}
          onAddAspiring={props.onAddAspiring}
          openImport={props.openImport}
          onImportConsumed={props.onImportConsumed}
          focusPlace={props.focusPlace}
          onFocusConsumed={props.onFocusConsumed}
          openAdd={props.openAddPlace}
          onAddConsumed={props.onAddPlaceConsumed}
          onExplore={props.onExplore}
          loading={props.loading}
        />
      ) : (
        <ExpeditionsView
          userId={props.userId}
          expeditions={props.expeditions}
          discoveries={props.discoveries}
          places={props.places}
          newTripCountry={props.newTripCountry}
          onNewTripConsumed={props.onNewTripConsumed}
          openImport={props.openFlighty}
          onImportConsumed={props.onFlightyConsumed}
          openAdd={props.openAddJourney}
          onAddConsumed={props.onAddJourneyConsumed}
          loading={props.expeditionsLoading}
        />
      )}
    </div>
  );
}
