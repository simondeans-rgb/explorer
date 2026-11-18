// Seed two connected, data-rich demo accounts for App Store / Play review.
//
// Apple's App Review needs a working demo login to see account-based features
// (cloud sync + the social "Circle"). This creates two email/password users,
// makes them accepted friends, and fills each with a believable travel history
// so the Atlas, Story, Lifetime Wrapped and the Circle feed all look real.
//
// It writes exactly the same Firestore shapes the app itself writes
// (mobile/src/store/data.tsx, src/lib/connections.ts, src/lib/profile.ts):
// top-level collections keyed by a `userId` field, auto-IDs, server Timestamps.
//
// ─────────────────────────────────────────────────────────────────────────────
// USAGE
//   1. Firebase console → Authentication → make sure Email/Password is enabled.
//   2. Project settings → Service accounts → "Generate new private key".
//      Save it (e.g. serviceAccountKey.json) and DO NOT commit it.
//   3. From the repo root:
//        GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
//          npm --prefix functions run seed:demo
//      or explicitly:
//        node functions/scripts/seed-demo-accounts.mjs --key ./serviceAccountKey.json
//
//   Preview without credentials (writes nothing):
//        node functions/scripts/seed-demo-accounts.mjs --dry-run
//
// Options (all optional):
//   --dry-run           print what would be written; touch nothing (no key needed)
//   --key <path>        service-account JSON (else uses GOOGLE_APPLICATION_CREDENTIALS)
//   --project <id>      project id (default: stickynotes-c13ac)
//   --email <addr>      primary demo email      (default demo@worldly-explorer.com)
//   --password <pw>     password for both users (default WorldlyDemo!2026)
//   --friend-email <a>  friend demo email       (default friend.demo@worldly-explorer.com)
//
// Idempotent: re-running clears these two demo users' previous seed first and
// rebuilds it. Only the two demo accounts are ever touched.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// ── args ─────────────────────────────────────────────────────────────────────
const has = (name) => process.argv.includes(`--${name}`);
function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const DRY_RUN = has('dry-run');
const KEY_PATH = arg('key', process.env.GOOGLE_APPLICATION_CREDENTIALS);
const PROJECT_ID = arg('project', 'stickynotes-c13ac');
const PASSWORD = arg('password', 'WorldlyDemo!2026');
const A_EMAIL = arg('email', 'demo@worldly-explorer.com');
const B_EMAIL = arg('friend-email', 'friend.demo@worldly-explorer.com');
const A_NAME = 'Alex Rivera';
const B_NAME = 'Sam Chen';

// Real destination photos (data URLs), keyed by ISO country code, so every
// memory and recommendation shows its actual place. These are downscaled copies
// of the app's own bundled /destinations imagery — the authorised source the app
// already ships — embedded so playback needs no network. 'WW' is the fallback.
const PHOTOS = JSON.parse(readFileSync(new URL('./demo-photos.json', import.meta.url), 'utf8'));
const photoFor = (code) => PHOTOS[code] ?? PHOTOS.WW;

const ms = (y, mo = 6, d = 15) => Date.UTC(y, mo - 1, d, 12, 0, 0);
const ts = (y, mo = 6, d = 15) => Timestamp.fromMillis(ms(y, mo, d));
const SERVER = () => FieldValue.serverTimestamp();

// Share code, mirroring src/lib/profile.ts deterministicCode() so it's stable
// per-uid and re-runs don't orphan old code docs.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function deterministicCode(uid) {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) | 0;
  let n = Math.abs(h);
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += ALPHABET[n % ALPHABET.length];
    n = Math.floor(n / ALPHABET.length);
  }
  return `SD-${s}`;
}
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

