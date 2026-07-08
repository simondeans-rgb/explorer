import { useEffect, useState } from 'react';

// On-demand landmark info (a photo + a one-sentence description) from the
// Wikipedia REST summary API — content is free to reuse (CC BY-SA / Commons).
// Cached in-memory so repeat opens are instant.

export interface LandmarkInfo {
  description?: string;
  image?: string;
  /** Canonical Wikipedia article URL, for the "via Wikipedia ›" credit link. */
  url?: string;
}

const cache = new Map<string, LandmarkInfo | null>();

// A few landmark names that don't resolve well by search alone — map them to
// their canonical Wikipedia page title. Most names resolve via the direct
// lookup or the country-hinted search fallback, so this stays short.
const TITLE_OVERRIDES: Record<string, string> = {
  'big ben & westminster': 'Big Ben',
  'venice canals': 'Grand Canal (Venice)',
  'northern lights': 'Aurora',
  'canal ring': 'Canals of Amsterdam',
  'old city of jerusalem': 'Old City (Jerusalem)',
  'amazon rainforest': 'Amazon rainforest',
  'sahara desert': 'Sahara',
};

function firstSentence(s: string): string {
  const m = s.match(/^[\s\S]*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}

function summaryToInfo(j: {
  type?: string;
  extract?: string;
  description?: string;
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
}): LandmarkInfo | null {
  if (j.type === 'disambiguation') return null;
  const desc = j.extract ? firstSentence(j.extract) : j.description;
  const image = j.thumbnail?.source ?? j.originalimage?.source;
  if (!desc && !image) return null;
  return { description: desc, image, url: j.content_urls?.desktop?.page };
}

/** Fetch the REST summary for an exact page title. */
async function fetchSummary(title: string): Promise<LandmarkInfo | null> {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  return summaryToInfo(await res.json());
}

/** Find the best-matching page title via Wikipedia search (country-hinted). */
async function searchTitle(query: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srlimit=1&srsearch=${encodeURIComponent(query)}&origin=*`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const j = (await res.json()) as { query?: { search?: { title?: string }[] } };
  return j.query?.search?.[0]?.title ?? null;
}

export async function fetchLandmarkInfo(name: string, hint?: string): Promise<LandmarkInfo | null> {
  if (!name.trim()) return null;
  const key = `${name.trim().toLowerCase()}|${(hint ?? '').toLowerCase()}`;
  if (cache.has(key)) return cache.get(key) ?? null;
  try {
    const override = TITLE_OVERRIDES[name.trim().toLowerCase()];
    // 1) explicit override, 2) the name as a page title, 3) a country-hinted
    //    search to recover from ambiguous / compound names.
    let info = override ? await fetchSummary(override) : await fetchSummary(name);
    if (!info) {
      const title = await searchTitle(hint ? `${name} ${hint}` : name);
      if (title) info = await fetchSummary(title);
    }
    cache.set(key, info);
    return info;
  } catch {
    cache.set(key, null);
    return null;
  }
}

/** undefined = still loading, null = nothing found, object = info. */
export function useLandmarkInfo(name: string | undefined, enabled: boolean, hint?: string): LandmarkInfo | null | undefined {
  const [info, setInfo] = useState<LandmarkInfo | null | undefined>(undefined);
  useEffect(() => {
    if (!enabled || !name) {
      setInfo(undefined);
      return;
    }
    let active = true;
    setInfo(undefined);
    fetchLandmarkInfo(name, hint).then((i) => {
      if (active) setInfo(i);
    });
    return () => {
      active = false;
    };
  }, [name, enabled, hint]);
  return info;
}
