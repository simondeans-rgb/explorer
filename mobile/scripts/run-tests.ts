// First-line regression tests for the pure-function core: the import parsers
// and country matching. No test framework — plain asserts, run with
// `npm test` (tsx). Fails loudly with a non-zero exit for CI.
import assert from 'node:assert/strict';
import { buildImportPlan } from '../src/lib/flightyImport';
import { parseTakeout } from '../src/lib/takeoutImport';
import { parseCheckins } from '../src/lib/checkinsImport';
import { parsePolarsteps } from '../src/lib/polarstepsImport';
import { parseTripit } from '../src/lib/tripitImport';
import { parseCountryList, matchCountry, scanCountries } from '../src/lib/listImport';
import { matchExpedition, expeditionLabel } from '../src/lib/tripMatch';
import { buildCityGuides, guideKey } from '../src/lib/cityGuides';
import type { Discovery } from '../src/types';
import type { Expedition } from '../src/types';

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
  } catch (e) {
    console.error(`✗ ${name}`);
    throw e;
  }
}

// ---- Flight CSV (Flighty + header-alias sources) ---------------------------

test('flighty: canonical headers parse', () => {
  const plan = buildImportPlan('Date,From,To,Flight,Canceled\n2023-05-01,LHR,JFK,BA117,false\n', new Set(), []);
  assert.equal(plan.flightCount, 1);
  assert.ok(plan.places.some((p) => p.kind === 'country' && p.countryCode === 'GB'));
  assert.ok(plan.places.some((p) => p.kind === 'country' && p.countryCode === 'US'));
});

test('flight CSV: MyFlightradar24-style headers, wrapped IATA and dotted dates', () => {
  const csv = 'Flight date,Departure,Arrival,Flight number\n01.06.2022,"London Heathrow (LHR / EGLL)","New York JFK (JFK / KJFK)",BA173\n';
  const plan = buildImportPlan(csv, new Set(), []);
  assert.equal(plan.flightCount, 1);
  assert.ok(plan.expeditions.length >= 1);
  const leg = plan.expeditions[0].journeys[0];
  assert.equal(leg.date, '2022-06-01');
});

test('flight CSV: canceled flights and unknown airports are skipped', () => {
  const plan = buildImportPlan('Date,From,To,Canceled\n2023-05-01,LHR,JFK,true\n2023-05-02,???,JFK,false\n', new Set(), []);
  assert.equal(plan.flightCount, 0);
});

// ---- Google Takeout --------------------------------------------------------

test('takeout: reviews GeoJSON → verdicts, categories, dedupe', () => {
  const rows = parseTakeout(JSON.stringify({
    type: 'FeatureCollection',
    features: [
      { properties: { location: { name: 'Bar Brutal', country_code: 'ES' }, five_star_rating_published: 5, review_text_published: 'Superb' } },
      { properties: { location: { name: 'Tourist Trap Cafe', country_code: 'FR' }, five_star_rating_published: 2 } },
      { properties: { location: { name: 'Bar Brutal', country_code: 'ES' } } }, // duplicate
    ],
  }));
  assert.equal(rows.length, 2);
  assert.equal(rows[0].verdict, 'recommend');
  assert.equal(rows[0].countryCode, 'ES');
  assert.equal(rows[0].note, 'Superb');
  assert.equal(rows[0].category, 'food');
  assert.equal(rows[1].verdict, 'overrated');
});

test('takeout: saved-list CSV', () => {
  const rows = parseTakeout('Title,Note,URL\n"Hotel Okura","great lobby",http://x\nBondi Beach,,http://y\n');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].category, 'accommodation');
  assert.equal(rows[1].category, 'nature');
});

// ---- Swarm / Foursquare ----------------------------------------------------

test('checkins: venues → discoveries with categories and dedupe', () => {
  const rows = parseCheckins(JSON.stringify({
    items: [
      { venue: { name: 'Blue Bottle', location: { cc: 'US', city: 'SF' }, categories: [{ pluralName: 'Coffee Shops' }] }, shout: 'good' },
      { venue: { name: 'The Louvre', location: { cc: 'FR', city: 'Paris' }, categories: [{ name: 'Art Museum' }] } },
      { venue: { name: 'Blue Bottle', location: { cc: 'US' }, categories: [] } },
    ],
  }));
  assert.equal(rows.length, 2);
  assert.equal(rows[0].category, 'food');
  assert.equal(rows[0].note, 'good');
  assert.equal(rows[1].category, 'culture');
});

