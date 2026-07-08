// Entitlements core — deliberately DORMANT until RevenueCat is connected.
//
// Mirrors the analytics wrapper: `enabled` flips on the presence of
// EXPO_PUBLIC_REVENUECAT_KEY at bundle time. While dormant, everyone is an
// Explorer (fully unlocked), no paywall can ever appear, and no price is shown
// anywhere. When RevenueCat lands, `react-native-purchases` slots in behind
// this module (native build required) and the cached entitlement drives
// `currentTier()`; nothing outside this file changes.
//
// Never throws — billing must never break the app.
import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WANDERER_LIMITS, type LimitMetric, type Tier } from './limits';

const RC_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY ?? '';
const TIER_CACHE_KEY = 'worldly:tier';

const enabled = Boolean(RC_KEY);

let tier: Tier = enabled ? 'wanderer' : 'explorer';
const listeners = new Set<() => void>();

// Warm the cached entitlement so a paying user isn't gated during app start
// while the store SDK wakes up.
if (enabled) {
  AsyncStorage.getItem(TIER_CACHE_KEY)
    .then((t) => {
      if (t === 'explorer' || t === 'wanderer') setTier(t);
    })
    .catch(() => {});
}

function setTier(next: Tier) {
  if (next === tier) return;
  tier = next;
  listeners.forEach((l) => l());
  AsyncStorage.setItem(TIER_CACHE_KEY, next).catch(() => {});
}

/** True once RevenueCat is configured for this build. */
export function billingEnabled(): boolean {
  return enabled;
}

/** The user's current tier. Always 'explorer' while billing is dormant. */
export function currentTier(): Tier {
  return tier;
}

/** React hook version of currentTier(). */
export function useTier(): Tier {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => tier,
  );
}

/** For the future purchase/restore flow (and tests) to publish a tier change. */
export function applyEntitlement(next: Tier) {
  setTier(next);
}

/** Whether `current` usage of a metric is inside the user's allowance.
 *  `limit` is null when unlimited. Never blocks while billing is dormant. */
export function checkLimit(metric: LimitMetric, current: number): { allowed: boolean; limit: number | null } {
  if (!enabled || tier === 'explorer') return { allowed: true, limit: null };
  const limit = WANDERER_LIMITS[metric];
  return { allowed: current < limit, limit };
}

/** The high-intent moments that may open the paywall. */
export type PaywallTrigger =
  | 'countries'
  | 'circle'
  | 'discoveries'
  | 'itineraries'
  | 'charts'
  | 'wrapped'
  | 'post-trip'
  | 'lookups'
  | 'covers';

/** True when the paywall should open for this moment: billing is live, the
 *  user is a Wanderer, and (for metered triggers) they're at their limit. */
export function shouldGate(trigger: PaywallTrigger, current?: number): boolean {
  if (!enabled || tier === 'explorer') return false;
  const metric: LimitMetric | null =
    trigger === 'countries' ? 'countries'
    : trigger === 'circle' ? 'circle'
    : trigger === 'discoveries' ? 'discoveries'
    : trigger === 'itineraries' ? 'itineraries'
    : trigger === 'lookups' ? 'flightLookupsPerMonth'
    : null;
  if (metric && current != null) return !checkLimit(metric, current).allowed;
  return true; // feature-gated moments (charts, wrapped, covers, post-trip)
}
