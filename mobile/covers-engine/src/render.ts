/** Deterministic renderer: Scene → SVG → PNG assets. Uses resvg (no browser),
 *  so `npm run covers:build` works identically on any machine and in CI. */
import { Resvg } from '@resvg/resvg-js';
import sharp, { type OverlayOptions } from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { composeSvg, type Scene } from './compose';

export const ICONS_DIR = join(__dirname, '..', '..', 'assets', 'icons', 'covers');
export const PREVIEWS_DIR = join(ICONS_DIR, 'previews');

/** Deterministic photographic grain tile (resvg's feTurbulence renders as
 *  chunky squares, so real noise is composited at the raster stage instead). */
let grainTile: Buffer | null = null;
function makeGrain(): Buffer {
  if (grainTile) return grainTile;
  const size = 1024;
  const px = Buffer.alloc(size * size * 4);
  // mulberry32 — same PRNG family as environments.ts, fixed seed.
  let a = 77;
  const rand = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < size * size; i++) {
    const v = rand();
    px[i * 4] = 255;
    px[i * 4 + 1] = 255;
    px[i * 4 + 2] = 255;
    px[i * 4 + 3] = v < 0.5 ? 0 : Math.floor((v - 0.5) * 2 * 28); // sparse white specks
  }
  grainTile = px;
  return px;
}

export function renderPng(scene: Scene, size = 1024): Buffer {
  const svg = composeSvg(scene);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  return Buffer.from(resvg.render().asPng());
}

/** Rasterise + apply the standard grain finish. */
export async function renderFinishedPng(scene: Scene): Promise<Buffer> {
  const base = renderPng(scene);
  if (scene.finish?.grain === false) return base;
  const noise = await sharp(makeGrain(), { raw: { width: 1024, height: 1024, channels: 4 } }).png().toBuffer();
  return sharp(base)
    .composite([{ input: noise, blend: 'over' }])
    .png()
    .toBuffer();
}

/** Render a cover's full asset set: 1024 icon + 256 preview. */
export async function renderCoverAssets(slug: string, scene: Scene): Promise<void> {
  mkdirSync(PREVIEWS_DIR, { recursive: true });
  const png = await renderFinishedPng(scene);
  writeFileSync(join(ICONS_DIR, `${slug}.png`), png);
  const preview = await sharp(png).resize(256, 256).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(join(PREVIEWS_DIR, `${slug}.png`), preview);
}

/** Contact sheet of rendered icons for visual review. */
export async function contactSheet(slugs: string[], outPath: string, cell = 236, cols = 4): Promise<void> {
  const rows = Math.ceil(slugs.length / cols);
  const pad = 18;
  const W = cols * cell + pad * (cols + 1);
  const H = rows * (cell + 34) + pad * (rows + 1);
  const composites: OverlayOptions[] = [];
  for (let i = 0; i < slugs.length; i++) {
    const buf = await sharp(join(ICONS_DIR, `${slugs[i]}.png`))
      .resize(cell, cell)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${cell}" height="${cell}"><rect width="${cell}" height="${cell}" rx="52" fill="#fff"/></svg>`,
          ),
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();
    const col = i % cols;
    const row = Math.floor(i / cols);
    composites.push({ input: buf, left: pad + col * (cell + pad), top: pad + row * (cell + 34 + pad) });
    composites.push({
      input: Buffer.from(
        `<svg width="${cell}" height="30"><text x="${cell / 2}" y="21" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#333">${slugs[i]}</text></svg>`,
      ),
      left: pad + col * (cell + pad),
      top: pad + row * (cell + 34 + pad) + cell + 2,
    });
  }
  await sharp({ create: { width: W, height: H, channels: 4, background: '#E9ECF3' } })
    .composite(composites)
    .png()
    .toFile(outPath);
}
