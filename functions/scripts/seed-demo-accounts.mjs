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
// Distinct regions so the two maps and the Circle feed clearly differ.
const ALEX = {
  countries: [
    { countryCode: 'GB', name: 'United Kingdom', relationships: ['lived', 'born'], firstYear: 2014 },
    { countryCode: 'PT', name: 'Portugal', relationships: ['lived'], firstYear: 2015, livedFrom: '2015-03', livedTo: '2018-09' },
    { countryCode: 'ES', name: 'Spain', relationships: ['visited'], firstYear: 2016 },
    { countryCode: 'FR', name: 'France', relationships: ['visited'], firstYear: 2017 },
    { countryCode: 'IT', name: 'Italy', relationships: ['visited'], firstYear: 2018 },
    { countryCode: 'JP', name: 'Japan', relationships: ['visited'], firstYear: 2019 },
    { countryCode: 'TH', name: 'Thailand', relationships: ['visited'], firstYear: 2020 },
    { countryCode: 'MA', name: 'Morocco', relationships: ['visited'], firstYear: 2022 },
    { countryCode: 'IS', name: 'Iceland', relationships: ['visited'], firstYear: 2023 },
    { countryCode: 'GR', name: 'Greece', relationships: ['visited'], firstYear: 2024 },
  ],
  cities: [
    { countryCode: 'GB', name: 'London' }, { countryCode: 'PT', name: 'Lisbon' },
    { countryCode: 'PT', name: 'Porto' }, { countryCode: 'ES', name: 'Barcelona' },
    { countryCode: 'FR', name: 'Paris' }, { countryCode: 'IT', name: 'Rome' },
    { countryCode: 'JP', name: 'Tokyo' }, { countryCode: 'JP', name: 'Kyoto' },
    { countryCode: 'GR', name: 'Athens' }, { countryCode: 'IS', name: 'Reykjavik' },
  ],
  discoveries: [
    { name: 'Time Out Market', category: 'food', countryCode: 'PT', city: 'Lisbon', verdict: 'recommend', note: 'Go hungry — one stall for every mood.', year: 2017 },
    { name: 'Park Güell at opening', category: 'culture', countryCode: 'ES', city: 'Barcelona', verdict: 'recommend', year: 2016 },
    { name: 'Fushimi Inari before dawn', category: 'experience', countryCode: 'JP', city: 'Kyoto', verdict: 'hidden-gem', note: 'Beat the crowds — the empty gates are unreal.', year: 2019 },
    { name: 'A tiny ramen bar in Shinjuku', category: 'food', countryCode: 'JP', city: 'Tokyo', verdict: 'hidden-gem', year: 2019 },
    { name: 'Jemaa el-Fnaa at night', category: 'culture', countryCode: 'MA', city: 'Marrakesh', verdict: 'recommend', year: 2022 },
    { name: 'The Blue Lagoon', category: 'nature', countryCode: 'IS', city: 'Reykjavik', verdict: 'worth-visiting', note: 'Touristy but worth it once.', year: 2023 },
  ],
  expeditions: [
    {
      title: 'Japan, cherry-blossom spring', year: 2019, startDate: '2019-04-02', endDate: '2019-04-16', countryCodes: ['JP'],
      journeys: [
        { mode: 'flight', operator: 'British Airways', from: 'LHR', to: 'HND', reference: 'BA007', date: '2019-04-02', distanceKm: 9580, durationMin: 720 },
        { mode: 'rail', operator: 'JR Shinkansen', from: 'Tokyo', to: 'Kyoto', reference: 'Nozomi', date: '2019-04-08', distanceKm: 452, durationMin: 140 },
      ],
    },
    {
      title: 'Iberia by rail', year: 2016, startDate: '2016-06-10', endDate: '2016-06-22', countryCodes: ['ES', 'PT'],
      journeys: [
        { mode: 'flight', operator: 'easyJet', from: 'LGW', to: 'LIS', reference: 'U28501', date: '2016-06-10', distanceKm: 1585, durationMin: 165 },
        { mode: 'rail', operator: 'CP', from: 'Lisbon', to: 'Porto', reference: 'AP', date: '2016-06-18', distanceKm: 313, durationMin: 170 },
      ],
    },
  ],
  captures: [
    { countryCode: 'PT', city: 'Lisbon', caption: 'Golden hour over the Tejo', year: 2017, mo: 5 },
    { countryCode: 'JP', city: 'Kyoto', caption: 'The empty torii at dawn', year: 2019, mo: 4 },
    { countryCode: 'IS', city: 'Reykjavik', caption: 'Somewhere on the ring road', year: 2023, mo: 9 },
    { countryCode: 'MA', city: 'Marrakesh', caption: 'Lost in the medina', year: 2022, mo: 10 },
    { countryCode: 'GR', city: 'Athens', caption: 'Rooftop sunset, last night', year: 2024, mo: 7 },
    { countryCode: 'ES', city: 'Barcelona', caption: 'Gaudí against the blue', year: 2016, mo: 6 },
    { countryCode: 'IT', city: 'Rome', caption: 'Espresso and old stone', year: 2018, mo: 9 },
    { countryCode: 'JP', city: 'Tokyo', caption: 'Shinjuku after the rain', year: 2019, mo: 4 },
  ],
};

