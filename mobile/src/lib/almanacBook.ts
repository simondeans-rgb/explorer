// The Almanac, published as a multi-page "photo book" PDF — a keepsake record of
// everywhere you've been. Rendered via expo-print (works in Expo Go) and handed
// to the native share sheet. Lazy-imports the native modules like mapPoster so
// loading this module never pulls one in at startup.
import { flagEmoji } from './flags';

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;',
  );
}

export interface AlmanacBookInput {
  firstName: string;
  generatedOn: string;
  figures: { label: string; value: number }[];
  continents: { name: string; countries: { code: string; name: string }[] }[];
  relationships: { label: string; count: number }[];
  categories: { label: string; count: number }[];
  recognitions: { symbol: string; title: string; description: string }[];
}

function figuresPage(input: AlmanacBookInput): string {
  const cells = input.figures
    .map((f) => `<div class="fig"><div class="fn">${f.value}</div><div class="fl">${esc(f.label)}</div></div>`)
    .join('');
  const rel = input.relationships.length
    ? `<h2>Relationships with places</h2><div class="rows">${input.relationships
        .map((r) => `<div class="row"><span>${esc(r.label)}</span><b>${r.count}</b></div>`)
        .join('')}</div>`
    : '';
  const cat = input.categories.length
    ? `<h2>Discoveries by kind</h2><div class="rows">${input.categories
        .map((c) => `<div class="row"><span>${esc(c.label)}</span><b>${c.count}</b></div>`)
        .join('')}</div>`
    : '';
  return `<section class="page light">
    <div class="kicker">By the numbers</div>
    <div class="figs">${cells}</div>
    ${rel}${cat}
  </section>`;
}

function continentPages(input: AlmanacBookInput): string {
  if (!input.continents.length) return '';
  const blocks = input.continents
    .map(
      (c) => `<div class="cont">
        <div class="conthead"><h2>${esc(c.name)}</h2><span class="count">${c.countries.length} ${c.countries.length === 1 ? 'country' : 'countries'}</span></div>
        <div class="flags">${c.countries
          .map((co) => `<div class="flagchip">${flagEmoji(co.code)} <span>${esc(co.name)}</span></div>`)
          .join('')}</div>
      </div>`,
    )
    .join('');
  return `<section class="page light">
    <div class="kicker">The world, by continent</div>
    ${blocks}
  </section>`;
}

function recognitionsPage(input: AlmanacBookInput): string {
  if (!input.recognitions.length) return '';
  const rows = input.recognitions
    .map(
      (r) => `<div class="rec"><div class="recsym">${r.symbol}</div><div><div class="rect">${esc(r.title)}</div><div class="recd">${esc(r.description)}</div></div></div>`,
    )
    .join('');
  return `<section class="page light">
    <div class="kicker">Recognitions earned</div>
    <div class="recs">${rows}</div>
  </section>`;
}

export function buildAlmanacBookHtml(input: AlmanacBookInput): string {
  const first = (input.firstName || 'Explorer').split(' ')[0];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page { margin: 0; size: 720px 1018px; }
    html, body { margin: 0; padding: 0; font-family: -apple-system, system-ui, sans-serif; -webkit-print-color-adjust: exact; }
    .page { width: 720px; min-height: 1018px; box-sizing: border-box; padding: 70px 60px; page-break-after: always; position: relative; }
    .page:last-child { page-break-after: auto; }
    .light { background: #FBF7F2; color: #16203A; }
    .cover { background: linear-gradient(150deg, #FFB84D 0%, #FF6B9A 50%, #9B7CFF 100%); color: #fff; text-align: center; display: flex; flex-direction: column; justify-content: center; }
    .brand { font-family: Georgia, serif; font-size: 44px; font-weight: 600; }
    .covertitle { font-family: Georgia, serif; font-size: 92px; line-height: 1.02; font-weight: 600; margin: 26px 0 0; }
    .coversub { font-size: 27px; opacity: .95; margin-top: 18px; }
    .covername { letter-spacing: 5px; font-size: 22px; opacity: .9; margin-top: 60px; }
    .coverdate { font-size: 20px; opacity: .8; margin-top: 8px; }
    .kicker { font-family: Georgia, serif; font-size: 40px; font-weight: 600; color: #16203A; margin-bottom: 28px; }
    h2 { font-family: Georgia, serif; font-size: 27px; font-weight: 600; margin: 30px 0 14px; }
    .figs { display: flex; flex-wrap: wrap; gap: 16px; }
    .fig { background: #fff; border-radius: 22px; padding: 22px 20px; width: 285px; box-sizing: border-box; }
    .fn { font-family: Georgia, serif; font-size: 56px; line-height: 1; color: #FF6B9A; }
    .fl { font-size: 16px; font-weight: 700; letter-spacing: .5px; color: #6B7280; margin-top: 6px; text-transform: uppercase; }
    .rows { display: flex; flex-direction: column; gap: 8px; }
    .row { background: #fff; border-radius: 16px; padding: 14px 18px; display: flex; justify-content: space-between; font-size: 19px; }
    .row b { font-family: Georgia, serif; }
    .cont { margin-bottom: 26px; }
    .conthead { display: flex; align-items: baseline; justify-content: space-between; }
    .conthead h2 { margin: 0; }
    .count { font-size: 16px; font-weight: 700; color: #FF6B9A; }
    .flags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
    .flagchip { background: #fff; border-radius: 999px; padding: 9px 15px; font-size: 19px; display: inline-flex; align-items: center; gap: 8px; }
    .flagchip span { font-size: 16px; color: #16203A; }
    .recs { display: flex; flex-direction: column; gap: 12px; }
    .rec { background: #fff; border-radius: 18px; padding: 16px 18px; display: flex; gap: 16px; align-items: center; }
    .recsym { font-size: 34px; }
    .rect { font-size: 19px; font-weight: 700; }
    .recd { font-size: 16px; color: #6B7280; margin-top: 2px; }
    .footer { position: absolute; left: 60px; right: 60px; bottom: 40px; font-size: 16px; color: #9AA1B2; text-align: center; }
  </style></head><body>
    <section class="page cover">
      <div class="brand">worldly</div>
      <div class="covertitle">The Almanac</div>
      <div class="coversub">A record of everywhere you&#8217;ve been</div>
      <div class="covername">${esc(first.toUpperCase())}&#8217;S EDITION</div>
      <div class="coverdate">${esc(input.generatedOn)}</div>
    </section>
    ${figuresPage(input)}
    ${continentPages(input)}
    ${recognitionsPage(input)}
  </body></html>`;
}

/** Render the Almanac book to a PDF and open the native share sheet. */
export async function shareAlmanacBook(input: AlmanacBookInput): Promise<void> {
  const Print = await import('expo-print');
  const Sharing = await import('expo-sharing');
  const html = buildAlmanacBookHtml(input);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share your Almanac',
      UTI: 'com.adobe.pdf',
    });
  }
}
