// Export a trip itinerary as an art-directed, keepsake-quality A4 PDF via
// expo-print, then hand it to the native share sheet. This is the ONLY itinerary
// export. The layout follows the "Feature Spread" design handoff: a cover banner
// (not a full cover page), an editorial masthead + meta strip, day blocks with
// time-of-day bands and alternating photo/text stops, an "open days" +
// inspiration block, a navy closing band with the App Store QR, and a running
// footer that repeats on every page.
//
// Built from the real Worldly design system (src/lib/theme.ts): coral →
// lavender → aqua palette, Fraunces display + Plus Jakarta UI (embedded as
// @font-face), the HeroWave "W-scallop" edge, category/verdict colours, and the
// bundled brand lockups.
//
// Print-renderer constraints (from the Almanac book, almanacBook.ts):
// - Photos + logos are CSS background-images with base64 data URIs, never <img>
//   (iOS prints <img> as black boxes) and inlined (the renderer snapshots before
//   remote images load).
// - The A4 page size is passed to printToFileAsync explicitly (CSS @page is
//   ignored; iOS otherwise falls back to US Letter).
// Everything degrades gracefully: no photos → the on-brand gradient panel; no
// embedded fonts → Georgia / system; no brand PNGs → inline SVG marks.
import { destinationImage } from './destinationImage';
import { fetchWithTimeout } from './net';
import { landmarkBlurb } from '../data/landmarkBlurbs';

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&#39;' : '&quot;',
  );

// ── Types (unchanged data model) ─────────────────────────────────────────────
export type ItinCategory = 'food' | 'accommodation' | 'culture' | 'experience' | 'nature';
export type ItinVerdict = 'recommend' | 'hidden-gem' | 'worth-visiting' | 'overrated' | 'avoid';

export interface DocItem {
  name: string;
  city?: string;
  category?: ItinCategory;
  categoryLabel?: string;
  fromFriend?: string;
  verdict?: ItinVerdict;
  note?: string;
  photo?: string;
  meta?: string;
}
export interface DocSlot {
  label: string;
  items: DocItem[];
}
export interface DocDay {
  badge?: string;
  label: string;
  subtitle?: string;
  note?: string;
  slots: DocSlot[];
}
export interface DocInput {
  title: string;
  destination?: string;
  flag?: string;
  dateLabel?: string;
  heroCode?: string;
  dayCount?: number;
  cityCount?: number;
  crew?: string[];
  userHeroUrl?: string;
  inspiration?: string[];
  days: DocDay[];
}

// ── Brand tokens (src/lib/theme.ts) ──────────────────────────────────────────
const CORAL = '#FF6B9A';
const LAV = '#9B7CFF';
const AQUA = '#24D1C3';
const SUNBURST = '#FFB84D';
const SKY = '#4DA6FF';
const NAVY = '#14213D';
const INK2 = '#48506B';
const INK3 = '#5E6377';
const PAPER = '#FAFAFC';
const LINE = '#EDEEF4';
const AMBER = '#E09A2B'; // day-time band accent
const DAY_ACCENTS = [CORAL, LAV, AQUA, SUNBURST, SKY];
const APP_STORE_URL = 'https://apps.apple.com/gb/app/worldly-explorer/id6782019443';

const CATEGORY = {
  food: { color: SUNBURST, label: 'Food & Drink' },
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
const BANNER_SCRIM = 'linear-gradient(to bottom, rgba(20,33,61,0.5) 0%, rgba(20,33,61,0.05) 45%, rgba(20,33,61,0.18) 100%)';

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
    [AQUA, SUNBURST],
    [SUNBURST, CORAL],
    [SKY, LAV],
  ][hashOf(name) % 5];
  return `linear-gradient(135deg, ${s[0]}, ${s[1]})`;
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const spell = (n: number) => WORDS[n] ?? String(n);
const spellUpper = (n: number) => spell(n).toUpperCase();

