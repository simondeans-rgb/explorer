// A shareable "my world" poster, rendered to a PDF via expo-print (works in
// Expo Go) and handed to the native share sheet. Mirrors the web map poster
// but draws the real highlighted world map.
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { WORLD_FEATURES } from './worldGeo';
import { flagEmoji } from './flags';

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;',
  );
}

/** The world drawn for the poster: visited countries white, the rest faint. */
function worldSvg(visited: Set<string>, w: number, h: number): string {
  const projection = geoEqualEarth().fitSize([w, h], { type: 'Sphere' });
  const path = geoPath(projection);
  const parts: string[] = [];
  for (const wf of WORLD_FEATURES) {
    const d = path(wf.feature);
    if (!d) continue;
    const on = wf.alpha2 ? visited.has(wf.alpha2) : false;
    parts.push(`<path d="${d}" fill="${on ? '#ffffff' : 'rgba(255,255,255,0.20)'}" stroke="rgba(20,20,40,0.06)" stroke-width="0.3"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${parts.join('')}</svg>`;
}

export interface MapPosterInput {
  firstName: string;
  countries: number;
  cities: number;
  continents: number;
  pct: number;
  visited: Set<string>;
  flagCodes: string[];
}

export function buildMapPosterHtml(input: MapPosterInput): string {
  const map = worldSvg(input.visited, 640, 360);
  const flags = input.flagCodes.slice(0, 28).map((c) => flagEmoji(c)).join(' ');
  const pctStr = input.pct < 10 ? input.pct.toFixed(1) : String(Math.round(input.pct));
  const first = (input.firstName || 'Explorer').split(' ')[0];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page { margin: 0; }
    html, body { margin: 0; padding: 0; }
    .page { width: 720px; height: 1280px; box-sizing: border-box; padding: 70px 56px;
      background: linear-gradient(135deg, #FF6B9A 0%, #9B7CFF 52%, #24D1C3 100%);
      color: #fff; font-family: -apple-system, system-ui, sans-serif; text-align: center;
      position: relative; overflow: hidden; }
    .brand { font-family: Georgia, 'Times New Roman', serif; font-size: 44px; font-weight: 600; }
    .eyebrow { letter-spacing: 6px; font-size: 21px; opacity: .85; margin-top: 44px; }
    .big { font-family: Georgia, serif; font-size: 210px; font-weight: 600; line-height: 1; margin: 14px 0 0; }
    .sub { font-size: 30px; font-weight: 700; opacity: .96; margin-top: 6px; }
    .map { margin: 40px auto 26px; }
    .stats { display: flex; justify-content: center; gap: 72px; }
    .stat .n { font-family: Georgia, serif; font-size: 84px; font-weight: 600; line-height: 1; }
    .stat .l { letter-spacing: 2px; font-size: 21px; opacity: .85; margin-top: 6px; }
    .flags { margin-top: 34px; font-size: 38px; line-height: 1.5; }
    .footer { position: absolute; left: 0; right: 0; bottom: 46px; font-size: 23px; opacity: .72; }
  </style></head><body><div class="page">
    <div class="brand">worldly</div>
    <div class="eyebrow">${esc(first.toUpperCase())}&#8217;S MAP</div>
    <div class="big">${input.countries}</div>
    <div class="sub">${input.countries === 1 ? 'country' : 'countries'} explored &middot; ${pctStr}% of the world</div>
    <div class="map">${map}</div>
    <div class="stats">
      <div class="stat"><div class="n">${input.continents}</div><div class="l">CONTINENTS</div></div>
      <div class="stat"><div class="n">${input.cities}</div><div class="l">CITIES</div></div>
    </div>
    <div class="flags">${flags}</div>
    <div class="footer">worldly &middot; your travel story</div>
  </div></body></html>`;
}

/** Render the poster to a PDF and open the native share sheet. */
export async function shareMapPoster(input: MapPosterInput): Promise<void> {
  const html = buildMapPosterHtml(input);
  const { uri } = await Print.printToFileAsync({ html, width: 720, height: 1280 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share your world',
      UTI: 'com.adobe.pdf',
    });
  }
}
