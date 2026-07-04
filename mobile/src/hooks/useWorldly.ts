import { useMemo } from 'react';
import { aggregateByCountry, computeStats } from '../lib/stats';
import { computeDiscoveryStats } from '../lib/discoveryStats';
import { computeJourneyStats } from '../lib/journeyStats';
import { computeExplorerLevel, computeBadges } from '../lib/explorer';
import { useData } from '../store/data';

/** The Member's world, computed by the shared engines over the live local store
 *  (AsyncStorage). Swaps to Firestore subscriptions in a later slice without
 *  changing any screen that consumes this. */
export function useWorldly() {
  const { places, discoveries, expeditions, captures } = useData();

  return useMemo(() => {
    const aggregates = aggregateByCountry(places);
    const stats = computeStats(aggregates);
    const discoveryStats = computeDiscoveryStats(discoveries);
    const journeyStats = computeJourneyStats(expeditions);
    const level = computeExplorerLevel(stats, discoveryStats, journeyStats);
    const badges = computeBadges({
      stats,
      discovery: discoveryStats,
      journeys: journeyStats,
      captures: captures.length,
      trips: expeditions.map((e) => ({ startDate: e.startDate, countryCodes: e.countryCodes })),
    });
    return {
      places,
      discoveries,
      expeditions,
      aggregates,
      stats,
      discoveryStats,
      journeyStats,
      level,
      badges,
    };
  }, [places, discoveries, expeditions, captures]);
}