// ---- Polarsteps ------------------------------------------------------------

test('polarsteps: step-less trip falls back to name; compound name → both countries', () => {
  const r = parsePolarsteps(JSON.stringify([
    { name: 'USA & Mexico', start_date: 1562504085, end_date: 1563900000, all_steps: [] },
    { name: 'Spain', start_date: 1636221456, end_date: 1636739865, all_steps: [] },
  ]));
  assert.equal(r.expeditions.length, 2);
  assert.deepEqual([...r.expeditions[0].countryCodes].sort(), ['MX', 'US']);
  assert.equal(r.expeditions[1].startDate, '2021-11-06');
  const es = r.places.find((p) => p.countryCode === 'ES');
  assert.equal(es?.firstYear, 2021);
});

test('polarsteps: geocoded steps win and keep earliest year per country', () => {
  const r = parsePolarsteps(JSON.stringify([
    { name: 'Trip A', all_steps: [{ location: { country_code: 'JP', name: 'Kyoto' }, start_time: 1650000000 }] },
    { name: 'Trip B', all_steps: [{ location: { country_code: 'JP', name: 'Tokyo' }, start_time: 1450000000 }] },
  ]));
  const jp = r.places.find((p) => p.kind === 'country' && p.countryCode === 'JP');
  assert.equal(jp?.firstYear, 2015);
  assert.ok(r.places.some((p) => p.kind === 'city' && p.name === 'Kyoto'));
});

// ---- TripIt ----------------------------------------------------------------

test('tripit: VEVENT locations → countries + cities with years', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT', 'SUMMARY:Hotel', 'LOCATION:Tokyo\\, Japan', 'DTSTART:20230410T090000', 'END:VEVENT',
    'BEGIN:VEVENT', 'SUMMARY:Dinner', 'LOCATION:Barcelona\\, Spain', 'DTSTART;VALUE=DATE:20230715', 'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const { rows, events, matched } = parseTripit(ics);
  assert.equal(events, 2);
  assert.equal(matched, 2);
  assert.ok(rows.some((r) => r.kind === 'country' && r.countryCode === 'JP' && r.firstYear === 2023));
  assert.ok(rows.some((r) => r.kind === 'city' && r.name === 'Barcelona'));
});

// ---- Country matching ------------------------------------------------------

test('country list: names, aliases, city pairs', () => {
  const { rows, unmatched } = parseCountryList('Japan\nKyoto, Japan\nUSA\nNarnia');
  assert.ok(rows.some((r) => r.kind === 'city' && r.name === 'Kyoto' && r.countryCode === 'JP'));
  assert.ok(rows.some((r) => r.kind === 'country' && r.countryCode === 'US'));
  assert.deepEqual(unmatched, ['Narnia']);
  assert.equal(matchCountry('gb'), 'GB');
});

test('scanCountries: word-boundary match, no false hits', () => {
  assert.deepEqual(scanCountries('Flight to Tokyo, Japan '), ['JP']);
  assert.deepEqual(scanCountries('Meeting Mr Chadwick at noon'), []);
});

// ---- Photo → trip matching -------------------------------------------------

const exp = (id: string, title: string, codes: string[], start: string, end?: string): Expedition => ({
  id, userId: 'me', title, countryCodes: codes, startDate: start, endDate: end,
  journeys: [], createdAt: 0, updatedAt: 0,
});

test('tripMatch: photo taken during a trip wins over country-only', () => {
  const trips = [
    exp('a', 'Spain', ['ES'], '2025-06-01', '2025-06-10'),
    exp('b', 'Spain again', ['ES'], '2025-09-01', '2025-09-05'),
  ];
  const during = new Date(2025, 5, 4).getTime(); // 4 Jun 2025
  assert.equal(matchExpedition(trips, { countryCode: 'ES', takenAt: during })?.id, 'a');
});

