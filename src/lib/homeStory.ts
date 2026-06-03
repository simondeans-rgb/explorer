// Home "story" engine.
//
// Turns a Member's data into a small, ordered set of emotional hero cards —
// content and memories first, statistics never. Powers the opening experience:
// a swipeable full-bleed carousel of the moments that matter right now.

import type { Discovery, Expedition } from '../types';
import { VERDICT_META, DISCOVERY_CATEGORY_META } from '../types';
import { countryName } from '../data/countries';
import type { FriendPresence } from './friends';

export type StoryKind =
  | 'current'
  | 'last'
  | 'memory'
  | 'friend'
  | 'favourite'
  | 'welcome';

export interface StoryCard {
  id: string;
  kind: StoryKind;
  /** Country code for imagery (falls back to gradient when absent). */
  code: string;
  /** Small eyebrow line, e.g. "Currently exploring". */
  eyebrow: string;
  /** Large emotional headline. */
  title: string;
  /** One supporting line. */
  subtitle?: string;
  /** Optional quote / note shown in italics. */
  note?: string;
  /** Tiny meta line (date, place). */
  meta?: string;
}

function monthYear(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function isOngoing(e: Expedition, now: number): boolean {
  if (!e.startDate) return false;
  const start = Date.parse(e.startDate);
  if (Number.isNaN(start) || start > now) return false;
  if (!e.endDate) return now - start < 1000 * 60 * 60 * 24 * 21; // open trip, < 3wk
  const end = Date.parse(e.endDate);
  return !Number.isNaN(end) && now <= end + 1000 * 60 * 60 * 24; // through end day
}

interface Input {
  name: string;
  expeditions: Expedition[];
  discoveries: Discovery[];
  friendCountryMap: Map<string, FriendPresence[]>;
}

/** Build the ordered hero story cards. Always returns at least one card. */
export function buildHomeStory({
  name,
  expeditions,
  discoveries,
  friendCountryMap,
}: Input): StoryCard[] {
  const now = Date.now();
  const first = name?.split(' ')[0] || 'Explorer';
  const cards: StoryCard[] = [];

  const byDateDesc = [...expeditions].sort(
    (a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''),
  );

  // 1) Current trip
  const current = byDateDesc.find((e) => isOngoing(e, now));
  if (current) {
    cards.push({
      id: `current-${current.id}`,
      kind: 'current',
      code: current.countryCodes[0] ?? '',
      eyebrow: 'Right now',
      title: current.title,
      subtitle: `You're exploring ${current.countryCodes.map(countryName).slice(0, 2).join(' & ') || 'somewhere wonderful'}`,
      note: current.note,
      meta: monthYear(current.startDate),
    });
  }

  // 2) Last (most recent completed) trip
  const last = byDateDesc.find((e) => e !== current);
  if (last) {
    cards.push({
      id: `last-${last.id}`,
      kind: 'last',
      code: last.countryCodes[0] ?? '',
      eyebrow: current ? 'Before that' : 'Your latest journey',
      title: last.title,
      subtitle: last.countryCodes.length
        ? last.countryCodes.map(countryName).slice(0, 3).join(' · ')
        : undefined,
      note: last.note,
      meta: monthYear(last.startDate),
    });
  }

  // 3) Featured memory — a discovery with a heartfelt note
  const memory = discoveries
    .filter((d) => (d.note?.trim().length ?? 0) > 12)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
  if (memory) {
    const place = [memory.city, memory.countryCode ? countryName(memory.countryCode) : null]
      .filter(Boolean)
      .join(', ');
    cards.push({
      id: `memory-${memory.id}`,
      kind: 'memory',
      code: memory.countryCode ?? '',
      eyebrow: 'A memory worth keeping',
      title: memory.name,
      subtitle: place || DISCOVERY_CATEGORY_META[memory.category].label,
      note: memory.note,
    });
  }

  // 4) Friend recommendation — someone you trust loved a place
  let friendCard: StoryCard | undefined;
  for (const [code, presences] of friendCountryMap) {
    for (const p of presences) {
      const rec =
        p.discoveries.find((d) => d.verdict === 'recommend') ??
        p.discoveries.find((d) => d.verdict === 'hidden-gem') ??
        p.discoveries[0];
      if (rec) {
        friendCard = {
          id: `friend-${code}-${p.uid}`,
          kind: 'friend',
          code,
          eyebrow: `${p.name} recommends`,
          title: rec.name,
          subtitle: `In ${countryName(code)}`,
          meta: rec.verdict ? VERDICT_META[rec.verdict].label : undefined,
        };
        break;
      }
    }
    if (friendCard) break;
  }
  if (friendCard) cards.push(friendCard);

  // 5) Favourite discovery — your own top recommendation
  const favourite =
    discoveries.find((d) => d.verdict === 'recommend') ??
    discoveries.find((d) => d.verdict === 'hidden-gem');
  if (favourite && favourite.id !== memory?.id) {
    const place = [favourite.city, favourite.countryCode ? countryName(favourite.countryCode) : null]
      .filter(Boolean)
      .join(', ');
    cards.push({
      id: `fav-${favourite.id}`,
      kind: 'favourite',
      code: favourite.countryCode ?? '',
      eyebrow: 'One of your favourites',
      title: favourite.name,
      subtitle: place || undefined,
      note: favourite.note,
    });
  }

  // Fallback — a warm welcome when there's nothing yet.
  if (cards.length === 0) {
    cards.push({
      id: 'welcome',
      kind: 'welcome',
      code: '',
      eyebrow: `Welcome, ${first}`,
      title: 'Your story starts here',
      subtitle: 'Add a place, log a journey, or import your travels to begin.',
    });
  }

  return cards.slice(0, 6);
}
