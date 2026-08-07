import { useMemo } from 'react';
import { aggregateByCountry, computeStats } from '../lib/stats';
import { computeDiscoveryStats } from '../lib/discoveryStats';
import { computeJourneyStats } from '../lib/journeyStats';
import { computeExplorerLevel, computeBadges } from '../lib/explorer';
import { isUpcoming } from '../lib/tripPhase';
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
    // Stats/badges count RECORDED travel only — a purely-planned upcoming trip
    // (no legs) doesn't count as a journey until it happens or has legs.
    const today = new Date().toISOString().slice(0, 10);
    const recorded = expeditions.filter((e) => e.journeys.length > 0 || !isUpcoming(e, today));
    const journeyStats = computeJourneyStats(recorded);
    const level = computeExplorerLevel(stats, discoveryStats, journeyStats);
    const badges = computeBadges({
      stats,
      discovery: discoveryStats,
      journeys: journeyStats,
      captures: captures.length,
      trips: recorded.map((e) => ({ startDate: e.startDate, countryCodes: e.countryCodes })),
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