// ── op builders (mirror the app's doc shapes; never write an `id` field) ─────
// Each returns { coll, id?, data }. Docs with no `id` get a Firestore auto-id.
function placeOp(uid, p) {
  const createdAt = ts(p.firstYear ?? 2020, p.mo ?? 6, p.d ?? 15);
  return { coll: 'places', data: {
    userId: uid,
    kind: p.kind,
    countryCode: p.countryCode,
    name: p.name,
    relationships: p.relationships,
    firstYear: p.firstYear ?? null,
    firstDate: p.firstDate ?? (p.firstYear ? String(p.firstYear) : null),
    livedFrom: p.livedFrom ?? null,
    livedTo: p.livedTo ?? null,
    residencePeriods: p.residencePeriods ?? null,
    note: p.note ?? null,
    createdAt,
    updatedAt: createdAt,
  } };
}
function discoveryOp(uid, d) {
  const createdAt = d.year
    ? ts(d.year, d.mo ?? 6, d.d ?? 12)
    : Timestamp.fromMillis(ms(2024, 1, 1) + (60 - (d.daysAgo ?? 20)) * 864e5); // recent, deterministic
  return { coll: 'discoveries', data: {
    userId: uid,
    name: d.name,
    category: d.category,
    subcategory: d.subcategory ?? null,
    countryCode: d.countryCode ?? null,
    city: d.city ?? null,
    landmark: d.landmark ?? null,
    expeditionId: null,
    verdict: d.verdict ?? null,
    note: d.note ?? null,
    photo: d.photo ?? photoFor(d.countryCode),
    createdAt,
    updatedAt: createdAt,
  } };
}
function expeditionOp(uid, e) {
  const createdAt = ts(e.year, e.mo ?? 6, e.d ?? 1);
  return { coll: 'expeditions', data: {
    userId: uid,
    title: e.title,
    startDate: e.startDate ?? null,
    endDate: e.endDate ?? null,
    countryCodes: e.countryCodes,
    journeys: e.journeys.map((j, i) => ({ id: `j_${i}_${Math.abs(hash(e.title + i))}`, ...j })),
    note: e.note ?? null,
    createdAt,
    updatedAt: createdAt,
  } };
}
function captureOp(uid, c) {
  const takenAt = ms(c.year, c.mo ?? 6, c.d ?? 15);
  return { coll: 'captures', data: {
    userId: uid,
    dataUrl: c.photo ?? photoFor(c.countryCode),
    countryCode: c.countryCode ?? null,
    city: c.city ?? null,
    expeditionId: null,
    discoveryId: null,
    caption: c.caption ?? null,
    takenAt,
    createdAt: Timestamp.fromMillis(takenAt),
    // captures deliberately have no updatedAt (matches the app)
  } };
}

