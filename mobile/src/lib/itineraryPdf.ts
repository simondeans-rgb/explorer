// Export a trip itinerary as a designed, magazine-style A4 PDF via expo-print,
// then hand it to the native share sheet. This is the ONLY itinerary export —
// the old plain-text and Word/Docs paths were removed (they were unreliable).
//
// Print-renderer constraints (learned from the Almanac book, see almanacBook.ts):
// - Photos must be CSS background-images, NOT <img>: iOS's print renderer paints
//   <img> as black boxes.
// - Photos must be inlined as base64 data URIs — the renderer snapshots the page
//   without waiting for remote images to load.
// - printToFileAsync is given the A4 page size explicitly; the CSS @page size is
//   ignored and iOS otherwise paginates onto US Letter.
//
// Landmark imagery + blurbs are fetched from Wikipedia's REST summary API at
// export time (thumbnail + first sentence), so we ship no per-landmark assets.
// Everything degrades gracefully: no network → on-brand gradient tiles, no
// black boxes, the plan still exports.
import { destinationImage } from './destinationImage';
import { fetchWithTimeout } from './net';

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&#39;' : '&quot;',
  );

export interface DocItem {
  name: string;
  /** "London · Landmark · from Sam" — shown when there's no landmark blurb. */
  meta?: string;
  /** City for the location pin under the item name. */
  city?: string;
}
export interface DocSlot {
  label: string;
  items: DocItem[];
}
export interface DocDay {
  /** The number shown in the coloured badge, e.g. "1". */
  badge?: string;
  /** "Saturday 8 Aug". */
  label: string;
  note?: string;
  slots: DocSlot[];
}
export interface DocInput {
  title: string;
  /** "United Kingdom". */
  destination?: string;
  /** "8 Aug 2026 – 10 Aug 2026". */
  dateLabel?: string;
  /** ISO country code for the hero photo + gradient fallbacks. */
  heroCode?: string;
  /** Number of trip days, for the overview "duration". */
  dayCount?: number;
  /** Distinct cities in the plan, for the overview "places". */
  cityCount?: number;
  crew?: string[];
  days: DocDay[];
}

// ── Brand ────────────────────────────────────────────────────────────────────
const CORAL = '#FF6A55';
const TEAL = '#24D1C3';
const INDIGO = '#7A6CF0';
const AMBER = '#FFB84D';
const NAVY = '#14213D';
const INK2 = '#4A5169';
const INK3 = '#8A90A3';
const DAY_COLORS = [CORAL, TEAL, INDIGO, AMBER];

/** The Worldly globe mark as inline SVG (vector — always print-safe). */
function logo(px: number, id: string): string {
  return `<svg width="${px}" height="${px}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${id}" x1="8" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FF6B9A"/><stop offset="0.5" stop-color="#9B7CFF"/><stop offset="1" stop-color="#24D1C3"/>
    </linearGradient></defs>
    <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#${id})"/>
    <g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round">
      <circle cx="32" cy="32" r="15" opacity="0.95"/>
      <ellipse cx="32" cy="32" rx="6.4" ry="15" opacity="0.85"/>
      <line x1="17" y1="32" x2="47" y2="32" opacity="0.85"/>
      <path d="M20 24 Q32 30 44 24" opacity="0.7"/>
      <path d="M20 40 Q32 34 44 40" opacity="0.7"/>
    </g></svg>`;
}

const ICON: Record<string, string> = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
  pin: '<path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
};
function icon(name: string, color: string, px = 13): string {
  return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;
}

function hashOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 53 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
/** A deterministic on-brand gradient for a name, for photo-less tiles. */
function tileGradient(name: string): string {
  const stops = [
    [CORAL, INDIGO],
    [INDIGO, TEAL],
    [TEAL, AMBER],
    [AMBER, CORAL],
  ][hashOf(name) % 4];
  return `linear-gradient(135deg, ${stops[0]}, ${stops[1]})`;
}

// ── Assets (fetched before rendering) ────────────────────────────────────────
interface Assets {
  hero?: string; // base64 data URI
  /** name(lowercased) → { img?: dataURI, blurb? }. */
  landmarks: Map<string, { img?: string; blurb?: string }>;
}

