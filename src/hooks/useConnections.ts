import { useEffect, useState } from 'react';
import { subscribeConnections, type Connection } from '../lib/connections';

interface State {
  connections: Connection[];
  loading: boolean;
}

export function useConnections(userId: string | undefined): State {
  const [state, setState] = useState<State>({
    connections: [],
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setState({ connections: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeConnections(userId, (connections) =>
      setState({ connections, loading: false }),
    );
    return unsub;
  }, [userId]);

  return state;
}
