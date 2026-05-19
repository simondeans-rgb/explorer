import { useEffect, useState } from 'react';
import { subscribeNotes } from '../lib/notes';
import type { Note } from '../types';

interface State {
  notes: Note[];
  loading: boolean;
}

export function useNotes(userId: string | undefined): State {
  const [state, setState] = useState<State>({ notes: [], loading: true });

  useEffect(() => {
    if (!userId) {
      setState({ notes: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeNotes(userId, (notes) => {
      setState({ notes, loading: false });
    });
    return unsub;
  }, [userId]);

  return state;
}
