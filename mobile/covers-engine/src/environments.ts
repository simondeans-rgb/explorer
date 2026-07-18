/** Environment library — reusable scene elements that sit around the mark.
 *  Everything is deterministic (seeded rng) so a cover renders identically on
 *  every machine, forever. All coordinates live in the 1024×1024 canvas.
 */
import { rng, sparkle4, shade } from './filters';

/* ---------- sky & weather ---------- */

/** Soft round-cluster cloud. */
export function cloud(x: number, y: number, s: number, col = '#FFFFFF', op = 0.9, shadeCol = '#C9D4E8'): string {
  return (
    `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}">` +
    `<ellipse cx="0" cy="10" rx="120" ry="34" fill="${shadeCol}"/>` +
    `<circle cx="-55" cy="-4" r="42" fill="${col}"/><circle cx="0" cy="-24" r="56" fill="${col}"/>` +
    `<circle cx="58" cy="-2" r="44" fill="${col}"/><ellipse cx="0" cy="6" rx="118" ry="30" fill="${col}"/></g>`
  );
}

/** Star field with a few four-point sparkles. */
export function stars(seed = 11, n = 60, col = '#FFFFFF', maxR = 3.4): string {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = 12 + r() * 1000;
    const y = 8 + r() * 640;
    if (i % 9 === 0) out.push(`<path d="${sparkle4(x, y, 8 + r() * 8)}" fill="${col}" opacity="${0.5 + r() * 0.5}"/>`);
    else out.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.8 + r() * maxR).toFixed(1)}" fill="${col}" opacity="${(0.3 + r() * 0.65).toFixed(2)}"/>`);
  }
  return out.join('');
}

/** Falling snow (still frame): layered flakes, nearer = bigger + softer. */
export function snowfall(seed = 5, n = 46): string {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const near = i % 3 === 0;
    out.push(
      `<circle cx="${(r() * 1024).toFixed(0)}" cy="${(r() * 1024).toFixed(0)}" r="${(near ? 7 + r() * 8 : 2.5 + r() * 4).toFixed(1)}" fill="#fff" opacity="${(near ? 0.5 + r() * 0.3 : 0.25 + r() * 0.4).toFixed(2)}"${near ? ' filter="url(#blur6)"' : ''}/>`,
    );
  }
  return out.join('');
}

/** Defocused light discs. */
export function bokeh(colors: string[], n = 10, seed = 21, rmin = 18, rmax = 64, opMin = 0.1, opMax = 0.3): string {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = 20 + r() * 984;
    const y = 20 + r() * 984;
    const rad = rmin + r() * (rmax - rmin);
    out.push(
      `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(0)}" fill="${colors[i % colors.length]}" opacity="${(opMin + r() * (opMax - opMin)).toFixed(2)}" filter="url(#blur12)"/>`,
    );
  }
  return out.join('');
}

/* ---------- land ---------- */

/** Rolling hill bands: [baseY, amplitude, colour, opacity, blurId?]. */
export function hills(bands: Array<[number, number, string, number, string?]>): string {
  return bands
    .map(([y, amp, col, op, blur]) => {
      const f = blur ? ` filter="url(#${blur})"` : '';
      return `<path d="M-60,${y} Q200,${y - amp} 460,${y} T1090,${y - amp * 0.4} V1120 H-60 Z" fill="${col}" opacity="${op}"${f}/>`;
    })
    .join('');
}

/** Jagged alpine ridge with optional snowcaps. peaks: [x, peakY] pairs. */
export function ridge(peaks: Array<[number, number]>, baseY: number, col: string, op = 1, snowCol?: string): string {
  let d = `M-60,${baseY}`;
  for (const [x, y] of peaks) d += ` L${x},${y}`;
  d += ` L1084,${baseY} V1120 H-60 Z`;
  let out = `<path d="${d}" fill="${col}" opacity="${op}"/>`;
  if (snowCol) {
    out += peaks
      .filter((_, i) => i % 2 === 1)
      .map(([x, y]) => `<path d="M${x - 46},${y + 64} L${x},${y} L${x + 46},${y + 64} Q${x + 20},${y + 46} ${x},${y + 58} Q${x - 20},${y + 46} ${x - 46},${y + 64} Z" fill="${snowCol}"/>`)
      .join('');
  }
  return out;
}

/** Conifer. */
export function pine(x: number, y: number, s: number, col = '#123B2A', snowCol?: string): string {
  const snow = snowCol
    ? `<path d="M0,-120 L20,-86 H-20 Z" fill="${snowCol}"/><path d="M0,-84 L26,-54 H-26 Z" fill="${snowCol}"/>`
    : '';
  return (
    `<g transform="translate(${x},${y}) scale(${s})">` +
    `<path d="M0,-120 L34,-58 H-34 Z" fill="${col}"/><path d="M0,-84 L44,-8 H-44 Z" fill="${col}"/>` +
    `<path d="M0,-44 L54,44 H-54 Z" fill="${col}"/><rect x="-8" y="44" width="16" height="22" fill="#2E1D12"/>${snow}</g>`
  );
}

/* ---------- city ---------- */

/** Dusk skyline band: deterministic buildings with lit windows.
 *  heightRange in px; returns silhouette + windows. */
