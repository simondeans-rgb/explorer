import { useEffect, useMemo, useState } from 'react';
import { subscribeReplies, type Reply } from '../lib/replies';

/** Live replies for a set of captures, keyed by capture id. */
export function useReplies(captureIds: string[], enabled: boolean) {
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const key = useMemo(() => [...captureIds].sort().join(','), [captureIds]);

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    if (!enabled || ids.length === 0) {
      setReplies({});
      return;
    }
    return subscribeReplies(ids, setReplies);
  }, [key, enabled]);

  return replies;
}