test('tripMatch: grace window catches the flight home; no match ⇒ undefined', () => {
  const trips = [exp('a', 'Japan', ['JP'], '2024-03-10', '2024-03-20')];
  const dayAfter = new Date(2024, 2, 21).getTime();
  assert.equal(matchExpedition(trips, { takenAt: dayAfter })?.id, 'a');
  const monthsLater = new Date(2024, 7, 1).getTime();
  assert.equal(matchExpedition(trips, { takenAt: monthsLater, countryCode: 'FR' }), undefined);
});

test('tripMatch: country + same year fallback when the date misses the range', () => {
  const trips = [exp('a', 'Spain', ['ES'], '2025-06-01', '2025-06-10')];
  const sameYear = new Date(2025, 10, 2).getTime();
  assert.equal(matchExpedition(trips, { countryCode: 'ES', takenAt: sameYear })?.id, 'a');
});

test('expeditionLabel: adds month + year unless the title already has it', () => {
  assert.equal(expeditionLabel(exp('a', 'Spain', ['ES'], '2021-11-06')), 'Spain · Nov 2021');
  assert.equal(expeditionLabel(exp('a', 'Spain 2021', ['ES'], '2021-11-06')), 'Spain 2021');
});

// ---- City guides -------------------------------------------------------------

let dseq = 0;
const disc = (name: string, city: string, cc: string, verdict?: Discovery['verdict'], userId = 'me'): Discovery => ({
  id: `d${dseq++}`, userId, name, category: 'food', city, countryCode: cc, verdict,
  createdAt: dseq, updatedAt: dseq,
});

test('cityGuides: groups by city, ranks gems first, dedupes same-person repeats', () => {
  const mine = [
    disc('Cafe A', 'Lisbon', 'PT', 'worth-visiting'),
    disc('Bar B', 'Lisbon', 'PT', 'hidden-gem'),
    disc('Bar B', 'Lisbon', 'PT', 'hidden-gem'), // duplicate from same person
    disc('No City', '', 'PT', 'recommend'), // no city → no guide
  ];
  const friendD = [disc('Tasca C', 'lisbon', 'PT', 'recommend', 'f1')];
  const guides = buildCityGuides(mine, friendD, [{ uid: 'f1', name: 'Anna Smith' }]);
  assert.equal(guides.length, 1);
  const g = guides[0];
  assert.equal(g.key, guideKey('PT', 'Lisbon'));
  assert.equal(g.entries.length, 3);
  assert.equal(g.entries[0].discovery.name, 'Bar B'); // gem outranks recommend
  assert.equal(g.gems, 1);
  assert.deepEqual(g.contributors.sort(), ['Anna', 'You']);
});

test('cityGuides: richer guides sort first', () => {
  const mine = [
    disc('P1', 'Porto', 'PT'), disc('P2', 'Porto', 'PT'),
    disc('T1', 'Tokyo', 'JP'),
  ];
  const guides = buildCityGuides(mine, [], []);
  assert.equal(guides[0].city, 'Porto');
});

// ---- miniPdf --------------------------------------------------------------
import { jpegsToPdf, base64ToBytes, bytesToBase64 } from '../src/lib/miniPdf';

test('miniPdf: base64 round-trips bytes', () => {
  const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255, 137, 80]);
  assert.deepEqual([...base64ToBytes(bytesToBase64(bytes))], [...bytes]);
  assert.equal(bytesToBase64(new Uint8Array([77])), 'TQ==');
  // large enough to cross several encoder flush boundaries, all lengths mod 3
  for (const len of [100000, 100001, 100002]) {
    const big = new Uint8Array(len);
    for (let i = 0; i < len; i++) big[i] = (i * 31 + 7) & 0xff;
    const round = base64ToBytes(bytesToBase64(big));
    assert.equal(round.length, len);
    for (let i = 0; i < len; i += 997) assert.equal(round[i], big[i]);
    assert.equal(round[len - 1], big[len - 1]);
  }
});