/** Fetch an image and return it as a base64 data URI (null on any failure). */
async function toDataUri(url: string): Promise<string | null> {
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

// A few landmark names in the catalogue don't map 1:1 to a Wikipedia title.
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

/** First sentence of a Wikipedia extract, tidied and capped for a caption. */
function firstSentence(extract?: string): string | undefined {
  if (!extract) return undefined;
  const s = extract.replace(/\s+/g, ' ').trim();
  const cut = s.search(/\.(\s|$)/);
  let out = cut > 0 ? s.slice(0, cut + 1) : s;
  if (out.length > 132) out = out.slice(0, 129).replace(/[\s,;]+\S*$/, '') + '…';
  return out;
}

/** Wikipedia summary → { thumbnail data URI, one-line blurb }. */
async function fetchLandmark(name: string): Promise<{ img?: string; blurb?: string }> {
  const title = (TITLE_OVERRIDES[name] ?? name).trim();
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}?redirect=true`;
    const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } }, 8000);
    if (!res.ok) return {};
    const j = (await res.json()) as { extract?: string; thumbnail?: { source?: string } };
    const thumb = j.thumbnail?.source;
    const img = thumb ? (await toDataUri(thumb)) ?? undefined : undefined;
    return { img, blurb: firstSentence(j.extract) };
  } catch {
    return {};
  }
}

async function gatherAssets(input: DocInput): Promise<Assets> {
  // Hero: the destination country photo (base64).
  const heroUrl = input.heroCode ? destinationImage(input.heroCode).photo : undefined;
  const heroPromise = heroUrl ? toDataUri(heroUrl) : Promise.resolve(null);

  // Distinct item names across the whole plan (cap the number of lookups).
  const seen = new Set<string>();
  const names: string[] = [];
  for (const d of input.days) {
    for (const s of d.slots) {
      for (const it of s.items) {
        const key = it.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          names.push(it.name);
        }
      }
    }
  }
  const capped = names.slice(0, 16);
  const [hero, ...results] = await Promise.all([heroPromise, ...capped.map((n) => fetchLandmark(n))]);
  const landmarks = new Map<string, { img?: string; blurb?: string }>();
  capped.forEach((n, i) => landmarks.set(n.toLowerCase(), results[i] ?? {}));
  return { hero: hero ?? undefined, landmarks };
}

// ── HTML ─────────────────────────────────────────────────────────────────────
function overviewCell(iconName: string, label: string, value: string): string {
  return `<div class="ovcell">
    <div class="ovico">${icon(iconName, INDIGO, 14)}</div>
    <div><div class="ovlabel">${esc(label)}</div><div class="ovvalue">${esc(value)}</div></div>
  </div>`;
}

function itemRow(it: DocItem, asset: { img?: string; blurb?: string } | undefined): string {
  const thumb = asset?.img
    ? `background-image:url('${asset.img}')`
    : `background-image:${tileGradient(it.name)}`;
  const desc = asset?.blurb || it.meta || '';
  const city = it.city
    ? `<div class="itcity">${icon('pin', INDIGO, 10)} ${esc(it.city)}</div>`
    : '';
  return `<div class="item">
    <div class="thumb" style="${thumb}"></div>
    <div class="itbody">
      <div class="itname">${esc(it.name)}</div>
      ${city}
      ${desc ? `<div class="itdesc">${esc(desc)}</div>` : ''}
    </div>
  </div>`;
}

function dayBlock(d: DocDay, idx: number, assets: Assets): string {
  const color = DAY_COLORS[idx % DAY_COLORS.length];
  const filled = d.slots.filter((s) => s.items.length);
  const note = d.note ? `<p class="daynote">${esc(d.note)}</p>` : '';
  const body = filled.length
    ? filled
        .map(
          (s) => `<div class="slot"><div class="slotlabel" style="color:${color}">${esc(s.label).toUpperCase()}</div>
          ${s.items.map((it) => itemRow(it, assets.landmarks.get(it.name.toLowerCase()))).join('')}</div>`,
        )
        .join('')
    : `<div class="empty">Nothing planned yet.</div>`;
  return `<section class="day">
    <div class="dayhead">
      <div class="daybadge" style="background:${color}">${esc(d.badge ?? String(idx + 1))}</div>
      <h2>${esc(d.label)}</h2>
    </div>
    ${note}${body}
  </section>`;
}

export function buildItineraryPdfHtml(input: DocInput, assets: Assets): string {
  const heroFill = assets.hero
    ? `background-image:url('${assets.hero}')`
    : `background-image:${tileGradient(input.title)}`;
  const crew = input.crew?.length
    ? `<div class="crew">Travelling with ${esc(input.crew.join(', '))}</div>`
    : '';
  const overview = `<div class="overview">
    ${overviewCell('globe', 'Destination', input.destination || '—')}
    ${input.dateLabel ? overviewCell('calendar', 'Dates', input.dateLabel) : ''}
    ${input.dayCount ? overviewCell('map', 'Duration', `${input.dayCount} day${input.dayCount === 1 ? '' : 's'}`) : ''}
    ${input.cityCount ? overviewCell('pin', 'Places', `${input.cityCount} ${input.cityCount === 1 ? 'city' : 'cities'}`) : ''}
  </div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: ${INK2}; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .serif { font-family: Georgia, 'Times New Roman', serif; }
    .page { padding: 30pt 34pt 0; }

    /* Header */
    .header { position: relative; background: linear-gradient(135deg,#FFF1ED 0%, #F2EEFF 100%); border-radius: 22pt; padding: 20pt 22pt; overflow: hidden; }
    .brandrow { display: flex; align-items: center; gap: 8pt; margin-bottom: 12pt; }
    .wordmark { font-family: Georgia, serif; font-weight: 700; font-size: 18pt; color: ${NAVY}; letter-spacing: 0.2pt; }
    .htitle { font-family: Georgia, serif; font-weight: 600; font-size: 32pt; line-height: 1.02; color: ${NAVY}; margin: 0; max-width: 64%; }
    .hdest { display: inline-flex; align-items: center; gap: 5pt; color: ${INDIGO}; font-weight: 700; font-size: 12pt; margin-top: 8pt; }
    .datepill { display: inline-flex; align-items: center; gap: 6pt; background: #fff; border-radius: 999pt; padding: 6pt 12pt; margin-top: 10pt; font-size: 10.5pt; font-weight: 600; color: ${INK2}; box-shadow: 0 2pt 8pt rgba(20,33,61,0.08); }
    .crew { font-style: italic; color: ${INK3}; font-size: 10pt; margin-top: 8pt; }
    .hero { position: absolute; top: 16pt; right: 16pt; width: 190pt; height: 150pt; border-radius: 42% 42% 44% 44% / 46% 46% 40% 40%; background-size: cover; background-position: center; box-shadow: 0 8pt 22pt rgba(20,33,61,0.18); }
    .blob1 { position: absolute; top: 8pt; right: 176pt; width: 46pt; height: 46pt; border-radius: 50%; background: ${TEAL}; opacity: 0.5; }
    .blob2 { position: absolute; top: 96pt; right: 186pt; width: 34pt; height: 34pt; border-radius: 50%; background: ${CORAL}; opacity: 0.55; }

    /* Overview */
    .overview { display: flex; flex-wrap: wrap; gap: 10pt; background: #fff; border: 1pt solid #EDEBF5; border-radius: 18pt; padding: 14pt 16pt; margin-top: 14pt; box-shadow: 0 3pt 10pt rgba(20,33,61,0.05); }
    .ovcell { display: flex; align-items: center; gap: 8pt; width: 46%; }
    .ovico { width: 26pt; height: 26pt; border-radius: 8pt; background: rgba(122,108,240,0.10); display: flex; align-items: center; justify-content: center; }
    .ovlabel { font-size: 7.5pt; font-weight: 800; letter-spacing: 1pt; color: ${INK3}; text-transform: uppercase; }
    .ovvalue { font-size: 11pt; font-weight: 700; color: ${NAVY}; margin-top: 1pt; }

    /* Days */
    .day { margin-top: 20pt; page-break-inside: avoid; }
    .dayhead { display: flex; align-items: center; gap: 10pt; margin-bottom: 6pt; }
    .daybadge { width: 24pt; height: 24pt; border-radius: 7pt; color: #fff; font-weight: 800; font-size: 12pt; display: flex; align-items: center; justify-content: center; }
    .day h2 { font-family: Georgia, serif; font-weight: 600; font-size: 16pt; color: ${NAVY}; margin: 0; }
    .daynote { font-style: italic; color: ${INK3}; font-size: 10pt; margin: 2pt 0 4pt 34pt; }
    .slot { margin: 8pt 0 0 34pt; }
    .slotlabel { font-size: 8pt; font-weight: 800; letter-spacing: 1.4pt; margin-bottom: 6pt; }
    .item { display: flex; gap: 12pt; padding: 8pt 0; page-break-inside: avoid; border-bottom: 0.75pt solid #F0EEF6; }
    .item:last-child { border-bottom: 0; }
    .thumb { width: 66pt; height: 66pt; border-radius: 14pt; background-size: cover; background-position: center; flex-shrink: 0; box-shadow: 0 2pt 8pt rgba(20,33,61,0.10); }
    .itbody { flex: 1; padding-top: 1pt; }
    .itname { font-family: Georgia, serif; font-weight: 600; font-size: 13.5pt; color: ${NAVY}; }
    .itcity { display: inline-flex; align-items: center; gap: 4pt; color: ${INDIGO}; font-weight: 700; font-size: 9.5pt; margin: 2pt 0; }
    .itdesc { color: ${INK2}; font-size: 10pt; line-height: 1.45; margin-top: 1pt; }
    .empty { margin: 6pt 0 0 34pt; background: #F5F4FA; color: ${INK3}; border-radius: 12pt; padding: 12pt 14pt; font-size: 10.5pt; }

    /* Footer */
    .footwave { height: 26pt; margin-top: 26pt; background: linear-gradient(90deg, ${CORAL}, ${TEAL} 55%, ${INDIGO}); border-top-left-radius: 40pt 22pt; border-top-right-radius: 40pt 22pt; }
    .footer { display: flex; align-items: center; justify-content: space-between; padding: 12pt 4pt 22pt; }
    .foottag { color: ${CORAL}; font-weight: 700; font-size: 10pt; }
    .footbrand { display: flex; align-items: center; gap: 7pt; color: ${INDIGO}; font-weight: 800; letter-spacing: 1.2pt; font-size: 9.5pt; }
  </style></head><body>
    <div class="page">
      <div class="header">
        <div class="blob1"></div><div class="blob2"></div>
        <div class="hero" style="${heroFill}"></div>
        <div class="brandrow">${logo(26, 'lg1')}<span class="wordmark">Worldly</span></div>
        <h1 class="htitle">${esc(input.title)}</h1>
        ${input.destination ? `<div class="hdest">${icon('pin', INDIGO, 13)} ${esc(input.destination)}</div>` : ''}
        ${input.dateLabel ? `<div><span class="datepill">${icon('calendar', INK2, 12)} ${esc(input.dateLabel)}</span></div>` : ''}
        ${crew}
      </div>
      ${overview}
      ${input.days.map((d, i) => dayBlock(d, i, assets)).join('')}
      <div class="footwave"></div>
      <div class="footer">
        <span class="foottag">Your world, beautifully organised.</span>
        <span class="footbrand">MADE WITH WORLDLY ${logo(20, 'lg2')}</span>
      </div>
    </div>
  </body></html>`;
}

/** Render the itinerary to a designed PDF and hand it to the share sheet.
 *  Returns false when sharing isn't available on the device. */
export async function shareItineraryPdf(input: DocInput): Promise<boolean> {
  const Print = await import('expo-print');
  const Sharing = await import('expo-sharing');
  const assets = await gatherAssets(input);
  // A4 in points (72dpi) — passed explicitly so iOS doesn't fall back to Letter.
  const { uri } = await Print.printToFileAsync({ html: buildItineraryPdfHtml(input, assets), width: 595, height: 842 });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: `${input.title} — itinerary` });
  return true;
}