// ── the two demo lives ───────────────────────────────────────────────────────
// Distinct regions so the two maps and the Circle feed clearly differ. Each
// destination row carries everything for that country: its city, a memory
// caption (→ a photo capture) and often a recommendation (→ a discovery). The
// expand() builder below turns these tables into the places/cities/discoveries/
// captures the app reads. `cap` = a memory; `disc` = a recommendation.
const ALEX_SRC = {
  dest: [
    { cc: 'GB', name: 'United Kingdom', city: 'London', year: 2014, rel: ['lived', 'born'], cap: 'Home, before the world opened up', disc: { n: 'Borough Market', c: 'food', v: 'recommend', note: 'Go on an empty stomach.' } },
    { cc: 'PT', name: 'Portugal', city: 'Lisbon', year: 2015, rel: ['lived'], livedFrom: '2015-03', livedTo: '2018-09', cap: 'Golden hour over the Tejo', disc: { n: 'Time Out Market', c: 'food', v: 'recommend', note: 'One stall for every mood.' } },
    { cc: 'ES', name: 'Spain', city: 'Barcelona', year: 2016, cap: 'Gaudí against the blue', disc: { n: 'Park Güell at opening', c: 'culture', v: 'recommend', note: 'Beat the queues.' } },
    { cc: 'FR', name: 'France', city: 'Paris', year: 2017, cap: 'The city from Montmartre', disc: { n: "Musée d'Orsay", c: 'culture', v: 'recommend' } },
    { cc: 'IT', name: 'Italy', city: 'Rome', year: 2018, cap: 'Espresso and old stone', disc: { n: 'Trastevere at dusk', c: 'experience', v: 'hidden-gem', note: 'Wander with no plan.' } },
    { cc: 'JP', name: 'Japan', city: 'Kyoto', year: 2019, cap: 'The empty torii at dawn', disc: { n: 'Fushimi Inari before dawn', c: 'experience', v: 'hidden-gem', note: 'The empty gates are unreal.' } },
    { cc: 'TH', name: 'Thailand', city: 'Bangkok', year: 2020, cap: 'Longtails on the Chao Phraya', disc: { n: 'A canal-side boat-noodle stall', c: 'food', v: 'hidden-gem' } },
    { cc: 'MA', name: 'Morocco', city: 'Marrakesh', year: 2022, cap: 'Lost in the medina', disc: { n: 'Jemaa el-Fnaa at night', c: 'culture', v: 'recommend' } },
    { cc: 'IS', name: 'Iceland', city: 'Reykjavik', year: 2023, cap: 'Somewhere on the ring road', disc: { n: 'The Blue Lagoon', c: 'nature', v: 'worth-visiting', note: 'Touristy but worth it once.' } },
    { cc: 'GR', name: 'Greece', city: 'Santorini', year: 2024, cap: 'Blue domes and white walls', disc: { n: 'Sunset in Oia', c: 'nature', v: 'recommend' } },
    { cc: 'IE', name: 'Ireland', city: 'Dublin', year: 2015, cap: 'Green all the way to the cliffs', disc: { n: 'Cliffs of Moher', c: 'nature', v: 'recommend' } },
    { cc: 'NL', name: 'Netherlands', city: 'Amsterdam', year: 2016, cap: 'Bikes and bridges', disc: { n: 'The canal ring by bike', c: 'experience', v: 'recommend' } },
    { cc: 'DE', name: 'Germany', city: 'Berlin', year: 2017, cap: 'The wall, still speaking', disc: { n: 'East Side Gallery', c: 'culture', v: 'worth-visiting' } },
    { cc: 'CH', name: 'Switzerland', city: 'Zürich', year: 2018, cap: 'Still water, big mountains', disc: { n: 'A swim in Lake Zürich', c: 'nature', v: 'hidden-gem' } },
    { cc: 'AT', name: 'Austria', city: 'Vienna', year: 2018, cap: 'Coffee-and-cake weather', disc: { n: 'A Viennese coffee house', c: 'food', v: 'recommend', note: 'Order the Sachertorte.' } },
    { cc: 'HR', name: 'Croatia', city: 'Split', year: 2019, cap: 'The Adriatic, impossibly clear', disc: { n: 'Sea-kayaking off the old town', c: 'experience', v: 'hidden-gem' } },
    { cc: 'CZ', name: 'Czechia', city: 'Prague', year: 2016, cap: 'Spires in the morning mist', disc: { n: 'Prague Castle at dawn', c: 'culture', v: 'recommend' } },
    { cc: 'HU', name: 'Hungary', city: 'Budapest', year: 2017, cap: 'Steam rising off the baths', disc: { n: 'Széchenyi thermal baths', c: 'experience', v: 'recommend' } },
    { cc: 'TR', name: 'Türkiye', city: 'Istanbul', year: 2021, cap: 'Where two continents meet' },
    { cc: 'EG', name: 'Egypt', city: 'Cairo', year: 2021, cap: 'Older than everything' },
    { cc: 'JO', name: 'Jordan', city: 'Petra', year: 2022, cap: 'Carved out of rose stone' },
    { cc: 'AE', name: 'United Arab Emirates', city: 'Dubai', year: 2020, cap: 'Desert turned skyline' },
    { cc: 'IN', name: 'India', city: 'Jaipur', year: 2019, cap: 'Pink city, golden light' },
    { cc: 'VN', name: 'Vietnam', city: 'Hanoi', year: 2020, cap: 'Old Quarter, blue hour' },
    { cc: 'ID', name: 'Indonesia', city: 'Bali', year: 2023 },
    { cc: 'SG', name: 'Singapore', city: 'Singapore', year: 2020 },
    { cc: 'KR', name: 'South Korea', city: 'Seoul', year: 2019 },
    { cc: 'PL', name: 'Poland', city: 'Kraków', year: 2017 },
    { cc: 'NO', name: 'Norway', city: 'Bergen', year: 2022 },
    { cc: 'SE', name: 'Sweden', city: 'Stockholm', year: 2016 },
  ],
  extraCities: [
    { cc: 'PT', name: 'Porto' }, { cc: 'JP', name: 'Tokyo' }, { cc: 'IT', name: 'Florence' },
    { cc: 'ES', name: 'Granada' }, { cc: 'FR', name: 'Nice' }, { cc: 'HR', name: 'Dubrovnik' },
    { cc: 'DE', name: 'Munich' }, { cc: 'AT', name: 'Salzburg' },
  ],
  expeditions: [
    { title: 'Japan, cherry-blossom spring', year: 2019, startDate: '2019-04-02', endDate: '2019-04-16', countryCodes: ['JP'], journeys: [
      { mode: 'flight', operator: 'British Airways', from: 'LHR', to: 'HND', reference: 'BA007', date: '2019-04-02', distanceKm: 9580, durationMin: 720 },
      { mode: 'rail', operator: 'JR Shinkansen', from: 'Tokyo', to: 'Kyoto', reference: 'Nozomi', date: '2019-04-08', distanceKm: 452, durationMin: 140 },
    ] },
    { title: 'Iberia by rail', year: 2016, startDate: '2016-06-10', endDate: '2016-06-22', countryCodes: ['ES', 'PT'], journeys: [
      { mode: 'flight', operator: 'easyJet', from: 'LGW', to: 'LIS', reference: 'U28501', date: '2016-06-10', distanceKm: 1585, durationMin: 165 },
      { mode: 'rail', operator: 'CP', from: 'Lisbon', to: 'Porto', reference: 'AP', date: '2016-06-18', distanceKm: 313, durationMin: 170 },
    ] },
    { title: 'Grand tour of Italy', year: 2018, startDate: '2018-09-05', endDate: '2018-09-19', countryCodes: ['IT'], journeys: [
      { mode: 'flight', operator: 'ITA Airways', from: 'LGW', to: 'FCO', reference: 'AZ205', date: '2018-09-05', distanceKm: 1450, durationMin: 155 },
      { mode: 'rail', operator: 'Trenitalia', from: 'Rome', to: 'Florence', reference: 'Frecciarossa', date: '2018-09-12', distanceKm: 232, durationMin: 95 },
    ] },
    { title: 'Nordic summer', year: 2022, startDate: '2022-07-01', endDate: '2022-07-14', countryCodes: ['NO', 'IS'], journeys: [
      { mode: 'flight', operator: 'SAS', from: 'LHR', to: 'OSL', reference: 'SK810', date: '2022-07-01', distanceKm: 1160, durationMin: 130 },
      { mode: 'flight', operator: 'Icelandair', from: 'OSL', to: 'KEF', reference: 'FI319', date: '2022-07-08', distanceKm: 1900, durationMin: 200 },
    ] },
    { title: 'Middle East crossing', year: 2021, startDate: '2021-10-02', endDate: '2021-10-18', countryCodes: ['TR', 'JO', 'AE'], journeys: [
      { mode: 'flight', operator: 'Turkish Airlines', from: 'LHR', to: 'IST', reference: 'TK1980', date: '2021-10-02', distanceKm: 2500, durationMin: 240 },
      { mode: 'flight', operator: 'Royal Jordanian', from: 'IST', to: 'AMM', reference: 'RJ702', date: '2021-10-09', distanceKm: 1150, durationMin: 140 },
      { mode: 'flight', operator: 'Emirates', from: 'AMM', to: 'DXB', reference: 'EK904', date: '2021-10-14', distanceKm: 2020, durationMin: 190 },
    ] },
    { title: 'Southeast Asia loop', year: 2020, startDate: '2020-01-06', endDate: '2020-01-27', countryCodes: ['TH', 'VN', 'SG'], journeys: [
      { mode: 'flight', operator: 'Thai Airways', from: 'LHR', to: 'BKK', reference: 'TG917', date: '2020-01-06', distanceKm: 9540, durationMin: 700 },
      { mode: 'flight', operator: 'Vietnam Airlines', from: 'BKK', to: 'HAN', reference: 'VN610', date: '2020-01-15', distanceKm: 990, durationMin: 110 },
      { mode: 'flight', operator: 'Singapore Airlines', from: 'HAN', to: 'SIN', reference: 'SQ177', date: '2020-01-22', distanceKm: 2200, durationMin: 180 },
    ] },
  ],
};