const SAM = {
  countries: [
    { countryCode: 'US', name: 'United States', relationships: ['lived', 'born'], firstYear: 2013 },
    { countryCode: 'MX', name: 'Mexico', relationships: ['visited'], firstYear: 2015 },
    { countryCode: 'CA', name: 'Canada', relationships: ['visited'], firstYear: 2016 },
    { countryCode: 'VN', name: 'Vietnam', relationships: ['visited'], firstYear: 2017 },
    { countryCode: 'BR', name: 'Brazil', relationships: ['visited'], firstYear: 2018 },
    { countryCode: 'PE', name: 'Peru', relationships: ['visited'], firstYear: 2019 },
    { countryCode: 'AU', name: 'Australia', relationships: ['visited'], firstYear: 2020 },
    { countryCode: 'NZ', name: 'New Zealand', relationships: ['visited'], firstYear: 2022 },
    { countryCode: 'AR', name: 'Argentina', relationships: ['visited'], firstYear: 2023 },
    { countryCode: 'CR', name: 'Costa Rica', relationships: ['visited'], firstYear: 2024 },
  ],
  cities: [
    { countryCode: 'US', name: 'San Francisco' }, { countryCode: 'US', name: 'New York' },
    { countryCode: 'MX', name: 'Mexico City' }, { countryCode: 'CA', name: 'Vancouver' },
    { countryCode: 'BR', name: 'Rio de Janeiro' }, { countryCode: 'PE', name: 'Cusco' },
    { countryCode: 'AU', name: 'Sydney' }, { countryCode: 'NZ', name: 'Queenstown' },
    { countryCode: 'AR', name: 'Buenos Aires' }, { countryCode: 'VN', name: 'Hanoi' },
  ],
  // Recent verdicts — these are what surface on Alex's Circle feed.
  discoveries: [
    { name: 'Tartine Bakery', category: 'food', countryCode: 'US', city: 'San Francisco', verdict: 'recommend', note: 'The morning bun is worth the queue.', daysAgo: 8 },
    { name: 'Machu Picchu at sunrise', category: 'nature', countryCode: 'PE', city: 'Cusco', verdict: 'recommend', note: 'Take the first bus up. No regrets.', daysAgo: 15 },
    { name: 'Bondi to Coogee coastal walk', category: 'experience', countryCode: 'AU', city: 'Sydney', verdict: 'recommend', daysAgo: 22 },
    { name: 'A backstreet taco stand', category: 'food', countryCode: 'MX', city: 'Mexico City', verdict: 'hidden-gem', note: 'No sign, all locals, best al pastor of my life.', daysAgo: 30 },
    { name: 'Cristo Redentor', category: 'culture', countryCode: 'BR', city: 'Rio de Janeiro', verdict: 'worth-visiting', daysAgo: 40 },
    { name: 'Kayaking Milford Sound', category: 'nature', countryCode: 'NZ', city: 'Queenstown', verdict: 'hidden-gem', daysAgo: 48 },
  ],
  expeditions: [
    {
      title: 'Peru, the long way', year: 2019, startDate: '2019-05-04', endDate: '2019-05-20', countryCodes: ['PE'],
      journeys: [
        { mode: 'flight', operator: 'LATAM', from: 'SFO', to: 'LIM', reference: 'LA2477', date: '2019-05-04', distanceKm: 6790, durationMin: 510 },
        { mode: 'rail', operator: 'PeruRail', from: 'Cusco', to: 'Aguas Calientes', reference: 'Vistadome', date: '2019-05-12', distanceKm: 75, durationMin: 210 },
      ],
    },
    {
      title: 'Australia & NZ summer', year: 2020, startDate: '2020-01-08', endDate: '2020-01-28', countryCodes: ['AU', 'NZ'],
      journeys: [
        { mode: 'flight', operator: 'Qantas', from: 'LAX', to: 'SYD', reference: 'QF12', date: '2020-01-08', distanceKm: 12050, durationMin: 900 },
        { mode: 'flight', operator: 'Air New Zealand', from: 'SYD', to: 'ZQN', reference: 'NZ736', date: '2020-01-18', distanceKm: 1997, durationMin: 195 },
      ],
    },
  ],
  captures: [
    { countryCode: 'PE', city: 'Cusco', caption: 'The climb was worth it', year: 2019, mo: 5 },
    { countryCode: 'AU', city: 'Sydney', caption: 'Coogee, early morning', year: 2020, mo: 1 },
    { countryCode: 'NZ', city: 'Queenstown', caption: 'Milford Sound, glass water', year: 2020, mo: 1 },
    { countryCode: 'MX', city: 'Mexico City', caption: 'Rooftop tacos', year: 2015, mo: 11 },
    { countryCode: 'BR', city: 'Rio de Janeiro', caption: 'Above the clouds', year: 2018, mo: 2 },
    { countryCode: 'US', city: 'San Francisco', caption: 'Fog rolling over the bay', year: 2021, mo: 8 },
    { countryCode: 'VN', city: 'Hanoi', caption: 'Old Quarter, blue hour', year: 2017, mo: 3 },
    { countryCode: 'AR', city: 'Buenos Aires', caption: 'Sunset over San Telmo', year: 2023, mo: 11 },
  ],
};

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

(DRY_RUN ? dryRun() : liveRun())
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('\n❌ Seeding failed:', e?.message || e);
    process.exit(1);
  });
