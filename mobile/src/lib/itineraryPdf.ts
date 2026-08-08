// Export a trip itinerary as an art-directed, keepsake-quality A4 PDF via
// expo-print, then hand it to the native share sheet. This is the ONLY itinerary
// export. The goal is a document that feels like Worldly made a personal travel
// guide — premium travel-magazine meets travel journal — not a data dump.
//
// Design is built from the real Worldly design system (src/lib/theme.ts, the
// Almanac book, PageHero/HeroWave, DiscoveryCard): coral→lavender→aqua brand
// gradient, Fraunces display + Plus Jakarta UI (embedded as @font-face), the
// full-bleed photo cover with a navy scrim + coral rule, the signature HeroWave
// "W-scallop" edge, category/verdict colours, and the gold Society seal.
//
// Print-renderer constraints (from the Almanac book, almanacBook.ts):
// - Photos are CSS background-images, never <img> (iOS prints <img> as black
//   boxes) and are inlined as base64 data URIs (the renderer snapshots before
//   remote images load).
// - The A4 page size is passed to printToFileAsync explicitly (CSS @page is
//   ignored; iOS otherwise falls back to US Letter).
// Everything degrades gracefully offline: no photos → on-brand gradient panels,
// no embedded fonts → Georgia / system stack. Never a black box; always exports.
import { destinationImage } from './destinationImage';
import { fetchWithTimeout } from './net';
import { landmarkBlurb } from '../data/landmarkBlurbs';

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&#39;' : '&quot;',
  );

// ── Types ────────────────────────────────────────────────────────────────────
export type ItinCategory = 'food' | 'accommodation' | 'culture' | 'experience' | 'nature';
export type ItinVerdict = 'recommend' | 'hidden-gem' | 'worth-visiting' | 'overrated' | 'avoid';

export interface DocItem {
  name: string;
  city?: string;
  category?: ItinCategory;
  /** Resolved human label (subcategory preferred), e.g. "Historic site". */
  categoryLabel?: string;
  /** Display name of the friend who recommended this, if any. */
  fromFriend?: string;
  verdict?: ItinVerdict;
  /** The recommender's own note / quote (already connection-gated in-app). */
  note?: string;
  /** The recommender's own photo (remote or data URL) — preferred over stock. */
  photo?: string;
  /** Fallback "London · Café" line when there's nothing richer. */
  meta?: string;
}
export interface DocSlot {
  label: string;
  items: DocItem[];
}
export interface DocDay {
  badge?: string;
  label: string;
  /** "Westminster · South Bank" — only when reliably derived from item cities. */
  subtitle?: string;
  note?: string;
  slots: DocSlot[];
}
export interface DocInput {
  title: string;
  destination?: string;
  /** Flag emoji for the destination. */
  flag?: string;
  /** "8–10 August 2026". */
  dateLabel?: string;
  heroCode?: string;
  dayCount?: number;
  cityCount?: number;
  crew?: string[];
  /** A user's own trip photo (remote/data URL) to prefer for the cover. */
  userHeroUrl?: string;
  /** Destination ideas (name only) to offer when days are empty — never fabricated. */
  inspiration?: string[];
  days: DocDay[];
}

// ── Brand tokens (from src/lib/theme.ts) ─────────────────────────────────────
const CORAL = '#FF6B9A';
const LAV = '#9B7CFF';
const AQUA = '#24D1C3';
const SUN = '#FFB84D';
const SKY = '#4DA6FF';
const NAVY = '#14213D';
const INK2 = '#48506B';
const INK3 = '#5E6377';
const PAPER = '#FAFAFC';
const LINE = '#EDEEF4';
const GOLD = '#C9A84C';
const DAY_ACCENTS = [CORAL, LAV, AQUA, SUN, SKY];

const CATEGORY = {
  food: { color: SUN, label: 'Food & Drink' },
  accommodation: { color: LAV, label: 'Stay' },
  culture: { color: AQUA, label: 'Culture' },
  experience: { color: '#FF8A5B', label: 'Experience' },
  nature: { color: '#34C77B', label: 'Nature' },
} as const;
const VERDICT = {
  recommend: { color: CORAL, label: 'Recommended' },
  'hidden-gem': { color: '#B5731A', label: 'Hidden gem' },
  'worth-visiting': { color: LAV, label: 'Worth visiting' },
  overrated: { color: INK2, label: 'Overrated' },
  avoid: { color: '#E0245E', label: 'Best skipped' },
} as const;

const VIVID = 'filter: saturate(1.24) contrast(1.05) brightness(1.02);';
/** Canonical over-photo navy scrim so white text always reads (hero-scrim). */
const SCRIM = 'linear-gradient(to top, rgba(20,33,61,0.82) 0%, rgba(20,33,61,0.30) 44%, rgba(20,33,61,0) 78%)';
/** Cover scrim: darkened at BOTH ends so the top wordmark and the bottom title
 *  each read over any photo (mirrors the Almanac cover's 3-stop wash). */
const COVER_SCRIM =
  'linear-gradient(to bottom, rgba(20,33,61,0.55) 0%, rgba(20,33,61,0.10) 30%, rgba(20,33,61,0.34) 58%, rgba(20,33,61,0.88) 100%)';

function hashOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 53 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
/** A deterministic on-brand gradient for a name (photo-less panels). */
function panelGradient(name: string): string {
  const s = [
    [CORAL, LAV],
    [LAV, AQUA],
    [AQUA, SUN],
    [SUN, CORAL],
    [SKY, LAV],
  ][hashOf(name) % 5];
  return `linear-gradient(135deg, ${s[0]}, ${s[1]})`;
}

// ── SVG marks ────────────────────────────────────────────────────────────────
/** The Worldly globe mark (coral→lavender→aqua), inline SVG — always print-safe. */
function mark(px: number, id: string, mono?: string): string {
  const fill = mono ? mono : `url(#${id})`;
  const stroke = mono ? '#fff' : '#fff';
  return `<svg width="${px}" height="${px}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="display:block">
    ${mono ? '' : `<defs><linearGradient id="${id}" x1="8" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${CORAL}"/><stop offset="0.5" stop-color="${LAV}"/><stop offset="1" stop-color="${AQUA}"/></linearGradient></defs>`}
    <rect x="4" y="4" width="56" height="56" rx="16" fill="${fill}"/>
    <g fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round">
      <circle cx="32" cy="32" r="15" opacity="0.95"/><ellipse cx="32" cy="32" rx="6.4" ry="15" opacity="0.85"/>
      <line x1="17" y1="32" x2="47" y2="32" opacity="0.85"/><path d="M20 24 Q32 30 44 24" opacity="0.7"/><path d="M20 40 Q32 34 44 40" opacity="0.7"/>
    </g></svg>`;
}
/** The signature HeroWave "W-scallop" edge, filled with `color`. Height in pt. */
const WAVE_CURVE =
  'M0,93 C12.2,91.3 62.5,77.9 86,81 C109.5,84.1 148.6,113 166,115 C183.4,117 197.7,95 209,95 C220.3,95 229.4,117 246,115 C262.6,113 291.1,85.1 326,81 C360.9,76.9 447.5,86.4 492,86 C536.5,85.6 591.1,82.4 640,78 C688.9,73.6 781.2,62.4 837,55 C892.8,47.6 976.9,33.1 1034,26 C1091.1,18.9 1191,7.8 1240,5 C1289,2.2 1351.7,5.2 1380,6 C1408.3,6.8 1431.5,10.3 1440,11';
function wave(color: string, h: number, flip = false): string {
  const d = `${WAVE_CURVE} L1440,121 L0,121 Z`;
  return `<svg width="100%" height="${h}pt" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block${flip ? ';transform:scaleY(-1)' : ''}"><path d="${d}" fill="${color}"/></svg>`;
}
/** A location pin glyph in `color`. */
function pin(px: number, color: string): string {
  return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M12 22s7-6.6 7-12A7 7 0 1 0 5 10c0 5.4 7 12 7 12Z"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>`;
}
const ICON: Record<string, string> = {
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
  pin: '<path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/>',
  heart: '<path d="M12 20s-7-4.7-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.3-7 10-7 10Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  utensils: '<path d="M4 3v7a2 2 0 0 0 4 0V3M6 10v11M18 3c-2 0-3 2-3 5s1 4 3 4v9"/>',
  bed: '<path d="M3 8v11M3 13h18v6M21 19v-6a3 3 0 0 0-3-3H8v3"/>',
  landmark: '<path d="M4 21h16M5 21V10M19 21V10M9 21V10M15 21V10M12 3 4 8h16l-8-5Z"/>',
  ticket: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z"/>',
  mountain: '<path d="m3 20 6-11 4 6 2-3 6 8H3Z"/>',
};
function icon(name: string, color: string, px = 13, sw = 1.9): string {
  return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" style="display:block">${ICON[name]}</svg>`;
}
const CAT_ICON: Record<ItinCategory, string> = {
  food: 'utensils',
  accommodation: 'bed',
  culture: 'landmark',
  experience: 'ticket',
  nature: 'mountain',
};

// ── Assets ───────────────────────────────────────────────────────────────────
export interface ItemAsset {
  img?: string;
  blurb?: string;
}
export interface Assets {
  hero?: string;
  fontCss?: string;
  items: Map<string, ItemAsset>;
  inspiration: Map<string, string>; // name → image data URI
}