const SAM_SRC = {
  dest: [
    { cc: 'US', name: 'United States', city: 'San Francisco', year: 2013, rel: ['lived', 'born'], cap: 'Fog rolling over the bay', disc: { n: 'Tartine Bakery', c: 'food', v: 'recommend', note: 'The morning bun is worth the queue.' } },
    { cc: 'MX', name: 'Mexico', city: 'Mexico City', year: 2015, cap: 'Rooftop tacos at dusk', disc: { n: 'A backstreet taco stand', c: 'food', v: 'hidden-gem', note: 'No sign, all locals, best al pastor of my life.' } },
    { cc: 'CA', name: 'Canada', city: 'Vancouver', year: 2016, cap: 'Seawall, early light', disc: { n: 'Stanley Park by bike', c: 'experience', v: 'recommend' } },
    { cc: 'LA', name: 'Laos', city: 'Luang Prabang', year: 2017, cap: 'Waterfalls all to ourselves', disc: { n: 'Kuang Si Falls', c: 'nature', v: 'hidden-gem' } },
    { cc: 'BR', name: 'Brazil', city: 'Rio de Janeiro', year: 2018, cap: 'Above the clouds', disc: { n: 'Cristo Redentor', c: 'culture', v: 'worth-visiting' } },
    { cc: 'PE', name: 'Peru', city: 'Cusco', year: 2019, cap: 'The climb was worth it', disc: { n: 'Machu Picchu at sunrise', c: 'nature', v: 'recommend', note: 'Take the first bus up. No regrets.' } },
    { cc: 'AU', name: 'Australia', city: 'Sydney', year: 2020, cap: 'Coogee, early morning', disc: { n: 'Bondi to Coogee coastal walk', c: 'experience', v: 'recommend' } },
    { cc: 'NZ', name: 'New Zealand', city: 'Queenstown', year: 2022, cap: 'Milford Sound, glass water', disc: { n: 'Kayaking Milford Sound', c: 'nature', v: 'hidden-gem' } },
    { cc: 'AR', name: 'Argentina', city: 'Buenos Aires', year: 2023, cap: 'Sunset over San Telmo', disc: { n: 'A late-night parrilla', c: 'food', v: 'recommend' } },
    { cc: 'CR', name: 'Costa Rica', city: 'Monteverde', year: 2024, cap: 'Cloud-forest mornings', disc: { n: 'The Monteverde cloud forest', c: 'nature', v: 'recommend' } },
    { cc: 'CL', name: 'Chile', city: 'Valparaíso', year: 2019, cap: 'Colour on every hill', disc: { n: 'Valparaíso street art', c: 'culture', v: 'hidden-gem' } },
    { cc: 'CO', name: 'Colombia', city: 'Cartagena', year: 2018, cap: 'Old town, warm stone', disc: { n: 'Walled-city Cartagena', c: 'culture', v: 'recommend' } },
    { cc: 'EC', name: 'Ecuador', city: 'Quito', year: 2019, cap: 'Rooftops of Quito', disc: { n: "Quito's old town", c: 'culture', v: 'worth-visiting' } },
    { cc: 'BO', name: 'Bolivia', city: 'Uyuni', year: 2019, cap: 'Sky and salt, no horizon', disc: { n: 'Salar de Uyuni', c: 'nature', v: 'recommend', note: 'Go at sunrise, mirror everywhere.' } },
    { cc: 'UY', name: 'Uruguay', city: 'Montevideo', year: 2023, cap: 'Slow afternoons on the rambla', disc: { n: 'A parrilla in the Mercado', c: 'food', v: 'worth-visiting' } },
    { cc: 'PA', name: 'Panama', city: 'Panama City', year: 2017, cap: 'Ships stacking up at the locks', disc: { n: 'The canal locks', c: 'culture', v: 'worth-visiting' } },
    { cc: 'GT', name: 'Guatemala', city: 'Antigua', year: 2016, cap: 'Volcanoes over the rooftops', disc: { n: 'Antigua at golden hour', c: 'experience', v: 'recommend' } },
    { cc: 'CU', name: 'Cuba', city: 'Havana', year: 2015, cap: 'Classic cars and jazz', disc: { n: 'A Havana jazz bar', c: 'experience', v: 'hidden-gem' } },
    { cc: 'DO', name: 'Dominican Republic', city: 'Punta Cana', year: 2016, cap: 'Palms and impossible blue' },
    { cc: 'JM', name: 'Jamaica', city: 'Kingston', year: 2017, cap: 'Hills above the harbour' },
    { cc: 'PH', name: 'Philippines', city: 'El Nido', year: 2018, cap: 'Turquoise and limestone' },
    { cc: 'MY', name: 'Malaysia', city: 'Kuala Lumpur', year: 2019, cap: 'Skyline and street food' },
    { cc: 'KH', name: 'Cambodia', city: 'Siem Reap', year: 2018, cap: 'Sunrise at the temples' },
    { cc: 'LK', name: 'Sri Lanka', city: 'Ella', year: 2019, cap: 'Tea hills down to the sea' },
    { cc: 'NP', name: 'Nepal', city: 'Kathmandu', year: 2020 },
    { cc: 'FJ', name: 'Fiji', city: 'Suva', year: 2022 },
    { cc: 'ZA', name: 'South Africa', city: 'Cape Town', year: 2021 },
    { cc: 'KE', name: 'Kenya', city: 'Nairobi', year: 2021 },
    { cc: 'TZ', name: 'Tanzania', city: 'Zanzibar', year: 2022 },
    { cc: 'CN', name: 'China', city: 'Shanghai', year: 2019 },
  ],
  extraCities: [
    { cc: 'US', name: 'New York' }, { cc: 'MX', name: 'Oaxaca' }, { cc: 'BR', name: 'São Paulo' },
    { cc: 'PE', name: 'Arequipa' }, { cc: 'AU', name: 'Melbourne' }, { cc: 'NZ', name: 'Auckland' },
    { cc: 'CO', name: 'Medellín' }, { cc: 'AR', name: 'Mendoza' },
  ],
  expeditions: [
    { title: 'Peru, the long way', year: 2019, startDate: '2019-05-04', endDate: '2019-05-20', countryCodes: ['PE'], journeys: [
      { mode: 'flight', operator: 'LATAM', from: 'SFO', to: 'LIM', reference: 'LA2477', date: '2019-05-04', distanceKm: 6790, durationMin: 510 },
      { mode: 'rail', operator: 'PeruRail', from: 'Cusco', to: 'Aguas Calientes', reference: 'Vistadome', date: '2019-05-12', distanceKm: 75, durationMin: 210 },
    ] },
    { title: 'Australia & NZ summer', year: 2020, startDate: '2020-01-08', endDate: '2020-01-28', countryCodes: ['AU', 'NZ'], journeys: [
      { mode: 'flight', operator: 'Qantas', from: 'LAX', to: 'SYD', reference: 'QF12', date: '2020-01-08', distanceKm: 12050, durationMin: 900 },
      { mode: 'flight', operator: 'Air New Zealand', from: 'SYD', to: 'ZQN', reference: 'NZ736', date: '2020-01-18', distanceKm: 1997, durationMin: 195 },
    ] },
    { title: 'Patagonia overland', year: 2023, startDate: '2023-11-02', endDate: '2023-11-20', countryCodes: ['AR', 'CL'], journeys: [
      { mode: 'flight', operator: 'LATAM', from: 'SFO', to: 'SCL', reference: 'LA601', date: '2023-11-02', distanceKm: 9600, durationMin: 640 },
      { mode: 'flight', operator: 'Aerolíneas Argentinas', from: 'SCL', to: 'EZE', reference: 'AR1276', date: '2023-11-12', distanceKm: 1140, durationMin: 130 },
    ] },
    { title: 'Central America', year: 2017, startDate: '2017-03-04', endDate: '2017-03-22', countryCodes: ['CR', 'PA', 'GT'], journeys: [
      { mode: 'flight', operator: 'Alaska', from: 'LAX', to: 'SJO', reference: 'AS230', date: '2017-03-04', distanceKm: 4400, durationMin: 380 },
      { mode: 'flight', operator: 'Copa', from: 'SJO', to: 'PTY', reference: 'CM401', date: '2017-03-12', distanceKm: 500, durationMin: 75 },
      { mode: 'flight', operator: 'Copa', from: 'PTY', to: 'GUA', reference: 'CM320', date: '2017-03-17', distanceKm: 1150, durationMin: 130 },
    ] },
    { title: 'Southeast Asia', year: 2018, startDate: '2018-06-02', endDate: '2018-06-24', countryCodes: ['KH', 'PH', 'MY'], journeys: [
      { mode: 'flight', operator: 'Philippine Airlines', from: 'SFO', to: 'MNL', reference: 'PR105', date: '2018-06-02', distanceKm: 11200, durationMin: 850 },
      { mode: 'flight', operator: 'Cebu Pacific', from: 'MNL', to: 'REP', reference: '5J257', date: '2018-06-11', distanceKm: 1600, durationMin: 170 },
      { mode: 'flight', operator: 'AirAsia', from: 'REP', to: 'KUL', reference: 'AK1467', date: '2018-06-18', distanceKm: 1050, durationMin: 120 },
    ] },
    { title: 'Southern Africa', year: 2021, startDate: '2021-08-03', endDate: '2021-08-23', countryCodes: ['ZA', 'KE', 'TZ'], journeys: [
      { mode: 'flight', operator: 'Delta', from: 'JFK', to: 'CPT', reference: 'DL200', date: '2021-08-03', distanceKm: 12550, durationMin: 900 },
      { mode: 'flight', operator: 'Kenya Airways', from: 'CPT', to: 'NBO', reference: 'KQ763', date: '2021-08-13', distanceKm: 3600, durationMin: 260 },
      { mode: 'flight', operator: 'Precision Air', from: 'NBO', to: 'ZNZ', reference: 'PW471', date: '2021-08-19', distanceKm: 700, durationMin: 90 },
    ] },
  ],
};

