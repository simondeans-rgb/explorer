import { useMemo } from 'react';
import { aggregateByCountry, computeStats } from '../lib/stats';
import { computeDiscoveryStats } from '../lib/discoveryStats';
import { computeJourneyStats } from '../lib/journeyStats';
import { computeExplorerLevel, computeBadges } from '../lib/explorer';
import { SEED_PLACES, SEED_DISCOVERIES, SEED_EXPEDITIONS } from '../lib/seed';

/**
 * The Member's world, computed by the shared engines. Currently fed by seed
 * data; swaps to live Firestore subscriptions in the data-layer slice without
 * changing any screen that consumes this.
 */
export function useWorldly() {
  const places = SEED_PLACES;
  const discoveries = SEED_DISCOVERIES;
  const expeditions = SEED_EXPEDITIONS;

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
  }, [places, discoveries, expeditions]);
}
