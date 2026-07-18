/** Layered cover compositor. Every Passport Cover is a Scene — an ordered
 *  stack of named layers — never a flat drawing. The standard stack:
 *
 *    background → environment → mark (material) → foreground → finish
 *
 *  Finish (grain + vignette + gloss) is applied by default so every cover
 *  shares the same physical "laminated cover" feel; recipes can tune or
 *  disable pieces of it.
 */
import { FILTERS, vignette, gloss } from './filters';
import { mark, type MarkOptions } from './mark';
import { PORCELAIN } from './materials';

export interface Scene {
  /** Extra <defs> content (gradients, patterns) used by the layers. */
  defs?: string[];
  /** Painted first: sky, gradient, sea… */
  background: string[];
  /** Between background and the mark: hills, skylines, stars… */
  environment?: string[];
  /** The protected mark. */
  mark: MarkOptions;
  /** Painted over the mark: near-field elements, weather in front… */
  foreground?: string[];
  /** Physical finish. All default true. */
  finish?: { grain?: number | false; vignette?: number | false; gloss?: boolean };
}

export function composeSvg(scene: Scene): string {
  const material = scene.mark.material ?? PORCELAIN;
  const [vigDef, vigBody] = vignette(typeof scene.finish?.vignette === 'number' ? scene.finish.vignette : 0.38);
  const [glossDef, glossBody] = gloss();
  const defs = [FILTERS, material.defs, vigDef, glossDef, ...(scene.defs ?? [])].join('');
  const body: string[] = [
    ...scene.background,
    ...(scene.environment ?? []),
    mark(scene.mark),
    ...(scene.foreground ?? []),
  ];
  // NOTE: grain is applied at the raster stage (render.ts) — resvg renders
  // feTurbulence grain as chunky squares, so we composite real noise instead.
  if (scene.finish?.vignette !== false) body.push(vigBody);
  if (scene.finish?.gloss !== false) body.push(glossBody);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">` +
    `<defs>${defs}</defs>${body.join('')}</svg>`
  );
}