// How many memories / recommendations each demo life shows (≈3× the originals).
const CAPTURE_COUNT = 24;
const DISCOVERY_COUNT = 18;

/** Turn a destination table into the app-shaped arrays the builders consume. */
function expand(src) {
  const countries = src.dest.map((d) => ({
    countryCode: d.cc, name: d.name, relationships: d.rel ?? ['visited'], firstYear: d.year,
    livedFrom: d.livedFrom, livedTo: d.livedTo,
  }));
  const cities = [
    ...src.dest.map((d) => ({ countryCode: d.cc, name: d.city, firstYear: d.year })),
    ...(src.extraCities ?? []).map((e) => ({ countryCode: e.cc, name: e.name })),
  ];
  const captures = src.dest.filter((d) => d.cap).slice(0, CAPTURE_COUNT).map((d, i) => ({
    countryCode: d.cc, city: d.city, caption: d.cap, year: d.year, mo: ((i * 5) % 12) + 1,
  }));
  const discoveries = src.dest.filter((d) => d.disc).slice(0, DISCOVERY_COUNT).map((d, i) => ({
    name: d.disc.n, category: d.disc.c, countryCode: d.cc, city: d.city,
    verdict: d.disc.v, note: d.disc.note, year: d.year, mo: ((i * 7) % 12) + 1,
  }));
  return { countries, cities, discoveries, captures, expeditions: src.expeditions };
}

