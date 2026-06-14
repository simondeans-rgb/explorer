// Destination imagery for Worldly (native). Reuses the exact same ~211 bundled
// country photos the web app ships, served from the production domain so the
// phone shows identical imagery with no app-bundle weight. Countries without a
// photo fall back to their always-on brand gradient.
import type { Gradient } from './theme';

const BASE = 'https://stickynotes-sand.vercel.app/destinations';

// ISO 3166-1 alpha-2 codes that have a bundled photo at /destinations/XX.jpg.
const HAS_PHOTO = new Set([
  'AD', 'AE', 'AF', 'AG', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BM', 'BN', 'BO', 'BR',
  'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CF', 'CG', 'CH', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC',
  'EE', 'EG', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB',
  'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GU',
  'GW', 'GY', 'HK', 'HN', 'HR', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IQ', 'IR',
  'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP',
  'KR', 'KW', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV',
  'LY', 'MA', 'MC', 'MD', 'ME', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MT',
  'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NG', 'NI', 'NL', 'NO',
  'NP', 'NR', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PR', 'PS',
  'PT', 'PW', 'PY', 'QA', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE',
  'SG', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SY', 'SZ',
  'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VN', 'VU', 'WS', 'XK', 'YE',
  'ZA', 'ZM', 'ZW',
  'WW', // world default hero (not a real country code)
]);

const photoUrl = (code: string) => `${BASE}/${code}.jpg`;

export interface Destination {
  photo?: string;
  gradient: Gradient;
}

// Brand spectrum stops so every generated gradient stays on-palette and bright.
const SPECTRUM: Gradient[] = [
  ['#FF6B9A', '#9B7CFF'],
  ['#9B7CFF', '#24D1C3'],
  ['#24D1C3', '#FFB84D'],
  ['#FFB84D', '#FF6B9A'],
  ['#FF6B9A', '#FFB84D'],
  ['#24D1C3', '#9B7CFF'],
];

function hashOf(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 53 + code.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** A bright, on-brand gradient, deterministic per code. */
export function gradientFor(code: string): Gradient {
  return SPECTRUM[hashOf(code || 'XX') % SPECTRUM.length];
}

/** Imagery for a country: a bundled photo URL (if any) + its always-on gradient. */
export function destinationImage(code: string): Destination {
  return {
    photo: HAS_PHOTO.has(code) ? photoUrl(code) : undefined,
    gradient: gradientFor(code),
  };
}

/** A bright hero image: the signature country's photo, else a world default. */
export function heroImage(code?: string): Destination {
  if (code && HAS_PHOTO.has(code)) {
    return { photo: photoUrl(code), gradient: gradientFor(code) };
  }
  return { photo: photoUrl('WW'), gradient: gradientFor(code || 'WW') };
}

export function hasDestinationPhoto(code: string): boolean {
  return HAS_PHOTO.has(code);
}