export function skyline(seed: number, baseY: number, col: string, litCol: string, minH = 90, maxH = 300, litDensity = 0.5): string {
  const r = rng(seed);
  const out: string[] = [];
  const windows: string[] = [];
  let x = -20;
  while (x < 1044) {
    const w = 46 + r() * 74;
    const h = minH + r() * (maxH - minH);
    const top = baseY - h;
    out.push(`<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 60).toFixed(0)}" fill="${col}"/>`);
    if (r() > 0.72) out.push(`<rect x="${(x + w / 2 - 3).toFixed(0)}" y="${(top - 26).toFixed(0)}" width="6" height="26" fill="${col}"/>`);
    // window grid
    for (let wy = top + 16; wy < baseY - 18; wy += 26) {
      for (let wx = x + 9; wx < x + w - 12; wx += 20) {
        if (r() < litDensity) windows.push(`<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="9" height="12" rx="1.5" fill="${litCol}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`);
      }
    }
    x += w + 6 + r() * 18;
  }
  return out.join('') + windows.join('');
}

/* ---------- travel ephemera ---------- */

/** Rubber passport entry stamp (rotated ring + text-free glyph marks). */
export function passportStamp(x: number, y: number, s: number, col: string, kind: 'ring' | 'rect' = 'ring', rot = -12, op = 0.5): string {
  const inner =
    kind === 'ring'
      ? `<circle r="86" fill="none" stroke="${col}" stroke-width="7"/><circle r="64" fill="none" stroke="${col}" stroke-width="3.5"/>` +
        `<path d="M-40,-4 H40 M-30,14 H30" stroke="${col}" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M-52,-30 A60,60 0 0 1 52,-30" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 14"/>`
      : `<rect x="-96" y="-52" width="192" height="104" rx="12" fill="none" stroke="${col}" stroke-width="7"/>` +
        `<path d="M-70,-14 H70 M-58,10 H58 M-70,30 H30" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`;
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})" opacity="${op}" filter="url(#wobble)">${inner}</g>`;
}

/** Dashed flight arc with a tiny plane at the end. */
export function flightArc(x1: number, y1: number, x2: number, y2: number, lift: number, col: string, w = 6, op = 0.85): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - lift;
  const ang = (Math.atan2(y2 - my, x2 - mx) * 180) / Math.PI;
  return (
    `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="2 22" opacity="${op}"/>` +
    `<g transform="translate(${x2},${y2}) rotate(${ang + 90})" opacity="${op}">` +
    `<path d="M0,-26 C7,-16 8,-8 8,2 L26,20 L26,28 L8,20 L7,34 L14,42 L14,48 L0,44 L-14,48 L-14,42 L-7,34 L-8,20 L-26,28 L-26,20 L-8,2 C-8,-8 -7,-16 0,-26 Z" fill="${col}"/></g>`
  );
}

/** Postmark wave lines (vintage mail). */
export function postmarkWaves(x: number, y: number, s: number, col: string, op = 0.4): string {
  const wave = (dy: number) => `<path d="M0,${dy} Q30,${dy - 12} 60,${dy} T120,${dy} T180,${dy}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}">${wave(0)}${wave(24)}${wave(48)}</g>`;
}

/* ---------- water ---------- */

/** Sun-shaft rays for underwater scenes. */
export function lightShafts(col = '#FFFFFF', op = 0.14): string {
  return (
    `<g opacity="${op}" filter="url(#blur24)">` +
    `<path d="M240,-40 L120,540 L300,540 Z" fill="${col}"/>` +
    `<path d="M560,-60 L460,600 L660,600 Z" fill="${col}"/>` +
    `<path d="M860,-40 L780,480 L940,480 Z" fill="${col}"/></g>`
  );
}

/** Rising bubbles. */
export function bubbles(seed = 9, n = 22, col = '#FFFFFF'): string {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = 30 + r() * 964;
    const y = 120 + r() * 860;
    const rad = 4 + r() * 14;
    out.push(
      `<g opacity="${(0.25 + r() * 0.45).toFixed(2)}"><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(1)}" fill="none" stroke="${col}" stroke-width="2.5"/>` +
        `<circle cx="${(x - rad * 0.35).toFixed(0)}" cy="${(y - rad * 0.35).toFixed(0)}" r="${(rad * 0.28).toFixed(1)}" fill="${col}"/></g>`,
    );
  }
  return out.join('');
}

/** Little fish (side profile), pointing left or right. */
export function fish(x: number, y: number, s: number, col: string, dir: 1 | -1 = 1, op = 0.9): string {
  return (
    `<g transform="translate(${x},${y}) scale(${s * dir},${s})" opacity="${op}">` +
    `<path d="M-34,0 Q-6,-22 22,0 Q-6,22 -34,0 Z" fill="${col}"/>` +
    `<path d="M22,0 L40,-14 L40,14 Z" fill="${shade(col, -0.18)}"/>` +
    `<circle cx="-20" cy="-4" r="3.4" fill="#0B1B33"/></g>`
  );
}

/* ---------- desert ---------- */

/** Layered dunes with crest highlights. */
export function dunes(bands: Array<[number, number, string, number]>, crest?: string): string {
  return bands
    .map(([y, amp, col, op], i) => {
      const path = `M-60,${y} C240,${y - amp} 420,${y + amp * 0.5} 640,${y - amp * 0.7} S1000,${y + amp * 0.3} 1090,${y - amp * 0.5} V1120 H-60 Z`;
      const hl = crest && i === bands.length - 1 ? `<path d="M-60,${y} C240,${y - amp} 420,${y + amp * 0.5} 640,${y - amp * 0.7}" fill="none" stroke="${crest}" stroke-width="5" opacity="0.6"/>` : '';
      return `<path d="${path}" fill="${col}" opacity="${op}"/>${hl}`;
    })
    .join('');
}
