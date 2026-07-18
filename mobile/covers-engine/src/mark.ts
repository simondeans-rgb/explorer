/** The Worldly mark, rendered in a material. Geometry comes exclusively from
 *  geometry.ts; a material may change surface finish only — never shape. */
import { PIN_XY, R_HOLE, LINE_W, pinPath, wLine } from './geometry';
import type { Material } from './materials';
import { PORCELAIN } from './materials';

export interface MarkOptions {
  /** Colour inside each of the five pin-holes (the collection's signature). */
  holeColors: string[];
  /** Surface material for line + pins. Defaults to the porcelain signature. */
  material?: Material;
  /** Pin indices whose holes render as dark cut-outs (e.g. ghost eyes). */
  eyeDark?: number[];
  /** Extra SVG drawn on top of the route line, under the pins. */
  extraOnLine?: string;
  /** Skip the mark entirely (scenes that wrap the W another way). */
  omit?: boolean;
}

/** Render the protected mark in a material. Returns body SVG (defs come from
 *  the material itself via material.defs). */
export function mark(opts: MarkOptions): string {
  if (opts.omit) return '';
  const m = opts.material ?? PORCELAIN;
  const body: string[] = [];
  // Grounded contact shadow under the whole mark.
  body.push(
    `<path d="${wLine()}" fill="none" stroke="#000" stroke-width="${LINE_W + 26}" stroke-linecap="round" stroke-linejoin="round" opacity="0.20" filter="url(#blur24)" transform="translate(0,26)"/>`,
  );
  body.push(
    `<path d="${wLine()}" fill="none" stroke="${m.lineStroke}" stroke-width="${LINE_W}" stroke-linecap="round" stroke-linejoin="round" filter="url(#linesh)"/>`,
  );
  // Bevel highlight along the top edge of the line.
  body.push(
    `<path d="${wLine()}" fill="none" stroke="${m.bevel ?? '#FFFFFF'}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="${m.bevelOpacity ?? 0.55}" transform="translate(0,-13)"/>`,
  );
  if (opts.extraOnLine) body.push(opts.extraOnLine);
  opts.holeColors.forEach((hc, i) => {
    const [cx, cy] = PIN_XY[i];
    const dark = opts.eyeDark?.includes(i) ?? false;
    body.push(
      `<g filter="url(#soft)">` +
        `<path d="${pinPath(cx, cy)}" fill="${m.pinFill}"/>` +
        `<path d="${pinPath(cx, cy)}" fill="none" stroke="${m.pinRim ?? '#FFFFFF'}" stroke-width="7" opacity="${m.pinRimOpacity ?? 0.75}"/>` +
        `<ellipse cx="${cx - 32}" cy="${cy - 44}" rx="27" ry="15" fill="#fff" opacity="${m.pinSheen ?? 0.85}" transform="rotate(-24 ${cx - 32} ${cy - 44})"/>` +
        (dark
          ? `<circle cx="${cx}" cy="${cy}" r="${R_HOLE + 4}" fill="${hc}"/>`
          : `<circle cx="${cx}" cy="${cy}" r="${R_HOLE}" fill="${hc}"/>`) +
        (dark ? '' : `<circle cx="${cx}" cy="${cy}" r="${R_HOLE}" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="6"/>`) +
        `<circle cx="${cx - 11}" cy="${cy - 12}" r="9" fill="#fff" opacity="${dark ? 0.9 : 0.5}"/>` +
        `</g>`,
    );
  });
  return body.join('');
}