/** Fetch an image and return it as a base64 data URI (null on any failure). */
async function toDataUri(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetchWithTimeout(url, {}, 9000);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const TITLE_OVERRIDES: Record<string, string> = {
  'Big Ben & Westminster': 'Big Ben',
  'Venice Canals': 'Venice',
  'French Riviera': 'French Riviera',
  'Roman Baths': 'Roman Baths (Bath)',
  'Lake District': 'Lake District',
  'The Bund': 'The Bund',
  'Old Town Warsaw': 'Old Town, Warsaw',
  'Old Town Square': 'Old Town Square, Prague',
  'Northern Lights': 'Aurora',
  'Golden Circle': 'Golden Circle (Iceland)',
  'Canal Ring': 'Grachtengordel',
  'Bali Rice Terraces': 'Tegallalang',
};

/** Bump a Wikimedia thumb URL to a target width for higher-res crops. */
const widen = (url: string, w: number) => url.replace(/\/\d+px-/, `/${w}px-`);

/** Tidy a Wikipedia extract into a single warm-ish sentence (fallback only). */
function firstSentence(extract?: string): string | undefined {
  if (!extract) return undefined;
  let s = extract.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const cut = s.search(/\.(\s|$)/);
  if (cut > 0) s = s.slice(0, cut + 1);
  if (s.length > 150) s = s.slice(0, 147).replace(/[\s,;]+\S*$/, '') + '…';
  return s;
}

/** Wikipedia summary → { high-res image data URI, one-line blurb }. */
async function fetchWiki(name: string, width: number): Promise<ItemAsset> {
  const title = (TITLE_OVERRIDES[name] ?? name).trim();
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}?redirect=true`;
    const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } }, 8000);
    if (!res.ok) return {};
    const j = (await res.json()) as { extract?: string; thumbnail?: { source?: string }; originalimage?: { source?: string } };
    const raw = j.thumbnail?.source;
    const src = raw ? widen(raw, width) : j.originalimage?.source;
    const img = src ? (await toDataUri(src)) ?? undefined : undefined;
    return { img, blurb: landmarkBlurb(name) ?? firstSentence(j.extract) };
  } catch {
    return { blurb: landmarkBlurb(name) };
  }
}

/** Gather all remote imagery + fonts before rendering (see toDataUri notes). */
export async function gatherAssets(input: DocInput, fontCss?: string): Promise<Assets> {
  const heroP = toDataUri(input.userHeroUrl || (input.heroCode ? destinationImage(input.heroCode).photo ?? '' : ''));

  // Distinct items, in order; the first item of each day gets a larger crop.
  const seen = new Set<string>();
  const ordered: DocItem[] = [];
  const leadNames = new Set<string>();
  for (const d of input.days) {
    let first = true;
    for (const s of d.slots) {
      for (const it of s.items) {
        const key = it.name.toLowerCase();
        if (first) {
          leadNames.add(key);
          first = false;
        }
        if (!seen.has(key)) {
          seen.add(key);
          ordered.push(it);
        }
      }
    }
  }
  const capped = ordered.slice(0, 20);
  const results = await Promise.all(
    capped.map((it) => {
      const width = leadNames.has(it.name.toLowerCase()) ? 1100 : 640;
      // Prefer the recommender's own photo; otherwise Wikipedia.
      if (it.photo) {
        return toDataUri(it.photo).then((img) => ({ img: img ?? undefined, blurb: landmarkBlurb(it.name) }) as ItemAsset);
      }
      return fetchWiki(it.name, width);
    }),
  );
  const items = new Map<string, ItemAsset>();
  capped.forEach((it, i) => items.set(it.name.toLowerCase(), results[i] ?? {}));

  const inspiration = new Map<string, string>();
  const insp = (input.inspiration ?? []).filter((n) => !seen.has(n.toLowerCase())).slice(0, 3);
  const inspResults = await Promise.all(insp.map((n) => fetchWiki(n, 520)));
  insp.forEach((n, i) => {
    const img = inspResults[i]?.img;
    if (img) inspiration.set(n, img);
  });

  const hero = await heroP;
  return { hero: hero ?? undefined, fontCss, items, inspiration };
}

// ── Building blocks ──────────────────────────────────────────────────────────
function photoLayer(src: string | undefined, seed: string, cls = ''): string {
  return src
    ? `<div class="ph ${cls}" style="background-image:url('${src}');${VIVID}"></div>`
    : `<div class="ph ${cls}" style="background-image:${panelGradient(seed)}"></div>`;
}

function categoryChip(it: DocItem): string {
  if (!it.category) return '';
  const c = CATEGORY[it.category];
  const label = it.categoryLabel || c.label;
  return `<span class="chip" style="color:${c.color};background:${c.color}1A"><span class="chipico">${icon(CAT_ICON[it.category], c.color, 10, 2)}</span>${esc(label)}</span>`;
}
function verdictChip(v?: ItinVerdict): string {
  if (!v) return '';
  const m = VERDICT[v];
  return `<span class="chip" style="color:${m.color};background:${m.color}1A">${esc(m.label)}</span>`;
}

/** A friend recommendation ribbon + optional quote. */
function recBlock(it: DocItem): string {
  if (!it.fromFriend) return '';
  const quote = it.note
    ? `<div class="quote">${icon('heart', CORAL, 11, 0)}<span>“${esc(it.note)}”</span></div>`
    : '';
  return `<div class="recline">${icon('heart', CORAL, 11, 2)}<span>Recommended by <b>${esc(it.fromFriend)}</b></span></div>${quote}`;
}

/** A large landscape feature card: photo with title/overlay + editorial copy. */
function featureCard(it: DocItem, asset: ItemAsset | undefined, accent: string): string {
  const img = asset?.img;
  const blurb = asset?.blurb || it.meta || '';
  const cityPin = it.city ? `<span class="cpin">${pin(11, '#fff')} ${esc(it.city)}</span>` : '';
  return `<div class="feature">
    <div class="feat-photo">${photoLayer(img, it.name, 'feat-ph')}<div class="feat-scrim"></div>
      <div class="feat-cap">
        <div class="feat-chips">${it.fromFriend ? `<span class="chip solid" style="background:${CORAL}">${icon('heart', '#fff', 10, 0)}&nbsp;${esc(it.fromFriend)}’s pick</span>` : ''}${it.verdict && !(it.fromFriend && it.verdict === 'recommend') ? verdictChip(it.verdict) : ''}</div>
        <div class="feat-name">${esc(it.name)}</div>
        ${cityPin}
      </div>
    </div>
    ${blurb || it.category || it.note ? `<div class="feat-body">
      <div class="feat-meta">${categoryChip(it)}</div>
      ${blurb ? `<div class="feat-desc">${esc(blurb)}</div>` : ''}
      ${it.fromFriend && it.note ? `<div class="quote">${icon('heart', CORAL, 11, 0)}<span>“${esc(it.note)}” — <b>${esc(it.fromFriend)}</b></span></div>` : ''}
    </div>` : ''}
  </div>`;
}

/** A standard editorial row: square photo + name + chips + blurb + rec. */
function standardCard(it: DocItem, asset: ItemAsset | undefined, accent: string): string {
  const img = asset?.img;
  const blurb = asset?.blurb || it.meta || '';
  const cityPin = it.city ? `<span class="cpin ink">${pin(10, accent)} ${esc(it.city)}</span>` : '';
  return `<div class="card" style="border-left:3pt solid ${it.category ? CATEGORY[it.category].color : accent}">
    <div class="card-ph-wrap">${photoLayer(img, it.name, 'card-ph')}</div>
    <div class="card-body">
      <div class="card-name">${esc(it.name)}</div>
      <div class="card-meta">${cityPin}${categoryChip(it)}${it.fromFriend ? '' : verdictChip(it.verdict)}</div>
      ${blurb ? `<div class="card-desc">${esc(blurb)}</div>` : ''}
      ${recBlock(it)}
    </div>
  </div>`;
}

/** A compact secondary row (name + tiny thumb + one line) for dense days. */
function compactCard(it: DocItem, asset: ItemAsset | undefined, accent: string): string {
  const blurb = asset?.blurb || it.meta || '';
  const line = [it.city, blurb].filter(Boolean).join(' — ');
  return `<div class="compact">
    <div class="compact-ph-wrap">${photoLayer(asset?.img, it.name, 'compact-ph')}</div>
    <div class="compact-body">
      <div class="compact-name">${esc(it.name)}${it.fromFriend ? ` <span class="rectag">${icon('heart', CORAL, 9, 0)} ${esc(it.fromFriend)}</span>` : ''}</div>
      ${line ? `<div class="compact-line">${esc(line)}</div>` : ''}
    </div>
  </div>`;
}

/** One stop on the day's route: a rail (pin + connector) + the chosen card. */
function stopRow(card: string, accent: string, isFirst: boolean, isLast: boolean): string {
  return `<div class="stop">
    <div class="rail"><div class="rail-line top" style="background:${isFirst ? 'transparent' : accent}44"></div><div class="dot" style="background:${accent}"></div><div class="rail-line bot" style="background:${isLast ? 'transparent' : accent}44"></div></div>
    <div class="stop-card">${card}</div>
  </div>`;
}

function slotFlag(label: string, accent: string): string {
  return `<div class="slotflag"><span class="slot-dot" style="background:${accent}"></span><span class="slot-label" style="color:${accent}">${esc(label).toUpperCase()}</span></div>`;
}

function dayBlock(d: DocDay, idx: number, assets: Assets, isFirstContentDay: boolean): string {
  const accent = DAY_ACCENTS[idx % DAY_ACCENTS.length];
  const filled = d.slots.filter((s) => s.items.length);
  const flat: { label?: string; it: DocItem }[] = [];
  filled.forEach((s) => s.items.forEach((it, i) => flat.push({ label: i === 0 ? s.label : undefined, it })));

  const rows = flat.map((row, i) => {
    const asset = assets.items.get(row.it.name.toLowerCase());
    // Vary the layout intentionally: a large feature opens the trip and any busy
    // day (3+ stops); shorter days stay as elegant standard rows; dense tails go
    // compact. Recommendations get their ribbon + quote in every card type.
    const useFeature = !!asset?.img && i === 0 && (isFirstContentDay || flat.length >= 3);
    let card: string;
    if (useFeature) card = featureCard(row.it, asset, accent);
    else if (i >= 4) card = compactCard(row.it, asset, accent);
    else card = standardCard(row.it, asset, accent);
    const flag = row.label ? slotFlag(row.label, accent) : '';
    const stop = stopRow(card, accent, i === 0, i === flat.length - 1);
    return { flag, stop, i };
  });

  const head = `<div class="day-head">
      <div class="day-eyebrow" style="color:${accent}">DAY ${esc(d.badge ?? String(idx + 1))}</div>
      <div class="day-title">${esc(d.label)}</div>
      ${d.subtitle ? `<div class="day-sub">${esc(d.subtitle)}</div>` : ''}
      <div class="day-rule" style="background:${accent}"></div>
    </div>
    ${d.note ? `<div class="quote day-note">${icon('compass', accent, 11, 2)}<span>${esc(d.note)}</span></div>` : ''}`;

  // Keep the day header glued to its first stop so a heading never orphans at a
  // page foot; the rest of the stops flow and break naturally.
  const first = rows[0];
  const rest = rows.slice(1);
  return `<section class="day">
    <div class="day-open">${head}<div class="stops">${first ? `${first.flag}${first.stop}` : ''}</div></div>
    ${rest.length ? `<div class="stops">${rest.map((r) => `${r.flag}${r.stop}`).join('')}</div>` : ''}
  </section>`;
}

/** Consecutive empty days collapsed into one compact "more of your trip" card. */
function emptyGroup(days: { label: string }[]): string {
  return `<section class="empty-wrap">
    <div class="empty-eyebrow">MORE OF YOUR TRIP</div>
    <div class="empty-card">
      ${days.map((d) => `<div class="empty-row"><span class="empty-day">${esc(d.label)}</span><span class="empty-note">Open — nothing planned yet</span></div>`).join('')}
    </div>
  </section>`;
}

function inspirationBlock(assets: Assets, destination?: string): string {
  if (!assets.inspiration.size) return '';
  const cards = [...assets.inspiration.entries()]
    .map(
      ([name, img]) => `<div class="insp-card">${photoLayer(img, name, 'insp-ph')}<div class="insp-scrim"></div><div class="insp-name">${esc(name)}</div></div>`,
    )
    .join('');
  return `<section class="insp">
    <div class="insp-head"><span class="insp-eyebrow">NEED SOME INSPIRATION?</span><span class="insp-sub">Worldly favourites${destination ? ` in ${esc(destination)}` : ''}</span></div>
    <div class="insp-grid">${cards}</div>
  </section>`;
}

// ── HTML ─────────────────────────────────────────────────────────────────────
export function buildItineraryPdfHtml(input: DocInput, assets: Assets): string {
  // Group days into runs so empty ones collapse instead of eating pages.
  type Block = { kind: 'day'; d: DocDay; idx: number } | { kind: 'empty'; days: { label: string }[] };
  const blocks: Block[] = [];
  input.days.forEach((d, idx) => {
    const hasContent = d.slots.some((s) => s.items.length) || d.note;
    if (hasContent) blocks.push({ kind: 'day', d, idx });
    else {
      const last = blocks[blocks.length - 1];
      if (last && last.kind === 'empty') last.days.push({ label: d.label });
      else blocks.push({ kind: 'empty', days: [{ label: d.label }] });
    }
  });

  const heroPhoto = assets.hero
    ? `<div class="cover-ph" style="background-image:url('${assets.hero}');${VIVID}"></div>`
    : `<div class="cover-ph" style="background-image:${panelGradient(input.title)}"></div>`;

  const overviewChips = [
    input.destination ? { i: 'globe', l: 'Destination', v: `${input.flag ? input.flag + ' ' : ''}${input.destination}` } : null,
    input.dateLabel ? { i: 'calendar', l: 'When', v: input.dateLabel } : null,
    input.dayCount ? { i: 'clock', l: 'Duration', v: `${input.dayCount} day${input.dayCount === 1 ? '' : 's'}` } : null,
    input.cityCount ? { i: 'pin', l: 'Places', v: `${input.cityCount} ${input.cityCount === 1 ? 'city' : 'cities'}` } : null,
  ].filter(Boolean) as { i: string; l: string; v: string }[];

  let firstDaySeen = false;
  const body = blocks
    .map((b) => {
      if (b.kind === 'day') {
        const isFirst = !firstDaySeen;
        firstDaySeen = true;
        return dayBlock(b.d, b.idx, assets, isFirst);
      }
      return emptyGroup(b.days);
    })
    .join('');

  // Scale the cover title down for long trip names so it never collides with the
  // wordmark or overruns the cover.
  const tlen = input.title.length;
  const titleSize = tlen > 46 ? 25 : tlen > 34 ? 29 : tlen > 22 ? 34 : 42;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    ${assets.fontCss ?? ''}
    * { box-sizing: border-box; }
    :root { --serif: 'Fraunces', Georgia, 'Times New Roman', serif; --sans: 'PlusJakarta', -apple-system, 'Helvetica Neue', Arial, sans-serif; }
    html, body { margin: 0; padding: 0; }
    body { font-family: var(--sans); color: ${INK2}; -webkit-print-color-adjust: exact; print-color-adjust: exact; background:
      radial-gradient(120% 60% at 0% 0%, rgba(255,107,154,0.08), transparent 60%),
      radial-gradient(120% 60% at 100% 0%, rgba(155,124,255,0.08), transparent 60%),
      ${PAPER}; }
    .serif { font-family: var(--serif); }
    .wrap { padding: 0 30pt; }
    .ph { position: absolute; inset: 0; background-size: cover; background-position: center; }

    /* ── Cover ─────────────────────────────────────────── */
    .cover { position: relative; height: 250pt; overflow: hidden; }
    .cover-ph { position: absolute; inset: 0; background-size: cover; background-position: center; }
    .cover-scrim { position: absolute; inset: 0; background: ${COVER_SCRIM}; }
    .cover-top { position: absolute; top: 22pt; left: 30pt; right: 30pt; display: flex; align-items: center; justify-content: space-between; }
    .cover-brand { display: flex; align-items: center; gap: 8pt; }
    .cover-word { font-family: var(--serif); font-size: 19pt; color: #fff; letter-spacing: 0.3pt; text-shadow: 0 1pt 8pt rgba(0,0,0,0.4); }
    .cover-tagchip { font-size: 8pt; font-weight: 800; letter-spacing: 2pt; color: #fff; background: rgba(255,255,255,0.16); padding: 5pt 9pt; border-radius: 999pt; }
    .cover-cap { position: absolute; left: 30pt; right: 30pt; bottom: 26pt; }
    .cover-eyebrow { font-size: 10pt; font-weight: 800; letter-spacing: 3pt; color: #fff; opacity: 0.94; text-shadow: 0 1pt 8pt rgba(0,0,0,0.5); }
    .cover-rule { width: 54pt; height: 3.5pt; border-radius: 3pt; background: ${CORAL}; margin: 9pt 0 8pt; }
    .cover-title { font-family: var(--serif); font-weight: 600; line-height: 0.98; color: #fff; text-shadow: 0 2pt 18pt rgba(0,0,0,0.5); max-width: 94%; }
    .cover-dates { font-size: 11pt; font-weight: 600; color: #fff; opacity: 0.96; margin-top: 9pt; text-shadow: 0 1pt 8pt rgba(0,0,0,0.5); }
    .cover-wave { position: absolute; left: 0; right: 0; bottom: -1pt; }

    /* ── Overview ribbon ──────────────────────────────── */
    .overview { display: flex; flex-wrap: wrap; gap: 8pt 6pt; padding: 4pt 0 2pt; margin-top: 8pt; }
    .ochip { display: flex; align-items: center; gap: 7pt; width: 47%; padding: 8pt 4pt; }
    .oico { width: 27pt; height: 27pt; border-radius: 9pt; background: rgba(20,33,61,0.05); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .olabel { font-size: 7pt; font-weight: 800; letter-spacing: 1.3pt; color: ${INK3}; text-transform: uppercase; }
    .ovalue { font-size: 11pt; font-weight: 700; color: ${NAVY}; margin-top: 1pt; }
    .crew { font-size: 9.5pt; color: ${INK3}; font-style: italic; margin: 2pt 4pt 0; }

    /* ── Day ──────────────────────────────────────────── */
    .day { margin-top: 20pt; }
    .day-open { break-inside: avoid; page-break-inside: avoid; }
    .day-head { break-after: avoid-page; page-break-after: avoid; }
    .day-eyebrow { font-size: 9.5pt; font-weight: 800; letter-spacing: 3pt; }
    .day-title { font-family: var(--serif); font-weight: 600; font-size: 21pt; color: ${NAVY}; line-height: 1.05; margin-top: 1pt; }
    .day-sub { font-size: 9.5pt; font-weight: 700; letter-spacing: 0.4pt; color: ${INK3}; text-transform: uppercase; margin-top: 3pt; }
    .day-rule { width: 40pt; height: 3pt; border-radius: 2pt; margin-top: 8pt; }
    .day-note { margin: 10pt 0 2pt; }

    .stops { margin-top: 6pt; }
    .slotflag { display: flex; align-items: center; gap: 6pt; margin: 8pt 0 4pt 8pt; break-after: avoid-page; page-break-after: avoid; }
    .slot-dot { width: 7pt; height: 7pt; border-radius: 999pt; }
    .slot-label { font-size: 8pt; font-weight: 800; letter-spacing: 1.8pt; }

    .stop { display: flex; gap: 10pt; break-inside: avoid; page-break-inside: avoid; }
    .rail { width: 16pt; position: relative; display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
    .rail-line { width: 2pt; flex: 1; }
    .rail-line.top { min-height: 12pt; }
    .dot { width: 11pt; height: 11pt; border-radius: 999pt; border: 2.5pt solid ${PAPER}; box-shadow: 0 0 0 1pt rgba(20,33,61,0.06); }
    .stop-card { flex: 1; padding-bottom: 10pt; min-width: 0; }

    /* Feature card */
    .feature { border-radius: 18pt; overflow: hidden; background: #fff; box-shadow: 0 4pt 14pt rgba(20,33,61,0.09); }
    .feat-photo { position: relative; height: 158pt; }
    .feat-scrim { position: absolute; inset: 0; background: ${SCRIM}; }
    .feat-cap { position: absolute; left: 15pt; right: 15pt; bottom: 13pt; }
    .feat-chips { display: flex; gap: 5pt; margin-bottom: 6pt; }
    .feat-name { font-family: var(--serif); font-weight: 600; font-size: 20pt; color: #fff; line-height: 1.02; text-shadow: 0 2pt 12pt rgba(0,0,0,0.5); }
    .cpin { display: inline-flex; align-items: center; gap: 4pt; font-size: 9.5pt; font-weight: 700; color: #fff; opacity: 0.95; margin-top: 4pt; text-shadow: 0 1pt 6pt rgba(0,0,0,0.5); }
    .cpin svg { display: inline-block; vertical-align: middle; }
    .cpin.ink { color: ${INK2}; opacity: 1; text-shadow: none; }
    .feat-body { padding: 11pt 15pt 13pt; }
    .feat-meta { display: flex; gap: 5pt; margin-bottom: 5pt; }
    .feat-desc { font-size: 10.5pt; line-height: 1.5; color: ${INK2}; }

    /* Standard card */
    .card { display: flex; gap: 11pt; background: #fff; border-radius: 16pt; padding: 10pt 12pt 10pt 10pt; box-shadow: 0 3pt 10pt rgba(20,33,61,0.06); }
    .card-ph-wrap { width: 78pt; height: 78pt; border-radius: 12pt; overflow: hidden; position: relative; flex-shrink: 0; box-shadow: 0 2pt 8pt rgba(20,33,61,0.10); }
    .card-body { flex: 1; min-width: 0; padding-top: 1pt; }
    .card-name { font-family: var(--serif); font-weight: 600; font-size: 14pt; color: ${NAVY}; line-height: 1.1; }
    .card-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 5pt; margin: 4pt 0 3pt; }
    .card-desc { font-size: 10pt; line-height: 1.45; color: ${INK2}; }

    /* Compact card */
    .compact { display: flex; gap: 10pt; align-items: center; background: rgba(255,255,255,0.7); border: 1pt solid ${LINE}; border-radius: 13pt; padding: 7pt 10pt 7pt 7pt; }
    .compact-ph-wrap { width: 42pt; height: 42pt; border-radius: 9pt; overflow: hidden; position: relative; flex-shrink: 0; }
    .compact-name { font-family: var(--serif); font-weight: 600; font-size: 12.5pt; color: ${NAVY}; }
    .compact-line { font-size: 9.5pt; color: ${INK3}; margin-top: 1pt; }
    .rectag { font-size: 8.5pt; font-weight: 700; color: ${CORAL}; }
    .rectag svg { display: inline-block; vertical-align: middle; }

    /* Chips + recommendation */
    .chip { display: inline-flex; align-items: center; gap: 4pt; font-size: 8.5pt; font-weight: 700; padding: 3pt 8pt; border-radius: 999pt; letter-spacing: 0.2pt; }
    .chip.solid { color: #fff; }
    .chipico { display: inline-flex; }
    .recline { display: flex; align-items: center; gap: 5pt; font-size: 9.5pt; color: ${INK2}; margin-top: 6pt; }
    .recline svg { flex-shrink: 0; }
    .quote { display: flex; gap: 7pt; font-family: var(--serif); font-style: italic; font-size: 10.5pt; line-height: 1.4; color: ${NAVY}; border-left: 2pt solid ${CORAL}88; padding-left: 9pt; margin-top: 7pt; }
    .quote svg { flex-shrink: 0; margin-top: 2pt; }

    /* Empty days */
    .empty-wrap { margin-top: 18pt; break-inside: avoid; page-break-inside: avoid; }
    .empty-eyebrow { font-size: 9pt; font-weight: 800; letter-spacing: 2.5pt; color: ${INK3}; margin-bottom: 7pt; }
    .empty-card { background: rgba(255,255,255,0.7); border: 1pt solid ${LINE}; border-radius: 14pt; padding: 4pt 14pt; }
    .empty-row { display: flex; align-items: center; justify-content: space-between; padding: 9pt 0; border-bottom: 1pt solid ${LINE}; }
    .empty-row:last-child { border-bottom: 0; }
    .empty-day { font-family: var(--serif); font-weight: 600; font-size: 12.5pt; color: ${NAVY}; }
    .empty-note { font-size: 9.5pt; color: ${INK3}; }

    /* Inspiration */
    .insp { margin-top: 18pt; break-inside: avoid; page-break-inside: avoid; }
    .insp-head { display: flex; align-items: baseline; gap: 8pt; margin-bottom: 8pt; }
    .insp-eyebrow { font-size: 9pt; font-weight: 800; letter-spacing: 2.5pt; color: ${CORAL}; }
    .insp-sub { font-size: 9.5pt; color: ${INK3}; }
    .insp-grid { display: flex; gap: 9pt; }
    .insp-card { flex: 1; height: 92pt; border-radius: 14pt; overflow: hidden; position: relative; box-shadow: 0 3pt 10pt rgba(20,33,61,0.10); }
    .insp-scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(20,33,61,0.8), rgba(20,33,61,0) 70%); }
    .insp-name { position: absolute; left: 9pt; right: 9pt; bottom: 8pt; font-family: var(--serif); font-weight: 600; font-size: 11.5pt; color: #fff; text-shadow: 0 1pt 8pt rgba(0,0,0,0.5); line-height: 1.05; }

    /* Closing — a proper navy "back cover" so the document ends deliberately. */
    .closing { margin-top: 26pt; break-inside: avoid; page-break-inside: avoid; }
    .closing-in { background: ${NAVY}; min-height: 200pt; padding: 34pt 30pt 44pt; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; }
    .closing-mark { margin-bottom: 12pt; }
    .closing-word { font-family: var(--serif); font-size: 15pt; color: #fff; letter-spacing: 0.3pt; margin-bottom: 14pt; }
    .closing-tag { font-family: var(--serif); font-style: italic; font-size: 16pt; color: #fff; }
    .closing-made { font-size: 8.5pt; font-weight: 800; letter-spacing: 3pt; color: rgba(255,255,255,0.65); margin-top: 10pt; }
    .seal { position: absolute; right: 28pt; bottom: 26pt; width: 36pt; height: 36pt; border-radius: 999pt; border: 1.5pt solid ${GOLD}; color: ${GOLD}; display: flex; align-items: center; justify-content: center; }
  </style></head><body>
    <div class="cover">
      ${heroPhoto}<div class="cover-scrim"></div>
      <div class="cover-top">
        <div class="cover-brand">${mark(24, 'cm')}<span class="cover-word">worldly</span></div>
        <span class="cover-tagchip">TRAVEL ITINERARY</span>
      </div>
      <div class="cover-cap">
        <div class="cover-eyebrow">${input.flag ? esc(input.flag) + '&nbsp;&nbsp;' : ''}${esc((input.destination || 'YOUR TRIP').toUpperCase())}</div>
        <div class="cover-rule"></div>
        <div class="cover-title" style="font-size:${titleSize}pt">${esc(input.title)}</div>
        ${input.dateLabel || input.dayCount ? `<div class="cover-dates">${esc(input.dateLabel || '')}${input.dateLabel && input.dayCount ? ' · ' : ''}${input.dayCount ? `${input.dayCount} day${input.dayCount === 1 ? '' : 's'}` : ''}</div>` : ''}
      </div>
      <div class="cover-wave">${wave(PAPER, 26)}</div>
    </div>

    <div class="wrap">
      ${overviewChips.length ? `<div class="overview">${overviewChips.map((c) => `<div class="ochip"><div class="oico">${icon(c.i, NAVY, 14)}</div><div><div class="olabel">${esc(c.l)}</div><div class="ovalue">${esc(c.v)}</div></div></div>`).join('')}</div>` : ''}
      ${input.crew?.length ? `<div class="crew">Travelling with ${esc(input.crew.join(', '))}</div>` : ''}
      ${body}
      ${inspirationBlock(assets, input.destination)}
    </div>

    <div class="closing">
      ${wave(NAVY, 22)}
      <div class="closing-in">
        <div class="closing-mark">${mark(32, 'cm2')}</div>
        <div class="closing-tag">Your world, beautifully organised.</div>
        <div class="closing-made">MADE WITH WORLDLY</div>
        <div class="seal">${icon('compass', GOLD, 17, 1.6)}</div>
      </div>
    </div>
  </body></html>`;
}

