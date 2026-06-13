// Shareable 1080×1920 "story" posters for a trip and a travel map. Purely
// typographic + shapes so they rasterize reliably to PNG (see shareImage.ts).

import type { Trip } from '../types';
import { countryName } from '../data/countries';
import { daysUntil } from '../hooks/useTrips';

const W = 1080;
const H = 1920;

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

function frame(inner: string): string {
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
  ${inner}
  <text x="${W / 2}" y="1800" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="32" fill="rgba(255,255,255,0.7)">worldly · your travel story</text>
</svg>`;
}

function countdownText(trip: Trip): string {
  const d = daysUntil(trip.startDate);
  if (d > 1) return `${d} days to go`;
  if (d === 1) return 'Tomorrow!';
  if (d === 0) return 'Today!';
  const end = trip.endDate ? daysUntil(trip.endDate) : d;
  return end >= 0 ? 'Happening now' : 'A trip to remember';
}

export function buildTripPosterSvg(trip: Trip): string {
  const d = daysUntil(trip.startDate);
  const big = d > 1 ? String(d) : d === 1 ? '1' : d === 0 ? 'Now' : '✈';
  const small = d >= 1 ? (d === 1 ? 'day to go' : 'days to go') : '';
  return frame(`
  <text x="${W / 2}" y="300" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="34" font-weight="600" letter-spacing="6" fill="rgba(255,255,255,0.8)">NEXT ADVENTURE</text>
  <text x="${W / 2}" y="760" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="300" font-weight="600" fill="#ffffff">${esc(big)}</text>
  ${small ? `<text x="${W / 2}" y="850" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="46" font-weight="700" fill="rgba(255,255,255,0.9)">${small}</text>` : `<text x="${W / 2}" y="850" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="40" font-weight="600" fill="rgba(255,255,255,0.9)">${esc(countdownText(trip))}</text>`}
  <text x="${W / 2}" y="1120" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="84" font-weight="600" fill="#ffffff">${esc(trip.title)}</text>
  <text x="${W / 2}" y="1210" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="44" font-weight="600" fill="rgba(255,255,255,0.9)">${esc(countryName(trip.countryCode))}</text>`);
}

export function buildMapPosterSvg(input: {
  name: string;
  countries: number;
  cities: number;
  continents: number;
}): string {
  const first = (input.name || 'Explorer').split(' ')[0];
  const stat = (x: number, label: string, value: number) => `
    <g transform="translate(${x},1180)">
      <text x="0" y="0" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="120" font-weight="600" fill="#ffffff">${value}</text>
      <text x="0" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="30" font-weight="600" letter-spacing="2" fill="rgba(255,255,255,0.85)">${label}</text>
    </g>`;
  return frame(`
  <text x="${W / 2}" y="300" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="34" font-weight="600" letter-spacing="6" fill="rgba(255,255,255,0.8)">${esc(first.toUpperCase())}&#8217;S MAP</text>
  <text x="${W / 2}" y="700" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="360" font-weight="600" fill="#ffffff">${input.countries}</text>
  <text x="${W / 2}" y="820" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="50" font-weight="700" fill="rgba(255,255,255,0.92)">${input.countries === 1 ? 'country' : 'countries'} explored</text>
  ${stat(300, 'CONTINENTS', input.continents)}
  ${stat(780, 'CITIES', input.cities)}`);
}