test('miniPdf: builds a structurally valid two-page PDF', () => {
  // A tiny stand-in JPEG payload — structure is what's under test.
  const fakeJpeg = bytesToBase64(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]));
  const pdf = jpegsToPdf(
    [
      { base64: fakeJpeg, width: 100, height: 50 },
      { base64: fakeJpeg, width: 100, height: 50 },
    ],
    720,
    1018,
  );
  const text = String.fromCharCode(...pdf);
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.ok(text.includes('/Count 2'));
  assert.ok(text.includes('/MediaBox [0 0 720 1018]'));
  assert.ok(text.includes('/Filter /DCTDecode'));
  assert.ok(text.trimEnd().endsWith('%%EOF'));
  // xref offsets must point at their objects
  const xrefAt = Number(text.split('startxref')[1].trim().split('\n')[0]);
  assert.equal(text.slice(xrefAt, xrefAt + 4), 'xref');
});

// ---- almanacStory -----------------------------------------------------------
import { buildAlmanacStory, flightSentence, withArticle } from '../src/lib/almanacStory';

test('almanacStory: prologue tells first trip, first flight and loves', () => {
  const exp = (id: string, startDate: string, codes: string[], journeys: object[] = []) => ({
    id, userId: 'u', title: id, startDate, countryCodes: codes, journeys, createdAt: 0, updatedAt: 0,
  });
  const expeditions = [
    exp('a', '2015-07-10', ['ES'], [{ id: 'j1', mode: 'flight', operator: 'British Airways', vehicle: 'Airbus A320', from: 'LHR', to: 'MAD', distanceKm: 1264 }]),
    exp('b', '2019-03-02', ['ES']),
  ];
  const discoveries = [
    { id: 'd1', userId: 'u', name: 'Café Lola', category: 'food', city: 'Seville', verdict: 'hidden-gem', createdAt: 0, updatedAt: 0 },
  ];
  const paras = buildAlmanacStory({
    expeditions: expeditions as never,
    discoveries: discoveries as never,
    countryName: (c) => (c === 'ES' ? 'Spain' : c),
    formatMiles: (mi) => `${Math.round(mi)} mi`,
  });
  assert.ok(paras[0].includes('Spain'));
  assert.ok(paras[0].includes('summer of 2015'));
  assert.ok(paras.some((p) => p.includes('British Airways') && p.includes('an Airbus A320')));
  assert.ok(paras.some((p) => p.includes('Café Lola')));
  assert.ok(paras.some((p) => p.includes('Spain keeps calling you back')));
});

test('almanacStory: home country excluded, definite articles applied', () => {
  const exp = (id: string, startDate: string, codes: string[]) => ({
    id, userId: 'u', title: id, startDate, countryCodes: codes, journeys: [], createdAt: 0, updatedAt: 0,
  });
  const names: Record<string, string> = { GB: 'United Kingdom', US: 'United States' };
  const paras = buildAlmanacStory({
    expeditions: [exp('home', '2019-04-01', ['GB']), exp('away', '2021-06-05', ['US'])] as never,
    discoveries: [] as never,
    countryName: (c) => names[c] ?? c,
    homeCodes: new Set(['GB']),
  });
  assert.ok(paras[0].includes('first overseas trip was to the United States'));
  assert.ok(paras[0].includes('summer of 2021'));
});

test('almanacStory: articles and per-trip flight sentence', () => {
  assert.equal(withArticle('Airbus A320'), 'an Airbus A320');
  assert.equal(withArticle('Boeing 777'), 'a Boeing 777');
  assert.equal(flightSentence([{ id: 'x', mode: 'flight', operator: 'Iberia' }] as never), 'You flew with Iberia.');
  assert.equal(flightSentence([{ id: 'x', mode: 'rail' }] as never), null);
});

// ---- tripMerge --------------------------------------------------------------
import { suggestTripMerges, buildMergedExpedition } from '../src/lib/tripMerge';

const mkTrip = (id: string, startDate: string, endDate: string | undefined, codes: string[], journeys: object[]) => ({
  id, userId: 'u', title: id, startDate, endDate, countryCodes: codes, journeys, createdAt: 0, updatedAt: 0,
});
const leg = (from: string, to: string, date?: string) => ({ id: `${from}-${to}`, mode: 'flight', from, to, date });

