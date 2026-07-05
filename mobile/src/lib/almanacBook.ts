// The Almanac, published as a multi-page "photo book" PDF — a keepsake record of
// everywhere you've been, art-directed like the in-app Almanac: destination
// photography on the cover, a pictures spread, a deep-navy numbers page and a
// full chapter page per continent, with running footers and folio numbers like
// a printed book. Rendered via expo-print and handed to the native share sheet.
//
// Print-renderer constraints (learned from real device output):
// - Photos must be CSS background-images, NOT <img object-fit>: iOS's print
//   renderer paints such images as black boxes.
// - Photos must be inlined as base64 data URIs — the renderer snapshots the
//   page without waiting for remote images.
// - printToFileAsync must be given the page size explicitly; the CSS @page
//   size is ignored and iOS otherwise paginates onto US Letter, splitting
//   every page and leaving blank half-sheets.
import { flagEmoji } from './flags';
import { destinationImage, hasDestinationPhoto } from './destinationImage';

const PAGE_W = 720;
const PAGE_H = 1018;
const NAVY = '#0D1428';
const PAPER = '#FBF7F2';
const STAT_COLORS = ['#FF6B9A', '#24D1C3', '#9B7CFF', '#FFB84D', '#4DA6FF', '#F2557D'];

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;',
  );
}

export interface AlmanacBookInput {
  firstName: string;
  generatedOn: string;
  /** Cover photo country (the most deeply explored). */
  heroCode?: string;
  /** "Your world in pictures" spread, best-explored first. */
  photoStrip?: { code: string; name: string }[];
  figures: { label: string; value: number }[];
  continents: { name: string; coverCode?: string; countries: { code: string; name: string }[] }[];
  relationships: { label: string; count: number }[];
  categories: { label: string; count: number }[];
  recognitions: { symbol: string; title: string; description: string }[];
}

/** Fetch an image and return it as a data URI (null on any failure). */
async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
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

type PhotoMap = Map<string, string>;

/** Full-bleed photo layer (print-safe background-image), or brand gradient. */
function photoFill(src: string | undefined): string {
  return src
    ? `<div class="fill photo" style="background-image:url('${src}')"></div>`
    : `<div class="fill covergrad"></div>`;
}

interface BookPage {
  cls: 'light' | 'dark' | 'cover' | 'dark back' | 'light titlepage';
  body: string;
  /** Show the running footer + folio number. */
  folio?: boolean;
}

function coverPage(input: AlmanacBookInput, photos: PhotoMap, first: string): BookPage {
  const hero = input.heroCode ? photos.get(input.heroCode) : undefined;
  return {
    cls: 'cover',
    body: `${photoFill(hero)}<div class="fill coverscrim"></div>
    <div class="coverin">
      <div class="coverbrand">worldly</div>
      <div>
        <div class="eyebrow">A RECORD OF EVERYWHERE YOU&#8217;VE BEEN</div>
        <div class="eyeline"></div>
        <div class="covertitle">The<br>Almanac</div>
        <div class="covername">${esc(first.toUpperCase())}&#8217;S EDITION &nbsp;&middot;&nbsp; ${esc(input.generatedOn)}</div>
      </div>
    </div>`,
  };
}

function titlePage(input: AlmanacBookInput, first: string): BookPage {
  return {
    cls: 'light titlepage',
    body: `<div>
      <div class="tpbrand">worldly</div>
      <div class="eyeline center"></div>
      <div class="tptitle">The Almanac</div>
      <div class="tpsub">A record of everywhere you&#8217;ve been</div>
      <div class="tpedition">FIRST EDITION &nbsp;&middot;&nbsp; PRINTED ${esc(input.generatedOn.toUpperCase())}<br>FOR ${esc(first.toUpperCase())}</div>
    </div>`,
  };
}

