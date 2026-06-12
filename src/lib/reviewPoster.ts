// Builds a shareable 1080×1920 "story" poster (SVG string) from a ReviewStats.
// Kept purely typographic + shapes so it rasterizes reliably to PNG.

import type { ReviewStats } from './review';

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<'
      ? '&lt;'
      : c === '>'
        ? '&gt;'
        : c === '&'
          ? '&amp;'
          : c === "'"
            ? '&apos;'
            : '&quot;',
  );
}

export function buildPosterSvg(review: ReviewStats, name: string): string {
  const W = 1080;
  const H = 1920;
  const title =
    review.scope === 'lifetime'
      ? 'My travel story'
      : `My ${review.scope} in travel`;
  const first = (name || 'Explorer').split(' ')[0];

  const cells: [string, number][] = [
    ['Countries', review.countries],
    ['Cities', review.cities],
    ['Journeys', review.journeys],
    ['Discoveries', review.discoveries],
  ];

  const stat = (x: number, y: number, label: string, value: number) => `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="420" height="300" rx="40" fill="rgba(255,255,255,0.12)"/>
      <text x="210" y="170" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="150" font-weight="600" fill="#ffffff">${value}</text>
      <text x="210" y="235" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="34" font-weight="600" fill="rgba(255,255,255,0.85)" letter-spacing="2">${label.toUpperCase()}</text>
    </g>`;

  const topLine = review.topCountryName
    ? `<text x="${W / 2}" y="1500" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="40" font-weight="600" fill="rgba(255,255,255,0.92)">Most explored · ${esc(review.topCountryName)}</text>`
    : '';
  const favLine = review.favourite
    ? `<text x="${W / 2}" y="1565" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="36" fill="rgba(255,255,255,0.78)">Favourite find · ${esc(review.favourite.name)}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF6B9A"/>
      <stop offset="0.52" stop-color="#9B7CFF"/>
      <stop offset="1" stop-color="#24D1C3"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="120" cy="1640" r="360" fill="rgba(255,255,255,0.07)"/>
  <circle cx="980" cy="240" r="280" fill="rgba(255,255,255,0.08)"/>

  <text x="${W / 2}" y="220" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="60" font-weight="600" fill="#ffffff">worldly</text>
  <text x="${W / 2}" y="300" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="34" font-weight="600" letter-spacing="6" fill="rgba(255,255,255,0.8)">${esc(first.toUpperCase())}&#8217;S RECAP</text>

  <text x="${W / 2}" y="470" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="92" font-weight="600" fill="#ffffff">${esc(title)}</text>

  <g transform="translate(0,640)">
    ${stat(110, 0, cells[0][0], cells[0][1])}
    ${stat(550, 0, cells[1][0], cells[1][1])}
    ${stat(110, 340, cells[2][0], cells[2][1])}
    ${stat(550, 340, cells[3][0], cells[3][1])}
  </g>

  <text x="${W / 2}" y="1420" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="44" font-weight="700" fill="#ffffff">${review.continents} continent${review.continents === 1 ? '' : 's'} · Level ${review.level} ${esc(review.levelTitle)}</text>
  ${topLine}
  ${favLine}

  <text x="${W / 2}" y="1790" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="32" fill="rgba(255,255,255,0.7)">Tracked on Worldly</text>
</svg>`;
}
