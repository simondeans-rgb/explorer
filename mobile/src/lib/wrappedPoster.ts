// A shareable "Year in Travel" / "world, wrapped" poster — the headline numbers
// from the Wrapped story rendered to a designed PDF via expo-print (works in
// Expo Go) and handed to the native share sheet. Mirrors mapPoster's lazy-import
// pattern so merely loading this module never pulls in a native module.
import { flagEmoji } from './flags';

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;',
  );
}

export interface WrappedPosterInput {
  firstName: string;
  countries: number;
  continents: number;
  cities: number;
  journeys: number;
  discoveries: number;
  /** Explorer level + playful title. */
  levelNumber: number;
  levelTitle: string;
  xp: number;
  /** A standout country to feature (name + ISO code for the flag), if any. */
  topCountryName?: string;
  topCountryCode?: string;
  flagCodes: string[];
  /** Scope the poster to a year ("SIMON'S 2026, WRAPPED") instead of lifetime. */
  year?: number;
}

function statCell(n: number, label: string): string {
  return `<div class="cell"><div class="n">${n}</div><div class="l">${label}</div></div>`;
}

export function buildWrappedPosterHtml(input: WrappedPosterInput): string {
  const first = (input.firstName || 'Explorer').split(' ')[0];
  const flags = input.flagCodes.slice(0, 40).map((c) => flagEmoji(c)).join(' ');
  const feature = input.topCountryName
    ? `<div class="feature">${input.topCountryCode ? flagEmoji(input.topCountryCode) + '&nbsp;' : ''}Most explored &middot; <b>${esc(input.topCountryName)}</b></div>`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page { margin: 0; }
    html, body { margin: 0; padding: 0; }
    .page { width: 720px; height: 1280px; box-sizing: border-box; padding: 76px 56px 64px;
      background: linear-gradient(150deg, #FF6B9A 0%, #9B7CFF 50%, #24D1C3 100%);
      color: #fff; font-family: -apple-system, system-ui, sans-serif; text-align: center;
      position: relative; overflow: hidden; }
    .brand { font-family: Georgia, 'Times New Roman', serif; font-size: 42px; font-weight: 600; }
    .eyebrow { letter-spacing: 5px; font-size: 20px; opacity: .9; margin-top: 50px; }
    .title { font-family: Georgia, serif; font-size: 74px; font-weight: 600; line-height: 1.04; margin: 8px 0 0; }
    .big { font-family: Georgia, serif; font-size: 220px; font-weight: 600; line-height: 1; margin: 30px 0 0; }
    .bigsub { font-size: 30px; font-weight: 700; opacity: .96; margin-top: 2px; }
    .grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 18px 22px; margin: 46px auto 0; max-width: 560px; }
    .cell { background: rgba(255,255,255,0.16); border-radius: 28px; padding: 22px 10px; width: 250px; }
    .cell .n { font-family: Georgia, serif; font-size: 70px; font-weight: 600; line-height: 1; }
    .cell .l { letter-spacing: 2px; font-size: 19px; opacity: .9; margin-top: 6px; text-transform: uppercase; }
    .level { display: inline-block; margin-top: 44px; background: rgba(0,0,0,0.22); border-radius: 999px;
      padding: 16px 30px; font-size: 26px; font-weight: 700; }
    .level b { font-family: Georgia, serif; font-weight: 600; }
    .feature { margin-top: 26px; font-size: 24px; opacity: .95; }
    .flags { margin-top: 30px; font-size: 34px; line-height: 1.5; max-width: 600px; margin-left: auto; margin-right: auto; }
    .footer { position: absolute; left: 0; right: 0; bottom: 46px; font-size: 22px; opacity: .72; }
  </style></head><body><div class="page">
    <div class="brand">worldly</div>
    <div class="eyebrow">${esc(first.toUpperCase())}&#8217;S ${input.year ?? 'WORLD,'} WRAPPED</div>
    <div class="big">${input.countries}</div>
    <div class="bigsub">${input.countries === 1 ? 'country' : 'countries'} explored</div>
    <div class="grid">
      ${statCell(input.continents, 'Continents')}
      ${statCell(input.cities, 'Cities')}
      ${statCell(input.journeys, 'Journeys')}
      ${statCell(input.discoveries, 'Discoveries')}
    </div>
    <div class="level">Explorer Level ${input.levelNumber} &middot; <b>${esc(input.levelTitle)}</b></div>
    ${feature}
    <div class="flags">${flags}</div>
    <div class="footer">worldly &middot; your travel story</div>
  </div></body></html>`;
}

/** Render the Wrapped poster to a PDF and open the native share sheet. */
export async function shareWrappedPoster(input: WrappedPosterInput): Promise<void> {
  const Print = await import('expo-print');
  const Sharing = await import('expo-sharing');
  const html = buildWrappedPosterHtml(input);
  const { uri } = await Print.printToFileAsync({ html, width: 720, height: 1280 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share your world, wrapped',
      UTI: 'com.adobe.pdf',
    });
  }
}