function picturesPage(input: AlmanacBookInput, photos: PhotoMap): BookPage | null {
  // Lead + 4 grid cards is the most that fits a page without breaking.
  const cards = (input.photoStrip ?? [])
    .map(({ code, name }) => ({ name, code, src: photos.get(code) }))
    .filter((c): c is { name: string; code: string; src: string } => !!c.src)
    .slice(0, 5);
  if (!cards.length) return null;
  const [lead, ...rest] = cards;
  const card = (c: { name: string; code: string; src: string }, cls: string) =>
    `<div class="pcard ${cls}">${photoFill(c.src)}<div class="fill pscrim"></div>
      <div class="pcap">${flagEmoji(c.code)}<span>${esc(c.name)}</span></div></div>`;
  return {
    cls: 'light',
    folio: true,
    body: `<div class="eyebrow coral">CHAPTER ONE</div>
    <div class="kicker">Your world, in pictures</div>
    <div class="psub">The places you know best — ranked by everything you logged there.</div>
    ${card(lead, 'plead')}
    <div class="pgrid">${rest.map((c) => card(c, '')).join('')}</div>`,
  };
}

function figuresPage(input: AlmanacBookInput): BookPage {
  const cells = input.figures
    .map(
      (f, i) => `<div class="fig"><div class="fn" style="color:${STAT_COLORS[i % STAT_COLORS.length]}">${f.value}</div><div class="fl">${esc(f.label)}</div></div>`,
    )
    .join('');
  const rows = (title: string, list: { label: string; count: number }[]) =>
    list.length
      ? `<div class="col"><h2 class="darkh2">${esc(title)}</h2><div class="rows">${list
          .map((r) => `<div class="row"><span>${esc(r.label)}</span><b>${r.count}</b></div>`)
          .join('')}</div></div>`
      : '';
  // The two lists sit side by side so the page never overflows its sheet.
  return {
    cls: 'dark',
    folio: true,
    body: `<div class="eyebrow coral">CHAPTER TWO</div>
    <div class="kicker white">By the numbers</div>
    <div class="figs">${cells}</div>
    <div class="twocol">${rows('Relationships', input.relationships)}${rows('Discoveries by kind', input.categories)}</div>`,
  };
}

function continentPages(input: AlmanacBookInput, photos: PhotoMap): BookPage[] {
  // One continent per page: a full chapter spread each, so nothing ever
  // breaks awkwardly across sheets no matter how many countries there are.
  return input.continents.map((c) => ({
    cls: 'light' as const,
    folio: true,
    body: `<div class="eyebrow coral">CHAPTER THREE &nbsp;&middot;&nbsp; THE WORLD</div>
    <div class="kicker">${esc(c.name)}</div>
    <div class="conthero">${photoFill(c.coverCode ? photos.get(c.coverCode) : undefined)}<div class="fill pscrim"></div>
      <span class="countpill">${c.countries.length} ${c.countries.length === 1 ? 'country' : 'countries'}</span>
    </div>
    <div class="flags">${c.countries
      .map((co) => `<div class="flagchip">${flagEmoji(co.code)} <span>${esc(co.name)}</span></div>`)
      .join('')}</div>`,
  }));
}

function recognitionsPage(input: AlmanacBookInput): BookPage | null {
  if (!input.recognitions.length) return null;
  const rows = input.recognitions
    .map(
      (r) => `<div class="rec"><div class="recsym">${r.symbol}</div><div><div class="rect">${esc(r.title)}</div><div class="recd">${esc(r.description)}</div></div></div>`,
    )
    .join('');
  return {
    cls: 'light',
    folio: true,
    body: `<div class="eyebrow coral">CHAPTER FOUR</div>
    <div class="kicker">Recognitions earned</div>
    <div class="recs">${rows}</div>`,
  };
}

function backCover(input: AlmanacBookInput): BookPage {
  const countries = input.figures.find((f) => f.label.toLowerCase().includes('countries'))?.value;
  return {
    cls: 'dark back',
    body: `<div>
      <div class="backbrand">worldly</div>
      <div class="eyeline center"></div>
      <div class="backline">your travel story</div>
      ${countries ? `<div class="backstat">${countries} countries and counting&hellip;</div>` : ''}
    </div>`,
  };
}

