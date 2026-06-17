import { useEffect, useState } from 'react';

// On-demand landmark info (a photo + a one-sentence description) from the
// Wikipedia REST summary API — content is free to reuse (CC BY-SA / Commons).
// Cached in-memory so repeat opens are instant.

export interface LandmarkInfo {
  description?: string;
  image?: string;
}

const cache = new Map<string, LandmarkInfo | null>();

function firstSentence(s: string): string {
  const m = s.match(/^[\s\S]*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}

export async function fetchLandmarkInfo(name: string): Promise<LandmarkInfo | null> {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const j = (await res.json()) as { extract?: string; description?: string; thumbnail?: { source?: string }; originalimage?: { source?: string } };
    const desc = j.extract ? firstSentence(j.extract) : j.description;
    const info: LandmarkInfo = { description: desc, image: j.thumbnail?.source ?? j.originalimage?.source };
    cache.set(key, info);
    return info;
  } catch {
    cache.set(key, null);
    return null;
  }
}

/** undefined = still loading, null = nothing found, object = info. */
export function useLandmarkInfo(name: string | undefined, enabled: boolean): LandmarkInfo | null | undefined {
  const [info, setInfo] = useState<LandmarkInfo | null | undefined>(undefined);
  useEffect(() => {
    if (!enabled || !name) {
      setInfo(undefined);
      return;
    }
    let active = true;
    setInfo(undefined);
    fetchLandmarkInfo(name).then((i) => {
      if (active) setInfo(i);
    });
    return () => {
      active = false;
    };
  }, [name, enabled]);
  return info;
}
