import { useEffect, useState } from 'react';
import { subscribeTrips } from '../lib/trips';
import type { Trip } from '../types';

interface State {
  trips: Trip[];
  loading: boolean;
}

/** Real-time-synced trips, soonest start date first. */
export function useTrips(userId: string | undefined): State {
  const [state, setState] = useState<State>({ trips: [], loading: true });

  useEffect(() => {
    if (!userId) {
      setState({ trips: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeTrips(userId, (trips) => {
      const sorted = [...trips].sort((a, b) =>
        (a.startDate || '').localeCompare(b.startDate || ''),
      );
      setState({ trips: sorted, loading: false });
    });
    return unsub;
  }, [userId]);

  return state;
}

/** Days from today until an ISO date (negative if past). */
export function daysUntil(iso: string): number {
  if (!iso) return NaN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** A trip is "upcoming" until the day after it ends (or starts, if open-ended). */
export function isUpcoming(t: Trip): boolean {
  const end = t.endDate || t.startDate;
  return daysUntil(end) >= 0;
}