export function buildAlmanacBookHtml(input: AlmanacBookInput, photos: PhotoMap = new Map()): string {
  const first = (input.firstName || 'Explorer').split(' ')[0];
  const pages: BookPage[] = [
    coverPage(input, photos, first),
    titlePage(input, first),
    picturesPage(input, photos),
    figuresPage(input),
    ...continentPages(input, photos),
    recognitionsPage(input),
    backCover(input),
  ].filter((p): p is BookPage => p !== null);

  let folio = 0;
  const sections = pages
    .map((p) => {
      const footer = p.folio
        ? `<div class="folio"><span>THE ALMANAC &nbsp;&middot;&nbsp; ${esc(first.toUpperCase())}&#8217;S EDITION</span><span>${++folio}</span></div>`
        : '';
      return `<section class="page ${p.cls}">${p.body}${footer}</section>`;
    })
    .join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page { margin: 0; size: ${PAGE_W}px ${PAGE_H}px; }
    html, body { margin: 0; padding: 0; font-family: -apple-system, system-ui, sans-serif; -webkit-print-color-adjust: exact; }
    .page { width: ${PAGE_W}px; height: ${PAGE_H}px; box-sizing: border-box; padding: 56px; page-break-after: always; position: relative; overflow: hidden; }
    .page:last-child { page-break-after: auto; }
    .light { background: ${PAPER}; color: #16203A; }
    .dark { background: ${NAVY}; color: #fff; }
    .fill { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .photo { background-size: cover; background-position: center; }

    .cover { padding: 0; }
    .covergrad { background: linear-gradient(150deg, #FFB84D 0%, #FF6B9A 50%, #9B7CFF 100%); }
    .coverscrim { background: linear-gradient(180deg, rgba(8,12,26,.45) 0%, rgba(8,12,26,.08) 34%, rgba(8,12,26,.82) 88%); }
    .coverin { position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding: 56px; display: flex; flex-direction: column; justify-content: space-between; }
    .coverbrand { font-family: Georgia, serif; font-size: 40px; color: #fff; text-shadow: 0 2px 18px rgba(0,0,0,.45); }
    .eyebrow { font-size: 18px; font-weight: 800; letter-spacing: 5px; color: #FFD9E5; }
    .eyebrow.coral { color: #E2497F; margin-bottom: 8px; }
    .eyeline { width: 64px; height: 4px; border-radius: 3px; background: #FF6B9A; margin: 12px 0 10px; }
    .eyeline.center { margin: 16px auto; }
    .covertitle { font-family: Georgia, serif; font-size: 108px; line-height: 1.0; color: #fff; text-shadow: 0 4px 30px rgba(0,0,0,.5); }
    .covername { letter-spacing: 4px; font-size: 19px; color: rgba(255,255,255,.92); margin-top: 22px; }

    .titlepage { display: flex; align-items: center; justify-content: center; text-align: center; }
    .tpbrand { font-family: Georgia, serif; font-size: 30px; color: #16203A; }
    .tptitle { font-family: Georgia, serif; font-size: 64px; color: #16203A; margin-top: 26px; }
    .tpsub { font-size: 19px; color: #6B7280; margin-top: 12px; }
    .tpedition { font-size: 13px; font-weight: 700; letter-spacing: 3px; color: #9AA1B2; margin-top: 64px; line-height: 2; }

    .kicker { font-family: Georgia, serif; font-size: 42px; color: #16203A; margin-bottom: 8px; }
    .kicker.white { color: #fff; }
    .psub { font-size: 17px; color: #6B7280; margin-bottom: 20px; }

    .pcard { position: relative; border-radius: 24px; overflow: hidden; }
    .plead { height: 296px; margin-bottom: 14px; }
    .pgrid { display: flex; flex-wrap: wrap; gap: 14px; }
    .pgrid .pcard { width: 297px; height: 196px; }
    .pscrim { background: linear-gradient(180deg, rgba(8,12,26,0) 40%, rgba(8,12,26,.72) 100%); }
    .pcap { position: absolute; left: 18px; bottom: 14px; font-size: 24px; color: #fff; display: flex; align-items: center; gap: 10px; }
    .pcap span { font-family: Georgia, serif; font-size: 24px; text-shadow: 0 1px 10px rgba(0,0,0,.6); }

    .figs { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 16px; }
    .fig { background: rgba(255,255,255,.07); border-radius: 22px; padding: 18px 20px; width: 297px; box-sizing: border-box; }
    .fn { font-family: Georgia, serif; font-size: 54px; line-height: 1; }
    .fl { font-size: 14px; font-weight: 700; letter-spacing: 1.5px; color: #8E97B8; margin-top: 7px; text-transform: uppercase; }
    .twocol { display: flex; gap: 16px; }
    .col { flex: 1; min-width: 0; }
    .darkh2 { font-family: Georgia, serif; font-size: 24px; font-weight: 600; margin: 30px 0 12px; color: #fff; }
    .rows { display: flex; flex-direction: column; gap: 7px; }
    .row { background: rgba(255,255,255,.07); border-radius: 14px; padding: 12px 16px; display: flex; justify-content: space-between; font-size: 17px; color: #E6E9F2; }
    .row b { font-family: Georgia, serif; color: #fff; }

    .conthero { position: relative; height: 380px; border-radius: 26px; overflow: hidden; margin-top: 10px; }
    .countpill { position: absolute; right: 18px; bottom: 16px; font-size: 15px; font-weight: 700; color: #fff; background: rgba(255,255,255,.24); border: 1px solid rgba(255,255,255,.45); border-radius: 999px; padding: 7px 14px; }
    .flags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
    .flagchip { background: #fff; border-radius: 999px; padding: 9px 15px; font-size: 19px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(22,32,58,.06); }
    .flagchip span { font-size: 16px; color: #16203A; }

    .recs { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .rec { background: #fff; border-radius: 18px; padding: 16px 18px; display: flex; gap: 16px; align-items: center; box-shadow: 0 2px 8px rgba(22,32,58,.06); }
    .recsym { font-size: 34px; }
    .rect { font-size: 19px; font-weight: 700; }
    .recd { font-size: 16px; color: #6B7280; margin-top: 2px; }

    .folio { position: absolute; left: 56px; right: 56px; bottom: 28px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; color: #9AA1B2; }
    .dark .folio { color: #5E6884; }

    .back { display: flex; align-items: center; justify-content: center; text-align: center; }
    .backbrand { font-family: Georgia, serif; font-size: 54px; color: #fff; }
    .backline { font-size: 20px; letter-spacing: 3px; color: #9AA3C2; text-transform: uppercase; }
    .backstat { font-family: Georgia, serif; font-size: 24px; color: #FFB84D; margin-top: 26px; }
  </style></head><body>${sections}</body></html>`;
}

/** Render the Almanac book to a PDF and open the native share sheet. */
export async function shareAlmanacBook(input: AlmanacBookInput): Promise<void> {
  const Print = await import('expo-print');
  const Sharing = await import('expo-sharing');

  // Inline every photo the book needs; a failed download just falls back to
  // the brand gradient for that block.
  const codes = new Set<string>();
  if (input.heroCode && hasDestinationPhoto(input.heroCode)) codes.add(input.heroCode);
  for (const s of input.photoStrip ?? []) if (hasDestinationPhoto(s.code)) codes.add(s.code);
  for (const c of input.continents) if (c.coverCode && hasDestinationPhoto(c.coverCode)) codes.add(c.coverCode);
  const photos: PhotoMap = new Map();
  await Promise.all(
    [...codes].map(async (code) => {
      const url = destinationImage(code).photo;
      const uri = url ? await toDataUri(url) : null;
      if (uri) photos.set(code, uri);
    }),
  );

  const html = buildAlmanacBookHtml(input, photos);
  const { uri } = await Print.printToFileAsync({
    html,
    // Must match the CSS page box exactly — see the print-renderer notes above.
    width: PAGE_W,
    height: PAGE_H,
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share your Almanac',
      UTI: 'com.adobe.pdf',
    });
  }
}