const ALEX = expand(ALEX_SRC);
const SAM = expand(SAM_SRC);

/** Country codes that need an embedded photo (every capture + discovery place). */
function neededPhotoCodes() {
  const set = new Set(['WW']);
  for (const data of [ALEX, SAM]) {
    for (const c of data.captures) if (c.countryCode) set.add(c.countryCode);
    for (const d of data.discoveries) if (d.countryCode) set.add(d.countryCode);
  }
  return [...set];
}

/** Build every op for one user (excluding auth + the shared connection). */
function planUser(uid, name, data) {
  const code = deterministicCode(uid);
  const ops = [
    { coll: 'codes', id: code, data: { uid, createdAt: SERVER() } },
    { coll: 'profiles', id: uid, data: { uid, code, name, createdAt: SERVER() } },
  ];
  for (const c of data.countries) ops.push(placeOp(uid, { ...c, kind: 'country' }));
  for (const c of data.cities) ops.push(placeOp(uid, { ...c, kind: 'city', relationships: ['visited'] }));
  for (const d of data.discoveries) ops.push(discoveryOp(uid, d));
  for (const e of data.expeditions) ops.push(expeditionOp(uid, e));
  for (const c of data.captures) ops.push(captureOp(uid, c));
  return { code, ops };
}

function connectionOp(aUid, bUid) {
  const [lo, hi] = aUid < bUid ? [aUid, bUid] : [bUid, aUid];
  return { coll: 'connections', id: `${lo}__${hi}`, data: {
    members: [aUid, bUid],
    status: 'accepted',
    requestedBy: aUid,
    names: { [aUid]: A_NAME, [bUid]: B_NAME },
    createdAt: SERVER(),
    updatedAt: SERVER(),
  } };
}

