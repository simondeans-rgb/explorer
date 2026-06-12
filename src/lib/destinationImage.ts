// Destination imagery for Worldly.
//
// Photos are bundled locally in /public/destinations so they always render with
// no runtime network dependency. The original set is curated Unsplash (free,
// no attribution); the remainder are Creative-Commons / public-domain images
// sourced via Openverse and credited in /public/destinations/ATTRIBUTION.md.
// Countries without a bundled photo fall back to an illustrated CountryScene.

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
]);

const photoPath = (code: string) => `/destinations/${code}.jpg`;

export interface Destination {
  photo?: string;
  gradient: string;
}

// A bright, evocative default hero (bundled) used when there's no signature
// country yet, or the signature country has no photo.
export function heroImage(code?: string): Destination {
  if (code && HAS_PHOTO.has(code)) {
    return { photo: photoPath(code), gradient: gradientFor(code) };
  }
  return { photo: '/destinations/WW.jpg', gradient: gradientFor(code || 'WW') };
}

// Brand spectrum stops — coral, lavender, aqua, sunburst — so every generated
// gradient stays on-palette and bright rather than a random hue.
const SPECTRUM: [string, string][] = [
  ['#FF6B9A', '#9B7CFF'], // coral → lavender
  ['#9B7CFF', '#24D1C3'], // lavender → aqua
  ['#24D1C3', '#FFB84D'], // aqua → sunburst
  ['#FFB84D', '#FF6B9A'], // sunburst → coral
  ['#FF6B9A', '#FFB84D'], // coral → sunburst
  ['#24D1C3', '#9B7CFF'], // aqua → lavender
];

function hashOf(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 53 + code.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** A bright, on-brand gradient, deterministic per code. */
export function gradientFor(code: string): string {
  const [a, b] = SPECTRUM[hashOf(code || 'XX') % SPECTRUM.length];
  return `linear-gradient(150deg, ${a} 0%, ${b} 100%)`;
}

/** Imagery for a country: a bundled photo (if any) + its always-on gradient. */
export function destinationImage(code: string): Destination {
  return {
    photo: HAS_PHOTO.has(code) ? photoPath(code) : undefined,
    gradient: gradientFor(code),
  };
}

export function hasDestinationPhoto(code: string): boolean {
  return HAS_PHOTO.has(code);
}
