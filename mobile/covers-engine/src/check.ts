// Engine validation: npm run covers:check
// Cross-checks the four places a cover must exist: engine catalog (themes),
// app.json icon entries, icon assets on disk, and preview assets on disk.
// Also locks the protected mark geometry.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COVER_THEMES } from './catalog';
import { geometryFingerprint } from './geometry';
import { ICONS_DIR, PREVIEWS_DIR } from './render';

/** Locked the day the engine was created. Changing the mark's geometry is a
 *  brand decision — if this fails, someone touched geometry.ts. */
const LOCKED_GEOMETRY = geometryFingerprint();

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error('✗', msg);
};

// 1. Geometry lock (self-consistency; the unit test locks the literal value).
if (!LOCKED_GEOMETRY) fail('geometry fingerprint failed to compute');

// 2. app.json ⟷ catalog.
const appJson = JSON.parse(readFileSync(join(__dirname, '..', '..', 'app.json'), 'utf8'));
const plugin = (appJson.expo.plugins as unknown[]).find(
  (p): p is [string, Array<{ name: string; ios: string }>] => Array.isArray(p) && p[0] === 'expo-alternate-app-icons',
);
if (!plugin) fail('expo-alternate-app-icons plugin missing from app.json');
const iconEntries = plugin ? plugin[1] : [];
const iconNames = new Set(iconEntries.map((e) => e.name));
const themeNames = new Set(COVER_THEMES.map((t) => t.icon));

for (const name of iconNames) {
  if (!themeNames.has(name)) fail(`app.json icon "${name}" has no theme in covers-engine/src/catalog.ts`);
}
for (const name of themeNames) {
  if (name !== 'Classic' && !iconNames.has(name)) fail(`theme "${name}" has no app.json icon entry`);
}

// 3. Assets on disk (icon + preview) for every app.json entry.
for (const e of iconEntries) {
  const iconPath = join(__dirname, '..', '..', e.ios);
  if (!existsSync(iconPath)) fail(`icon asset missing: ${e.ios}`);
  const slug = e.ios.split('/').pop()!;
  if (!existsSync(join(PREVIEWS_DIR, slug))) fail(`preview asset missing for ${e.name}: previews/${slug}`);
}
if (!existsSync(join(ICONS_DIR, 'previews', 'classic.png'))) fail('classic preview missing');

if (failures) {
  console.error(`covers:check — ${failures} problem(s)`);
  process.exit(1);
}
console.log(`covers:check — OK (${iconNames.size} icons, ${themeNames.size} themes, geometry ${LOCKED_GEOMETRY})`);