// ── SVG glyphs ───────────────────────────────────────────────────────────────
function pin(px: number, color: string): string {
  return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M12 22s7-6.6 7-12A7 7 0 1 0 5 10c0 5.4 7 12 7 12Z"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>`;
}
function sunGlyph(px: number, color: string): string {
  return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg" style="display:block"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/></svg>`;
}
function moonGlyph(px: number, color: string): string {
  return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>`;
}
/** Fallback Worldly globe mark (coral→lavender→aqua) when the PNG is missing. */
function svgMark(px: number, id: string): string {
  return `<svg width="${px}" height="${px}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="display:block"><defs><linearGradient id="${id}" x1="8" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${CORAL}"/><stop offset="0.5" stop-color="${LAV}"/><stop offset="1" stop-color="${AQUA}"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="16" fill="url(#${id})"/><g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle cx="32" cy="32" r="15" opacity="0.95"/><ellipse cx="32" cy="32" rx="6.4" ry="15" opacity="0.85"/><line x1="17" y1="32" x2="47" y2="32" opacity="0.85"/><path d="M20 24 Q32 30 44 24" opacity="0.7"/><path d="M20 40 Q32 34 44 40" opacity="0.7"/></g></svg>`;
}

const WAVE_CURVE =
  'M0,93 C12.2,91.3 62.5,77.9 86,81 C109.5,84.1 148.6,113 166,115 C183.4,117 197.7,95 209,95 C220.3,95 229.4,117 246,115 C262.6,113 291.1,85.1 326,81 C360.9,76.9 447.5,86.4 492,86 C536.5,85.6 591.1,82.4 640,78 C688.9,73.6 781.2,62.4 837,55 C892.8,47.6 976.9,33.1 1034,26 C1091.1,18.9 1191,7.8 1240,5 C1289,2.2 1351.7,5.2 1380,6 C1408.3,6.8 1431.5,10.3 1440,11';
function wave(color: string, h: number): string {
  return `<svg width="100%" height="${h}pt" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="${WAVE_CURVE} L1440,121 L0,121 Z" fill="${color}"/></svg>`;
}

// ── Assets ───────────────────────────────────────────────────────────────────
export interface ItemAsset {
  img?: string;
  blurb?: string;
}
export interface Assets {
  hero?: string;
  fontCss?: string;
  /** Base64 data URIs for the bundled brand lockups (device only). */
  logo?: string;
  mark?: string;
  qr?: string;
  items: Map<string, ItemAsset>;
  inspiration: Map<string, string>;
}

/** Fetch a remote image and return it as a base64 data URI (null on any
 *  failure). Uses expo-file-system's downloadAsync + base64 read rather than
 *  fetch()+Blob()+FileReader.readAsDataURL — the latter is unreliable in React
 *  Native (the blob's bytes frequently don't survive, yielding empty base64),
 *  which left every landmark/hero photo blank in the exported PDF. */
async function toDataUri(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const FS = await import('expo-file-system/legacy');
    const dir = FS.cacheDirectory;
    if (!dir) return null;
    const target = `${dir}itin-img-${(hashOf(url) >>> 0).toString(36)}-${url.length}.bin`;
    // downloadAsync has no timeout of its own; cap it so a stalled image can't
    // hang the whole export (the dangling download, if any, is harmless).
    const res = await Promise.race([
      FS.downloadAsync(url, target),
      new Promise<null>((r) => setTimeout(() => r(null), 12000)),
    ]);
    if (!res || (typeof res.status === 'number' && res.status >= 400)) return null;
    const b64 = await FS.readAsStringAsync(res.uri, { encoding: 'base64' });
    FS.deleteAsync(res.uri, { idempotent: true }).catch(() => {});
    if (!b64) return null;
    const ct = String(res.headers?.['content-type'] ?? res.headers?.['Content-Type'] ?? '').toLowerCase();
    const mime = ct.includes('png') ? 'image/png' : ct.includes('webp') ? 'image/webp' : 'image/jpeg';
    return `data:${mime};base64,${b64}`;
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
const widen = (url: string, w: number) => url.replace(/\/\d+px-/, `/${w}px-`);

function firstSentence(extract?: string): string | undefined {
  if (!extract) return undefined;
  let s = extract.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const cut = s.search(/\.(\s|$)/);
  if (cut > 0) s = s.slice(0, cut + 1);
  if (s.length > 150) s = s.slice(0, 147).replace(/[\s,;]+\S*$/, '') + '…';
  return s;
}

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
export async function gatherAssets(input: DocInput, fontCss?: string, brand?: { logo?: string; mark?: string; qr?: string }): Promise<Assets> {
  const heroP = toDataUri(input.userHeroUrl || (input.heroCode ? destinationImage(input.heroCode).photo ?? '' : ''));

  // Distinct items, in order; the first stop of each day gets a larger crop.
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
      const width = leadNames.has(it.name.toLowerCase()) ? 1100 : 720;
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
  return { hero: hero ?? undefined, fontCss, logo: brand?.logo, mark: brand?.mark, qr: brand?.qr, items, inspiration };
}

// ── Render helpers ───────────────────────────────────────────────────────────
/** A full-cover photo layer or the deterministic on-brand gradient panel. */
function photoBg(src: string | undefined, seed: string): string {
  return src ? `background-image:url('${src}');background-size:cover;background-position:center;${VIVID}` : `background-image:${panelGradient(seed)}`;
}
/** The full-colour Worldly wordmark in a white pill (PNG data URI, or SVG mark). */
function logoPill(assets: Assets, padding: string): string {
  const inner = assets.logo
    ? `<div style="height:16.5pt;width:68.4pt;background-image:url('${assets.logo}');background-size:contain;background-repeat:no-repeat;background-position:center"></div>`
    : `<div style="display:flex;align-items:center;gap:5pt">${svgMark(16.5, 'lp')}<span style="font-family:var(--serif);font-size:14pt;color:${NAVY}">worldly</span></div>`;
  return `<div style="background:#fff;border-radius:999pt;padding:${padding};display:flex;align-items:center;box-shadow:0 3pt 10pt rgba(20,33,61,0.22)">${inner}</div>`;
}

const timeMeta = (label: string): { accent: string; glyph: (px: number, c: string) => string } => {
  const l = label.toLowerCase();
  return /even|dinner|night|supper/.test(l) ? { accent: LAV, glyph: moonGlyph } : { accent: AMBER, glyph: sunGlyph };
};

function catChip(it: DocItem): string {
  if (!it.category) return '';
  const c = CATEGORY[it.category];
  const label = it.categoryLabel || c.label;
  return `<span class="pchip" style="color:${c.color};background:${c.color}1F">${esc(label)}</span>`;
}
function verdictChip(v?: ItinVerdict): string {
  if (!v) return '';
  const m = VERDICT[v];
  return `<span class="pchip" style="color:${m.color};background:${m.color}1F">${esc(m.label)}</span>`;
}
function recPanel(it: DocItem): string {
  if (!it.fromFriend || !it.note) return '';
  return `<div class="rec"><div class="rec-bar"></div><div><p class="rec-quote">“${esc(it.note)}”</p><p class="rec-by">Recommended by ${esc(it.fromFriend)}</p></div></div>`;
}

/** One stop: alternating photo/text spread. */
function stopRow(it: DocItem, dayIndex: number, accent: string, asset: ItemAsset | undefined, isFirstOfDay: boolean, isLastOfDay: boolean): string {
  const num = String(dayIndex + 1).padStart(2, '0');
  const photoRight = dayIndex % 2 === 1;
  const h = isFirstOfDay ? 154.5 : 139.5;
  const blurb = asset?.blurb || it.meta || '';
  const photo = `<div class="stop-ph" style="height:${h}pt;${photoRight ? 'order:2;' : ''}${photoBg(asset?.img, it.name)}"></div>`;
  const body = `<div class="stop-body"${photoRight ? ' style="order:1"' : ''}>
    <div class="stop-title"><span class="stop-num" style="color:${accent}">${num}</span><h3 class="stop-name">${esc(it.name)}</h3></div>
    <div class="stop-meta">${it.city ? `<span class="stop-city">${pin(8, CORAL)}${esc(it.city)}</span>` : ''}${catChip(it)}${verdictChip(it.verdict)}</div>
    ${blurb ? `<p class="stop-blurb">${esc(blurb)}</p>` : ''}
    ${recPanel(it)}
  </div>`;
  return `<div class="stop"${isLastOfDay ? ' style="border-bottom:0"' : ''}>${photo}${body}</div>`;
}

function timeBand(label: string, count: number): string {
  const { accent, glyph } = timeMeta(label);
  const hint = `${spell(count)} stop${count === 1 ? '' : 's'}`;
  return `<div class="timeband">
    <div class="time-pill" style="background:${accent}1F"><span style="line-height:0">${glyph(10.5, accent)}</span><span class="time-l" style="color:${accent}">${esc(label).toUpperCase()}</span></div>
    <span class="time-hint">${esc(hint)}</span>
    <div class="time-rule" style="background:${accent}33"></div>
  </div>`;
}

function dayBlock(d: DocDay, idx: number, assets: Assets): string {
  const accent = DAY_ACCENTS[idx % DAY_ACCENTS.length];
  const filled = d.slots.filter((s) => s.items.length);
  const total = filled.reduce((n, s) => n + s.items.length, 0);
  let dayIndex = 0;
  const slotsHtml = filled
    .map((s) => {
      const band = timeBand(s.label, s.items.length);
      const stops = s.items
        .map((it) => {
          const i = dayIndex++;
          return stopRow(it, i, accent, assets.items.get(it.name.toLowerCase()), i === 0, i === total - 1);
        })
        .join('');
      return `${band}<div class="stops">${stops}</div>`;
    })
    .join('');
  const pill = d.badge && /^\d+$/.test(d.badge) ? `DAY ${spellUpper(Number(d.badge))}` : `DAY ${esc(d.badge ?? String(idx + 1))}`;
  return `<section class="day">
    <div class="day-head">
      <span class="day-pill" style="background:${accent}">${pill}</span>
      <h2 class="day-h2">${esc(d.label)}</h2>
      <div class="hrule"></div>
      ${d.subtitle ? `<span class="day-sub">${esc(d.subtitle)}</span>` : ''}
    </div>
    ${d.note ? `<p class="day-note">${esc(d.note)}</p>` : ''}
    ${slotsHtml}
  </section>`;
}

function inspirationPanel(assets: Assets, destination?: string): string {
  if (!assets.inspiration.size) return '';
  const cards = [...assets.inspiration.entries()]
    .map(
      ([name, img]) => `<div class="insp-item"><div class="insp-thumb" style="${photoBg(img, name)}"></div><div><p class="insp-name">${esc(name)}</p></div></div>`,
    )
    .join('');
  return `<div class="insp">
    <div class="insp-head"><span class="insp-eye">NEED SOME INSPIRATION?</span><span class="insp-sub">Worldly favourites${destination ? ` in ${esc(destination)}` : ' nearby'}</span></div>
    <div class="insp-grid">${cards}</div>
  </div>`;
}

/** The "Still yours to fill" block for a run of consecutive empty days. */
function openDaysBlock(days: { label: string; note?: string }[], startBadge: number, assets: Assets, destination?: string): string {
  const first = startBadge;
  const last = startBadge + days.length - 1;
  const pill =
    days.length === 1
      ? `DAY ${spellUpper(first)}`
      : days.length === 2
        ? `DAYS ${spellUpper(first)} & ${spellUpper(last)}`
        : `DAYS ${spellUpper(first)}–${spellUpper(last)}`;
  const cols = days
    .map((d) => `<div class="openday"><p class="openday-d">${esc(d.label)}</p><p class="openday-s">${esc(d.note || 'Open — nothing planned yet')}</p></div>`)
    .join('');
  return `<section class="openday-sec">
    <div class="day-head">
      <span class="day-pill" style="background:${LAV}">${pill}</span>
      <h2 class="day-h2">Still yours to fill</h2>
      <div class="hrule"></div>
    </div>
    <div class="opendays">${cols}</div>
    ${inspirationPanel(assets, destination)}
  </section>`;
}

// ── Document ─────────────────────────────────────────────────────────────────
export function buildItineraryPdfHtml(input: DocInput, assets: Assets): string {
  // Group days into runs so consecutive empty days collapse.
  type Block = { kind: 'day'; d: DocDay; idx: number } | { kind: 'empty'; startBadge: number; days: { label: string; note?: string }[] };
  const blocks: Block[] = [];
  input.days.forEach((d, idx) => {
    const hasContent = d.slots.some((s) => s.items.length) || d.note;
    if (hasContent) blocks.push({ kind: 'day', d, idx });
    else {
      const last = blocks[blocks.length - 1];
      if (last && last.kind === 'empty') last.days.push({ label: d.label });
      else blocks.push({ kind: 'empty', startBadge: idx + 1, days: [{ label: d.label }] });
    }
  });
  const lastEmptyAt = blocks.reduce((acc, b, i) => (b.kind === 'empty' ? i : acc), -1);

  // Cover title scales down for long trip names (README §2).
  const tlen = input.title.length;
  const titleSize = tlen > 46 ? 25 : tlen > 34 ? 29 : tlen > 22 ? 34 : 45.5;

  // Masthead figures.
  const allItems = input.days.flatMap((d) => d.slots.flatMap((s) => s.items));
  const totalStops = allItems.length;
  const openDays = input.days.filter((d) => !d.slots.some((s) => s.items.length) && !d.note).length;
  const cityCounts = new Map<string, number>();
  for (const it of allItems) if (it.city) cityCounts.set(it.city, (cityCounts.get(it.city) ?? 0) + 1);
  const baseCity = [...cityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || input.destination;

  const eyebrow = `${(input.destination || 'Your trip').toUpperCase()}${input.dayCount ? ` · ${input.dayCount} ${input.dayCount === 1 ? 'DAY' : 'DAYS'}` : ''}`;
  const crewList = input.crew?.length ? input.crew.join(' & ') : '';
  const standfirst = (() => {
    const parts: string[] = [];
    if (totalStops) parts.push(`${spell(totalStops).replace(/^\w/, (c) => c.toUpperCase())} stop${totalStops === 1 ? '' : 's'} to explore${baseCity ? ` around ${baseCity}` : ''}`);
    else parts.push(`A trip to ${input.destination || 'plan'}`);
    if (openDays) parts.push(`${spell(openDays)} open day${openDays === 1 ? '' : 's'} to wander`);
    let s = parts.join(', ') + '.';
    if (crewList) s += ` Planned with ${crewList}.`;
    return s;
  })();

  const metaItems = [
    input.dateLabel ? { l: 'WHEN', v: input.dateLabel } : null,
    baseCity ? { l: 'BASE', v: baseCity } : null,
    totalStops ? { l: 'STOPS', v: `${totalStops} saved place${totalStops === 1 ? '' : 's'}` } : null,
    crewList ? { l: 'TRAVELLING WITH', v: crewList } : null,
  ].filter(Boolean) as { l: string; v: string }[];

  const body = blocks
    .map((b, i) => {
      if (b.kind === 'day') return dayBlock(b.d, b.idx, assets);
      return openDaysBlock(b.days, b.startBadge, i === lastEmptyAt ? assets : { ...assets, inspiration: new Map() }, input.destination);
    })
    .join('');

  const footerMark = assets.mark
    ? `<div style="height:10.5pt;width:10.5pt;background-image:url('${assets.mark}');background-size:contain;background-repeat:no-repeat"></div>`
    : svgMark(10.5, 'fm');

  const qrHtml = assets.qr
    ? `<div class="qr"><div style="width:39pt;height:39pt;background-image:url('${assets.qr}');background-size:contain;background-repeat:no-repeat"></div></div>`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    ${assets.fontCss ?? ''}
    * { box-sizing: border-box; }
    :root { --serif: 'Fraunces', Georgia, 'Times New Roman', serif; --sans: 'PlusJakarta', -apple-system, 'Helvetica Neue', Arial, sans-serif; }
    html, body { margin: 0; padding: 0; }
    body { font-family: var(--sans); color: ${INK2}; background: #FFFFFF; padding-bottom: 34pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    /* Running footer — repeats on every printed page. */
    .run-foot { position: fixed; left: 0; right: 0; bottom: 0; background: #fff; border-top: 1px solid ${LINE}; padding: 8pt 30pt; display: flex; align-items: center; justify-content: space-between; }
    .foot-title { font-family: var(--sans); font-size: 9pt; font-weight: 700; letter-spacing: 0.04em; color: ${INK3}; }
    .foot-right { display: flex; align-items: center; gap: 8pt; }
    .foot-made { font-family: var(--sans); font-size: 7.5pt; font-weight: 800; letter-spacing: 0.24em; color: ${INK3}; }

    /* Banner */
    .banner { position: relative; height: 189pt; overflow: hidden; }
    .banner-ph { position: absolute; inset: 0; background-size: cover; background-position: center; }
    .banner-scrim { position: absolute; inset: 0; background: ${BANNER_SCRIM}; }
    .banner-top { position: absolute; top: 16.5pt; left: 30pt; right: 30pt; display: flex; align-items: center; justify-content: space-between; }
    .itin-pill { font-family: var(--sans); font-size: 7.5pt; font-weight: 800; letter-spacing: 0.26em; color: #fff; background: rgba(20,33,61,0.32); padding: 5pt 9pt; border-radius: 999pt; }
    .banner-wave { position: absolute; left: 0; right: 0; bottom: -1pt; line-height: 0; }

    /* Content column */
    .wrap { padding: 0 30pt; }

    /* Masthead */
    .masthead { padding: 20pt 0 15pt; border-bottom: 1.5pt solid ${NAVY}; break-inside: avoid; }
    .eyebrow { font-family: var(--sans); font-size: 9pt; font-weight: 800; letter-spacing: 0.32em; color: ${CORAL}; margin: 0; }
    .h1 { font-family: var(--serif); font-weight: 600; line-height: 0.98; letter-spacing: -0.01em; color: ${NAVY}; max-width: 80%; margin: 7.5pt 0 0; text-wrap: balance; }
    .standfirst { font-family: var(--serif); font-style: italic; font-weight: 600; font-size: 12.5pt; line-height: 1.5; color: ${INK2}; max-width: 74%; margin: 10.5pt 0 0; }

    /* Meta strip */
    .meta { display: flex; flex-wrap: wrap; gap: 19.5pt; padding-top: 10.5pt; break-inside: avoid; }
    .meta-l { font-family: var(--sans); font-size: 5.5pt; font-weight: 800; letter-spacing: 0.2em; color: ${INK3}; margin: 0; }
    .meta-v { font-family: var(--sans); font-size: 8.5pt; font-weight: 700; color: ${NAVY}; margin: 3pt 0 0; }
    .meta-div { width: 1px; background: ${LINE}; align-self: stretch; }

    /* Day block */
    .day { margin-top: 22.5pt; }
    .openday-sec { margin-top: 25.5pt; break-inside: avoid; }
    .day-head { display: flex; align-items: center; gap: 9pt; break-after: avoid-page; page-break-after: avoid; }
    .day-pill { font-family: var(--sans); font-size: 6.5pt; font-weight: 800; letter-spacing: 0.28em; color: #fff; border-radius: 999pt; padding: 4.5pt 9pt; white-space: nowrap; }
    .day-h2 { font-family: var(--serif); font-weight: 600; font-size: 17pt; line-height: 1.05; color: ${NAVY}; margin: 0; white-space: nowrap; }
    .hrule { flex: 1; height: 1px; background: ${LINE}; }
    .day-sub { font-family: var(--sans); font-size: 7pt; font-weight: 700; letter-spacing: 0.14em; color: ${INK3}; text-transform: uppercase; white-space: nowrap; }
    .day-note { font-family: var(--serif); font-style: italic; font-size: 8.5pt; line-height: 1.45; color: ${INK2}; max-width: 78%; margin: 9pt 0 0; }

    /* Time-of-day band */
    .timeband { display: flex; align-items: center; gap: 9pt; margin: 19.5pt 0 12pt; break-after: avoid-page; page-break-after: avoid; }
    .time-pill { display: flex; align-items: center; gap: 9pt; border-radius: 999pt; padding: 5pt 11pt 5pt 9pt; }
    .time-l { font-family: var(--sans); font-size: 7pt; font-weight: 800; letter-spacing: 0.24em; }
    .time-hint { font-family: var(--serif); font-style: italic; font-size: 8.5pt; color: ${INK3}; }
    .time-rule { flex: 1; height: 1.5pt; }

    /* Stops */
    .stops { }
    .stop { display: flex; gap: 15pt; align-items: flex-start; padding: 15pt 0; border-bottom: 1px solid ${LINE}; break-inside: avoid; page-break-inside: avoid; }
    .stop-ph { flex: 0 0 201pt; border-radius: 3pt; overflow: hidden; position: relative; }
    .stop-body { flex: 1; min-width: 0; }
    .stop-title { display: flex; align-items: baseline; gap: 7.5pt; }
    .stop-num { font-family: var(--serif); font-weight: 600; font-size: 11pt; }
    .stop-name { font-family: var(--serif); font-weight: 600; font-size: 15pt; line-height: 1.08; color: ${NAVY}; margin: 0; }
    .stop-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 7pt; margin-top: 5pt; }
    .stop-city { display: inline-flex; align-items: center; gap: 5pt; font-family: var(--sans); font-size: 9.5pt; font-weight: 700; color: ${INK2}; }
    .pchip { font-family: var(--sans); font-size: 6.5pt; font-weight: 700; border-radius: 999pt; padding: 2pt 6pt; }
    .stop-blurb { font-family: var(--sans); font-size: 8.5pt; line-height: 1.55; color: ${INK2}; margin: 7pt 0 0; text-wrap: pretty; }
    .rec { display: flex; gap: 9pt; margin-top: 9pt; background: rgba(255,107,154,0.07); border-radius: 7.5pt; padding: 7.5pt 9pt; }
    .rec-bar { width: 2pt; border-radius: 2pt; background: ${CORAL}; flex: 0 0 2pt; }
    .rec-quote { font-family: var(--serif); font-style: italic; font-size: 8.5pt; line-height: 1.4; color: ${NAVY}; margin: 0; }
    .rec-by { font-family: var(--sans); font-size: 7pt; font-weight: 700; color: ${CORAL}; margin: 5pt 0 0; }

    /* Open days */
    .opendays { display: flex; gap: 18pt; margin-top: 10.5pt; }
    .openday { flex: 1; padding: 10.5pt 0; border-top: 1px solid ${LINE}; }
    .openday-d { font-family: var(--serif); font-weight: 600; font-size: 11pt; color: ${NAVY}; margin: 0; }
    .openday-s { font-family: var(--sans); font-size: 7.5pt; color: ${INK3}; margin: 5pt 0 0; }

    /* Inspiration */
    .insp { margin-top: 15pt; background: ${PAPER}; border-radius: 12pt; padding: 15pt 16.5pt; }
    .insp-head { display: flex; align-items: baseline; gap: 9pt; }
    .insp-eye { font-family: var(--sans); font-size: 6.5pt; font-weight: 800; letter-spacing: 0.26em; color: ${CORAL}; }
    .insp-sub { font-family: var(--sans); font-size: 7pt; color: ${INK3}; }
    .insp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10.5pt; margin-top: 10.5pt; }
    .insp-item { display: flex; gap: 8pt; align-items: center; }
    .insp-thumb { flex: 0 0 48pt; height: 48pt; border-radius: 7.5pt; overflow: hidden; }
    .insp-name { font-family: var(--serif); font-weight: 600; font-size: 12.5pt; color: ${NAVY}; margin: 0; }

    /* Closing */
    .closing { background: ${NAVY}; padding: 15pt 30pt; display: flex; align-items: center; justify-content: space-between; gap: 19.5pt; break-inside: avoid; page-break-inside: avoid; }
    .closing-right { display: flex; align-items: center; gap: 10.5pt; }
    .avail { font-family: var(--sans); font-size: 7.5pt; font-weight: 800; letter-spacing: 0.26em; color: rgba(255,255,255,0.6); margin: 0; text-align: right; }
    .appstore { font-family: var(--sans); font-size: 10.5pt; font-weight: 700; color: #fff; margin: 3pt 0 0; text-align: right; }
    .qr { background: #fff; border-radius: 6pt; padding: 4pt; line-height: 0; }
  </style></head><body>

    <div class="run-foot">
      <span class="foot-title">${esc(input.title)}</span>
      <div class="foot-right"><span class="foot-made">MADE WITH WORLDLY</span>${footerMark}</div>
    </div>

    <div class="banner">
      <div class="banner-ph" style="${photoBg(assets.hero, input.title)}"></div>
      <div class="banner-scrim"></div>
      <div class="banner-top">${logoPill(assets, '7pt 13pt')}<span class="itin-pill">TRAVEL ITINERARY</span></div>
      <div class="banner-wave">${wave('#FFFFFF', 26)}</div>
    </div>

    <div class="wrap">
      <div class="masthead">
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h1 class="h1" style="font-size:${titleSize}pt">${esc(input.title)}</h1>
        <p class="standfirst">${esc(standfirst)}</p>
      </div>
      ${metaItems.length ? `<div class="meta">${metaItems.map((m, i) => `${i ? '<div class="meta-div"></div>' : ''}<div><p class="meta-l">${esc(m.l)}</p><p class="meta-v">${esc(m.v)}</p></div>`).join('')}</div>` : ''}
      ${body}
    </div>

    <div class="closing">
      ${logoPill(assets, '7pt 13.5pt')}
      <div class="closing-right">
        <div><p class="avail">AVAILABLE ON THE</p><p class="appstore">App Store</p></div>
        ${qrHtml}
      </div>
    </div>
  </body></html>`;
}

