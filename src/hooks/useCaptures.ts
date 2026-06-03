import { useEffect, useState } from 'react';
import { subscribeCaptures } from '../lib/captures';
import type { Capture } from '../types';

interface State {
  captures: Capture[];
  loading: boolean;
}

/** Real-time-synced list of the Member's photo captures, newest first. */
export function useCaptures(userId: string | undefined): State {
  const [state, setState] = useState<State>({
    captures: [],
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setState({ captures: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeCaptures(userId, (captures) => {
      const sorted = [...captures].sort((a, b) => b.createdAt - a.createdAt);
      setState({ captures: sorted, loading: false });
    });
    return unsub;
  }, [userId]);

  return state;
}