test('tripMerge: chained bookings merge; distant trips stay separate', () => {
  const trips = [
    mkTrip('out', '2025-03-20', '2025-03-20', ['HK'], [leg('London (LHR)', 'Hong Kong (HKG)', '2025-03-20')]),
    mkTrip('back', '2025-03-26', '2025-03-26', ['HK', 'GB'], [leg('Hong Kong (HKG)', 'London (LHR)', '2025-03-26')]),
    mkTrip('later', '2025-06-10', '2025-06-14', ['DE'], [leg('London (LGW)', 'Berlin (BER)', '2025-06-10')]),
  ];
  const out = suggestTripMerges(trips as never, { countryName: (c) => ({ HK: 'Hong Kong', GB: 'United Kingdom', DE: 'Germany' })[c] ?? c, homeCodes: new Set(['GB']) });
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].ids, ['out', 'back']);
  assert.equal(out[0].journeyCount, 2);
  assert.ok(out[0].title.includes('Hong Kong'));
  assert.ok(out[0].reason.includes('HKG'));
});

test('tripMerge: overlapping dates merge; chain breaks without matching endpoint', () => {
  const trips = [
    mkTrip('a', '2025-02-01', '2025-02-10', ['ES'], [leg('London (LHR)', 'Madrid (MAD)')]),
    mkTrip('b', '2025-02-08', '2025-02-12', ['PT'], [leg('Madrid (MAD)', 'Lisbon (LIS)')]),
    mkTrip('c', '2025-02-20', '2025-02-22', ['FR'], [leg('London (LHR)', 'Paris (CDG)')]),
  ];
  const out = suggestTripMerges(trips as never, { countryName: (c) => c });
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].ids, ['a', 'b']);
  const merged = buildMergedExpedition(trips.slice(0, 2) as never, 'X');
  assert.equal(merged.startDate, '2025-02-01');
  assert.equal(merged.endDate, '2025-02-12');
  assert.deepEqual(merged.countryCodes, ['ES', 'PT']);
  assert.equal(merged.journeys.length, 2);
});

// ---- Tiers & seasonal covers ------------------------------------------------
import { WANDERER_LIMITS, ANNUAL_HEADLINE, EXPLORER_BENEFITS } from '../src/lib/limits';
import { seasonActive, lockProgress } from '../src/lib/coverRules';

test('limits: wanderer caps are sane and explorer copy carries the annual-first price', () => {
  assert.equal(WANDERER_LIMITS.countries, 25);
  assert.equal(WANDERER_LIMITS.cities, 50);
  assert.equal(WANDERER_LIMITS.discoveries, 10);
  assert.equal(WANDERER_LIMITS.circle, 3);
  assert.equal(WANDERER_LIMITS.flightLookupsPerMonth, 10);
  assert.equal(WANDERER_LIMITS.itineraries, 1);
  assert.ok(ANNUAL_HEADLINE.startsWith('£39.99/year'));
  assert.ok(EXPLORER_BENEFITS.length >= 6);
});

test('covers: season windows — Halloween October only, Christmas wraps Dec–Jan, no season = always', () => {
  const halloween = { months: [10], returns: 'Returns in October' };
  const christmas = { months: [11, 12, 1], returns: 'Returns in November' };
  assert.equal(seasonActive(halloween, 10), true);
  assert.equal(seasonActive(halloween, 7), false);
  assert.equal(seasonActive(christmas, 12), true);
  assert.equal(seasonActive(christmas, 1), true); // wraps into the new year
  assert.equal(seasonActive(christmas, 7), false);
  assert.equal(seasonActive(undefined, 7), true); // year-round packs
});

test('covers: lock progress shows the user how close they are', () => {
  const neon = { name: 'Neon', title: 'Neon', tagline: '', preview: 0, unlock: { countries: 25 } };
  assert.equal(lockProgress(neon, 19, 3), 'Explore 25 countries — you have 19');
  assert.equal(lockProgress(neon, 25, 3), null); // earned
  const luxury = { name: 'Luxury', title: 'Luxury', tagline: '', preview: 0, unlock: { level: 8 } };
  assert.equal(lockProgress(luxury, 40, 5), "Reach Level 8 — you're Level 5");
});

// ---- Offline city lookup ----------------------------------------------------
import { cityAt } from '../src/lib/cityLookup';