// ── Fonts + brand assets (device only) ───────────────────────────────────────
/** Read the bundled brand TTFs and build an @font-face block (base64). Best
 *  effort — returns '' if anything fails, so the PDF falls back to Georgia/sys. */
async function loadFontCss(): Promise<string> {
  try {
    const { Asset } = await import('expo-asset');
    const FS = await import('expo-file-system/legacy');
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

/** Read the bundled brand PNGs (logo, mark, QR) as base64 data URIs. Best effort;
 *  missing assets fall back to inline SVG marks / an omitted QR. */
async function loadBrandAssets(): Promise<{ logo?: string; mark?: string; qr?: string }> {
  try {
    const { Asset } = await import('expo-asset');
    const FS = await import('expo-file-system/legacy');
    const mods: { key: 'logo' | 'mark' | 'qr'; mod: number }[] = [
      { key: 'logo', mod: require('../../assets/itinerary/worldly-logo.png') },
      { key: 'mark', mod: require('../../assets/itinerary/worldly-mark.png') },
      { key: 'qr', mod: require('../../assets/itinerary/appstore-qr.png') },
    ];
    const out: { logo?: string; mark?: string; qr?: string } = {};
    await Promise.all(
      mods.map(async (m) => {
        try {
          const asset = Asset.fromModule(m.mod);
          await asset.downloadAsync();
          const uri = asset.localUri || asset.uri;
          if (!uri) return;
          const b64 = await FS.readAsStringAsync(uri, { encoding: 'base64' });
          out[m.key] = `data:image/png;base64,${b64}`;
        } catch {
          /* fall back */
        }
      }),
    );
    return out;
  } catch {
    return {};
  }
}

// ── Public API ───────────────────────────────────────────────────────────────
/** Render the itinerary to a designed PDF and hand it to the share sheet.
 *  Returns false when sharing isn't available on the device. */
export async function shareItineraryPdf(input: DocInput): Promise<boolean> {
  const Print = await import('expo-print');
  const Sharing = await import('expo-sharing');
  const [fontCss, brand] = await Promise.all([loadFontCss(), loadBrandAssets()]);
  const assets = await gatherAssets(input, fontCss, brand);
  // A4 in points (72dpi), passed explicitly so iOS doesn't fall back to Letter.
  const { uri } = await Print.printToFileAsync({ html: buildItineraryPdfHtml(input, assets), width: 595, height: 842 });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: `${input.title} — itinerary` });
  return true;
}
