// Destination imagery for Worldly.
//
// Photos are curated free stock (Unsplash License — free for commercial use,
// no attribution) and bundled locally in /public/destinations, so they always
// render with no runtime network dependency. Every place also has a
// deterministic on-brand gradient as a fallback for countries without a photo.

// ISO 3166-1 alpha-2 codes that have a bundled photo at /destinations/XX.jpg.
const HAS_PHOTO = new Set([
  'AE', 'AR', 'AT', 'AU', 'BR', 'CH', 'CL', 'CN', 'CO', 'CR', 'CU', 'DE', 'EG',
  'ES', 'FJ', 'FR', 'GB', 'ID', 'IE', 'IN', 'IS', 'IT', 'JP', 'KE', 'KR', 'LK',
  'MA', 'MX', 'MY', 'NL', 'NO', 'NZ', 'PE', 'SG', 'TH', 'TR', 'TZ', 'US', 'VN',
  'ZA',
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