// ── Fonts (device only) ──────────────────────────────────────────────────────
/** Read the bundled brand TTFs and build an @font-face block (base64). Best
 *  effort — returns '' if anything fails, so the PDF falls back to Georgia/sys. */
async function loadFontCss(): Promise<string> {
  try {
    const { Asset } = await import('expo-asset');
    const FS = await import('expo-file-system/legacy');
    // These weights are already bundled (loaded by app/_layout via useFonts).
    const fonts: { fam: string; weight: number; style: string; mod: number }[] = [
      { fam: 'Fraunces', weight: 600, style: 'normal', mod: require('@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf') },
      { fam: 'Fraunces', weight: 600, style: 'italic', mod: require('@expo-google-fonts/fraunces/600SemiBold_Italic/Fraunces_600SemiBold_Italic.ttf') },
      { fam: 'PlusJakarta', weight: 500, style: 'normal', mod: require('@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf') },
      { fam: 'PlusJakarta', weight: 700, style: 'normal', mod: require('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf') },
      { fam: 'PlusJakarta', weight: 800, style: 'normal', mod: require('@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf') },
    ];
    const faces = await Promise.all(
      fonts.map(async (f) => {
        try {
          const asset = Asset.fromModule(f.mod);
          await asset.downloadAsync();
          const uri = asset.localUri || asset.uri;
          if (!uri) return '';
          const b64 = await FS.readAsStringAsync(uri, { encoding: 'base64' });
          return `@font-face{font-family:'${f.fam}';font-weight:${f.weight};font-style:${f.style};src:url(data:font/ttf;base64,${b64}) format('truetype');}`;
        } catch {
          return '';
        }
      }),
    );
    return faces.join('');
  } catch {
    return '';
  }
}

// ── Public API ───────────────────────────────────────────────────────────────
/** Render the itinerary to a designed PDF and hand it to the share sheet.
 *  Returns false when sharing isn't available on the device. */
export async function shareItineraryPdf(input: DocInput): Promise<boolean> {
  const Print = await import('expo-print');
  const Sharing = await import('expo-sharing');
  const fontCss = await loadFontCss();
  const assets = await gatherAssets(input, fontCss);
  // A4 in points (72dpi), passed explicitly so iOS doesn't fall back to Letter.
  const { uri } = await Print.printToFileAsync({ html: buildItineraryPdfHtml(input, assets), width: 595, height: 842 });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: `${input.title} — itinerary` });
  return true;
}
