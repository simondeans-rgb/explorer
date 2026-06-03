// Destination imagery for Worldly.
//
// Strategy: every place gets a deterministic, on-brand gradient that ALWAYS
// renders (offline, demo, blocked networks, or countries without a photo). For
// popular destinations we additionally hot-link a curated Unsplash photo that
// fades in over the gradient when it loads — and silently leaves the gradient
// in place if it fails. No API key, no build step, no broken-image states.

const UNSPLASH = (id: string, w = 800, q = 65) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

// Curated Unsplash photo IDs per ISO 3166-1 alpha-2 country. Anything not
// listed falls back to its gradient (which still looks great), so this can grow
// over time without risk. Photo ids are the stable part of an Unsplash URL.
const PHOTO_ID: Record<string, string> = {
  FR: '1502602898657-3e91760cbb34', // Paris
  GB: '1513635269975-59663e0ac1ad', // London
  IT: '1515542622106-78bda8ba0e5b', // Rome / Colosseum
  ES: '1539037116277-4db20889f2d4', // Barcelona
  DE: '1467269204594-9661b134dd2b', // Berlin / Germany
  NL: '1534351590666-13e3e96b5017', // Amsterdam
  CH: '1530122037265-a5f1f91d3b99', // Swiss Alps
  AT: '1516550893923-42d28e5677af', // Vienna / Alps
  IS: '1504541089758-9ca337e9f3a8', // Iceland
  NO: '1601439678777-b2b3c56fa627', // Norway fjords
  IE: '1564959130747-897fb406b9af', // Ireland cliffs
  TR: '1541432901042-2d8bd64b4a9b', // Istanbul / Cappadocia
  JP: '1493976040374-85c8e12f0c0e', // Japan / Fuji
  CN: '1508804185872-d7badad00f7d', // Great Wall
  TH: '1528181304800-259b08848526', // Thailand
  VN: '1528127269322-539801943592', // Ha Long Bay
  IN: '1524492412937-b28074a5d7da', // Taj Mahal
  ID: '1537996194471-e657df975ab4', // Bali
  SG: '1525625293386-3f8f99389edd', // Singapore
  AE: '1512453979798-5ea266f8880c', // Dubai
  MY: '1596422846543-75c6fc197f07', // Kuala Lumpur
  KR: '1538485399081-7c8970ab1c89', // Seoul
  LK: '1566296314736-6eaac1ca0cb9', // Sri Lanka
  EG: '1539768942893-daf53e448371', // Pyramids
  MA: '1539020140153-e479b8c22e70', // Marrakech
  ZA: '1516026672322-bc52d61a55d5', // Cape Town
  KE: '1516426122078-c23e76319801', // Safari
  TZ: '1518002171953-a080ee817e1f', // Kilimanjaro / Serengeti
  US: '1485871981521-5b1fd3805eee', // USA
  MX: '1518105779142-d975f22f1b0a', // Mexico / Tulum
  CR: '1518259102261-b40117eabbc9', // Costa Rica
  CU: '1500759285222-a95626b934cb', // Havana
  BR: '1483729558449-99ef09a8c325', // Rio
  AR: '1589909202802-8f4aadce1849', // Argentina / Patagonia
  PE: '1526392060635-9d6019884377', // Machu Picchu
  CL: '1478827387698-1527781a4887', // Chile / Atacama
  CO: '1533055640609-24b498dfd74c', // Colombia
  AU: '1506973035872-a4ec16b8e8d9', // Sydney
  NZ: '1507699622108-4be3abd695ad', // New Zealand
  FJ: '1573790387438-4da905039392', // Fiji
};

export interface Destination {
  photo?: string;
  gradient: string;
}

// A bright, evocative default hero used when there's no signature country yet.
const DEFAULT_HERO = '1507525428034-b723cf961d3e'; // sunlit coastline
export function heroImage(code?: string, width = 1000): Destination {
  if (code && PHOTO_ID[code]) {
    return { photo: UNSPLASH(PHOTO_ID[code], width), gradient: gradientFor(code) };
  }
  return {
    photo: UNSPLASH(DEFAULT_HERO, width),
    gradient: gradientFor(code || 'WW'),
  };
}

// Deterministic hue from a country code, so each place keeps a stable identity.
function hueOf(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 53 + code.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

/** A bright, vivid travel-toned gradient, deterministic per code. */
export function gradientFor(code: string): string {
  const h = hueOf(code || 'XX');
  const h2 = (h + 42) % 360;
  return `linear-gradient(135deg, hsl(${h} 92% 66%) 0%, hsl(${h2} 90% 60%) 52%, hsl(${(h2 + 34) % 360} 84% 54%) 110%)`;
}

/** Imagery for a country: a curated photo URL (if any) + its always-on gradient. */
export function destinationImage(code: string, width = 800): Destination {
  const id = PHOTO_ID[code];
  return {
    photo: id ? UNSPLASH(id, width) : undefined,
    gradient: gradientFor(code),
  };
}

export function hasDestinationPhoto(code: string): boolean {
  return Boolean(PHOTO_ID[code]);
}