function summarize(label, data) {
  const total = data.countries.length + data.cities.length + data.discoveries.length + data.expeditions.length + data.captures.length;
  console.log(`   ${label}: ${data.countries.length} countries, ${data.cities.length} cities, ${data.discoveries.length} recommendations, ${data.expeditions.length} trips, ${data.captures.length} memories (${total} docs).`);
}

function printCredentials() {
  console.log('──────────────────────────────────────────────');
  console.log(' Give THIS account to App Review (App Store Connect →');
  console.log(' App Review Information → Sign-In Information):');
  console.log(`   Username: ${A_EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log('──────────────────────────────────────────────');
  console.log(` (Friend account, if you want it: ${B_EMAIL} / ${PASSWORD})\n`);
}

// ── dry run: validate + preview without any credentials ──────────────────────
async function dryRun() {
  console.log('\nDRY RUN — validating shapes, writing nothing.\n');
  const a = planUser('DEMO_UID_A', A_NAME, ALEX);
  const b = planUser('DEMO_UID_B', B_NAME, SAM);
  const conn = connectionOp('DEMO_UID_A', 'DEMO_UID_B');
  const all = [...a.ops, ...b.ops, conn];

  // Structural assertions matching the app's readers.
  const problems = [];
  for (const op of all) {
    if ('id' in op.data) problems.push(`${op.coll}: doc body must not contain an "id" field`);
    for (const [k, v] of Object.entries(op.data)) {
      if (v === undefined) problems.push(`${op.coll}.${k} is undefined (Firestore rejects undefined)`);
    }
    if (['places', 'discoveries', 'expeditions'].includes(op.coll) && !op.data.updatedAt) {
      problems.push(`${op.coll} is missing updatedAt`);
    }
    if (op.coll === 'captures' && 'updatedAt' in op.data) {
      problems.push('captures must NOT have updatedAt');
    }
    if ((op.coll === 'places' || op.coll === 'discoveries' || op.coll === 'captures') && op.data.userId == null) {
      problems.push(`${op.coll} missing userId`);
    }
  }
  // Photos usable() gate: data:image + length > 800.
  for (const op of all) {
    const url = op.data.dataUrl;
    if (op.coll === 'captures' && (!url?.startsWith('data:image') || url.length <= 800)) {
      problems.push('a capture photo would fail the app usable() gate');
    }
  }
  const byColl = all.reduce((m, o) => ((m[o.coll] = (m[o.coll] || 0) + 1), m), {});
  console.log('Docs that would be written:');
  for (const [c, n] of Object.entries(byColl)) console.log(`   ${c.padEnd(12)} ${n}`);
  console.log(`   ${'TOTAL'.padEnd(12)} ${all.length}\n`);
  summarize(A_NAME, ALEX);
  summarize(B_NAME, SAM);
  console.log(`\n   Friendship doc id: ${conn.id}  (status=${conn.data.status})`);
  console.log(`   ${A_NAME} share code: ${a.code} · ${B_NAME} share code: ${b.code}`);

  if (problems.length) {
    console.error(`\n❌ ${problems.length} shape problem(s):`);
    for (const p of [...new Set(problems)]) console.error('   - ' + p);
    process.exit(1);
  }
  console.log('\n✅ All doc shapes valid. Re-run without --dry-run (and with credentials) to write them.\n');
  printCredentials();
}

// ── live run ─────────────────────────────────────────────────────────────────
async function liveRun() {
  const { initializeApp, cert, applicationDefault } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getAuth } = await import('firebase-admin/auth');

  try {
    initializeApp({
      credential: KEY_PATH ? cert(JSON.parse(readFileSync(KEY_PATH, 'utf8'))) : applicationDefault(),
      projectId: PROJECT_ID,
    });
  } catch (e) {
    console.error('\nCould not initialise firebase-admin.');
    console.error('Provide a service-account key via --key <path> or GOOGLE_APPLICATION_CREDENTIALS,');
    console.error('or use --dry-run to preview without credentials.');
    console.error(String(e?.message || e));
    process.exit(1);
  }
  const db = getFirestore();
  const auth = getAuth();

  async function upsertUser(email, password, displayName) {
    try {
      const u = await auth.getUserByEmail(email);
      await auth.updateUser(u.uid, { password, displayName, emailVerified: true });
      return u.uid;
    } catch (e) {
      if (e?.code === 'auth/user-not-found') {
        const u = await auth.createUser({ email, password, displayName, emailVerified: true });
        return u.uid;
      }
      throw e;
    }
  }

  const OWNED = ['places', 'discoveries', 'expeditions', 'captures', 'trips', 'saved', 'covers'];
  async function wipeUser(uid) {
    for (const coll of OWNED) {
      const snap = await db.collection(coll).where('userId', '==', uid).get();
      if (snap.empty) continue;
      const batch = db.batch();
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    const pdoc = await db.collection('profiles').doc(uid).get();
    if (pdoc.exists && pdoc.data().code) {
      await db.collection('codes').doc(pdoc.data().code).delete().catch(() => {});
    }
    await db.collection('profiles').doc(uid).delete().catch(() => {});
  }

  async function applyOps(ops) {
    // Firestore batches cap at 500 writes; chunk to be safe.
    for (let i = 0; i < ops.length; i += 400) {
      const batch = db.batch();
      for (const op of ops.slice(i, i + 400)) {
        const ref = op.id ? db.collection(op.coll).doc(op.id) : db.collection(op.coll).doc();
        batch.set(ref, op.data);
      }
      await batch.commit();
    }
  }

  console.log(`\nSeeding demo accounts on project "${PROJECT_ID}"…\n`);
  const aUid = await upsertUser(A_EMAIL, PASSWORD, A_NAME);
  const bUid = await upsertUser(B_EMAIL, PASSWORD, B_NAME);
  console.log(`  ✓ ${A_NAME}  (${A_EMAIL})  uid=${aUid}`);
  console.log(`  ✓ ${B_NAME}  (${B_EMAIL})  uid=${bUid}`);

  console.log('  · clearing any previous seed for these two accounts…');
  await wipeUser(aUid);
  await wipeUser(bUid);
  for (const [x, y] of [[aUid, bUid], [bUid, aUid]]) {
    await db.collection('connections').doc(`${x}__${y}`).delete().catch(() => {});
  }

  console.log('  · seeding travel history…');
  await applyOps(planUser(aUid, A_NAME, ALEX).ops);
  await applyOps(planUser(bUid, B_NAME, SAM).ops);

  console.log('  · connecting them as friends…');
  await applyOps([connectionOp(aUid, bUid)]);

  console.log('\n✅ Done.');
  summarize(A_NAME, ALEX);
  summarize(B_NAME, SAM);
  console.log('   They are accepted friends, so each appears on the other\'s Circle feed.\n');
  printCredentials();
}

// --photo-codes: print the destinations that need an embedded photo (used by the
// photo-fetch step). No credentials needed.
if (has('photo-codes')) {
  console.log(JSON.stringify(neededPhotoCodes()));
  process.exit(0);
}

(DRY_RUN ? dryRun() : liveRun())
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('\n❌ Seeding failed:', e?.message || e);
    process.exit(1);
  });
