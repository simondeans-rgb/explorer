// Build entry: renders every engine-owned cover + a review contact sheet.
//   npm run covers:build            — all engine covers
//   npm run covers:build -- summit  — one cover
import { join } from 'node:path';
import { VOYAGER_RECIPES } from './recipes/voyager';
import { CATALOGUE_RECIPES } from './recipes/catalogue';
import { renderCoverAssets, contactSheet } from './render';

const ALL_RECIPES = { ...VOYAGER_RECIPES, ...CATALOGUE_RECIPES };
const only = process.argv[2];

async function main() {
  const entries = Object.entries(ALL_RECIPES).filter(([slug]) => !only || slug === only);
  for (const [slug, recipe] of entries) {
    await renderCoverAssets(slug, recipe());
    console.log('rendered', slug);
  }
  const sheet = join(__dirname, '..', 'contact-sheet.png');
  await contactSheet(entries.map(([s]) => s), sheet);
  console.log('contact sheet →', sheet);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
