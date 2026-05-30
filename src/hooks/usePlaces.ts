import { useEffect, useState } from 'react';
import { subscribePlaces } from '../lib/places';
import type { Place } from '../types';

interface State {
  places: Place[];
  loading: boolean;
}

/** Real-time-synced list of the Member's places. Mirrors the Firestore pattern
 *  every Passport collection follows. */
export function usePlaces(userId: string | undefined): State {
  const [state, setState] = useState<State>({ places: [], loading: true });

  useEffect(() => {
    if (!userId) {
      setState({ places: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribePlaces(userId, (places) => {
      setState({ places, loading: false });
    });
    return unsub;
  }, [userId]);

  return state;
}
