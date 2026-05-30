import { useEffect, useState } from 'react';
import { subscribeExpeditions } from '../lib/expeditions';
import type { Expedition } from '../types';

interface State {
  expeditions: Expedition[];
  loading: boolean;
}

/** Real-time-synced list of the Member's Expeditions. */
export function useExpeditions(userId: string | undefined): State {
  const [state, setState] = useState<State>({
    expeditions: [],
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setState({ expeditions: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeExpeditions(userId, (expeditions) => {
      setState({ expeditions, loading: false });
    });
    return unsub;
  }, [userId]);

  return state;
}