test('cityLookup: resolves major cities, respects country filter, null in the wild', () => {
  assert.equal(cityAt(2.35, 48.86)?.name, 'Paris');
  assert.equal(cityAt(2.35, 48.86)?.countryCode, 'FR');
  assert.equal(cityAt(-0.13, 51.51)?.name, 'London');
  // Heathrow (~24km out) still counts as London thanks to the big-city radius.
  assert.equal(cityAt(-0.45, 51.47, 'GB')?.name, 'London');
  // A coordinate in Geneva must not match anything French when filtered to FR.
  assert.notEqual(cityAt(6.14, 46.2, 'FR')?.name ?? null, 'Geneva');
  // Mid-Atlantic: nothing.
  assert.equal(cityAt(-30, 30), null);
});

// ---- "On this day" memories -------------------------------------------------
import { todaysMemories } from '../src/lib/memories';

test('memories: only earlier-year same-month/day events count, oldest first', () => {
  const now = new Date(2026, 6, 17); // 17 Jul 2026
  const trips = [
    { id: 't1', title: 'Tokyo adventure', countryCodes: ['JP'], startDate: '2023-07-17', journeys: [] },
    { id: 't2', title: 'Wrong day', countryCodes: ['FR'], startDate: '2023-07-16', journeys: [] },
    { id: 't3', title: 'Wrong month', countryCodes: ['DE'], startDate: '2023-06-17', journeys: [] },
    { id: 't4', title: 'Today this year', countryCodes: ['US'], startDate: '2026-07-17', journeys: [] },
    { id: 't5', title: '', countryCodes: ['IT'], startDate: '2019-07-17', journeys: [] },
  ] as never[];
  const places = [
    { id: 'p1', kind: 'country', countryCode: 'ES', name: 'Spain', firstDate: '2021-07-17' },
    { id: 'p2', kind: 'country', countryCode: 'PT', name: 'Portugal', firstDate: '2021-12-25' },
  ] as never[];
  const out = todaysMemories(trips, places, now);
  assert.equal(out.length, 3);
  // Oldest first: 2019 trip (7y), 2021 place (5y), 2023 trip (3y).
  assert.deepEqual(out.map((m) => m.yearsAgo), [7, 5, 3]);
  assert.equal(out[0].label, 'Italy'); // untitled trip falls back to country name
  assert.equal(out[0].kind, 'trip');
  assert.equal(out[1].label, 'Spain');
  assert.equal(out[1].kind, 'place');
  assert.equal(out[1].countryCode, 'ES');
  assert.equal(out[2].label, 'Tokyo adventure');
  assert.equal(out[2].countryCode, 'JP');
});

test('memories: undated or malformed dates never match', () => {
  const now = new Date(2026, 6, 17);
  const trips = [
    { id: 't1', title: 'No date', countryCodes: ['JP'], journeys: [] },
    { id: 't2', title: 'Garbage', countryCodes: ['FR'], startDate: 'July 17th', journeys: [] },
  ] as never[];
  assert.deepEqual(todaysMemories(trips, [], now), []);
});

// ---- Passport Cover Engine --------------------------------------------------
import { geometryFingerprint } from '../covers-engine/src/geometry';
import { COVER_THEMES } from '../src/lib/coverThemes.gen';

test('cover engine: the protected W geometry is locked', () => {
  // The Worldly mark is the brand. If this fails, geometry.ts was edited —
  // that must be a deliberate brand decision, not a side effect.
  assert.equal(geometryFingerprint(), '82a653b6');
});

test('cover engine: every theme is complete and well-formed', () => {
  const hex = /^#[0-9A-F]{6}$/i;
  const names = Object.keys(COVER_THEMES);
  assert.ok(names.length >= 27);
  assert.ok(names.includes('Classic'));
  for (const t of Object.values(COVER_THEMES)) {
    assert.ok(hex.test(t.accent), `${t.icon} accent`);
    assert.equal(t.gradient.length, 2, `${t.icon} gradient`);
    assert.ok(t.gradient.every((g) => hex.test(g)), `${t.icon} gradient hex`);
    assert.ok(hex.test(t.androidBg), `${t.icon} androidBg`);
    if (t.particles !== 'none') assert.ok(t.particleColors.length > 0, `${t.icon} particleColors`);
  }
});

console.log(`✓ all ${passed} tests passed`);
