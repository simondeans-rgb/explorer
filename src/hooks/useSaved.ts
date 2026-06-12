import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  subscribeSaved,
  createSaved,
  deleteSaved,
  type SavedItem,
  type SavedInput,
} from '../lib/saved';

export interface UseSaved {
  saved: SavedItem[];
  loading: boolean;
  isSaved: (key: string) => boolean;
  toggle: (input: SavedInput) => void;
}

/** Real-time-synced bookmarks, newest first, with a toggle helper. */
export function useSaved(userId: string | undefined): UseSaved {
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSaved([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeSaved(userId, (items) => {
      setSaved([...items].sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  const byKey = useMemo(
    () => new Map(saved.map((s) => [s.key, s])),
    [saved],
  );

  const isSaved = useCallback((key: string) => byKey.has(key), [byKey]);

  const toggle = useCallback(
    (input: SavedInput) => {
      if (!userId) return;
      const existing = byKey.get(input.key);
      if (existing) void deleteSaved(existing.id);
      else void createSaved(userId, input);
    },
    [userId, byKey],
  );

  return { saved, loading, isSaved, toggle };
}
