import { useCallback, useEffect, useState } from 'react';
import { subscribeLikes, toggleLike, type LikeState } from '../lib/likes';

/** Live like counts for a set of captures, with an optimistic toggle. */
export function useLikes(captureIds: string[], myUid: string | undefined) {
  const [server, setServer] = useState<Record<string, LikeState>>({});
  const [optimistic, setOptimistic] = useState<Record<string, LikeState>>({});
  const key = [...captureIds].sort().join(',');

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    if (!myUid || ids.length === 0) {
      setServer({});
      return;
    }
    return subscribeLikes(ids, myUid, (m) => {
      setServer(m);
      setOptimistic({});
    });
  }, [key, myUid]);

  const likes = { ...server, ...optimistic };

  const toggle = useCallback(
    (captureId: string, ownerUid: string) => {
      if (!myUid) return;
      const cur = optimistic[captureId] ?? server[captureId] ?? { count: 0, likedByMe: false };
      const next: LikeState = { count: Math.max(0, cur.count + (cur.likedByMe ? -1 : 1)), likedByMe: !cur.likedByMe };
      setOptimistic((o) => ({ ...o, [captureId]: next }));
      toggleLike(captureId, ownerUid, myUid, cur.likedByMe).catch(() => {
        setOptimistic((o) => ({ ...o, [captureId]: cur }));
      });
    },
    [myUid, optimistic, server],
  );

  return { likes, toggle };
}
