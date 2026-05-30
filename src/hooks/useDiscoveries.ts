import { useEffect, useState } from 'react';
import { subscribeDiscoveries } from '../lib/discoveries';
import type { Discovery } from '../types';

interface State {
  discoveries: Discovery[];
  loading: boolean;
}

/** Real-time-synced list of the Member's Discoveries. */
export function useDiscoveries(userId: string | undefined): State {
  const [state, setState] = useState<State>({
    discoveries: [],
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setState({ discoveries: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeDiscoveries(userId, (discoveries) => {
      setState({ discoveries, loading: false });
    });
    return unsub;
  }, [userId]);

  return state;
}
