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

/* ---------- catalogue expansion primitives ---------- */

/** A soft radiant sun/moon disc with a glow halo. */
export function disc(x: number, y: number, r: number, col: string, glow: string, glowOp = 0.5): string {
  return (
    `<circle cx="${x}" cy="${y}" r="${r * 2}" fill="${glow}" opacity="${glowOp}" filter="url(#blur24)"/>` +
    `<circle cx="${x}" cy="${y}" r="${r * 1.25}" fill="${glow}" opacity="${glowOp * 0.9}" filter="url(#blur12)"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`
  );
}

/** Cherry/spring blossom petals drifting (still frame). */
export function petals(seed = 3, n = 20, cols = ['#FFD7E4', '#FFC2D6', '#FFFFFF']): string {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = r() * 1024;
    const y = r() * 1024;
    const s = 8 + r() * 12;
    const rot = r() * 360;
    const c = cols[i % cols.length];
    out.push(
      `<g transform="translate(${x.toFixed(0)},${y.toFixed(0)}) rotate(${rot.toFixed(0)}) scale(${(s / 12).toFixed(2)})" opacity="${(0.55 + r() * 0.4).toFixed(2)}">` +
        `<path d="M0,-11 C6,-8 6,4 0,11 C-6,4 -6,-8 0,-11 Z" fill="${c}"/></g>`,
    );
  }
  return out.join('');
}

/** Falling autumn leaves. */
export function leaves(seed = 4, n = 16, cols = ['#E8912F', '#D2542B', '#F2B84B', '#B23A28']): string {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = r() * 1024;
    const y = r() * 1024;
    const s = 0.7 + r() * 0.9;
    const rot = r() * 360;
    const c = cols[i % cols.length];
    out.push(
      `<g transform="translate(${x.toFixed(0)},${y.toFixed(0)}) rotate(${rot.toFixed(0)}) scale(${s.toFixed(2)})" opacity="${(0.6 + r() * 0.35).toFixed(2)}">` +
        `<path d="M0,-16 C11,-11 11,8 0,17 C-11,8 -11,-11 0,-16 Z" fill="${c}"/>` +
        `<path d="M0,-14 L0,15" stroke="#00000022" stroke-width="1.6"/></g>`,
    );
  }
  return out.join('');
}

/** A palm-tree silhouette. */
export function palm(x: number, y: number, s: number, col = '#0E2A24'): string {
  const frond = (a: number) => `<path d="M0,0 Q${Math.cos((a * Math.PI) / 180) * 120},${Math.sin((a * Math.PI) / 180) * 120 - 30} ${Math.cos((a * Math.PI) / 180) * 210},${Math.sin((a * Math.PI) / 180) * 210} Q${Math.cos((a * Math.PI) / 180) * 130},${Math.sin((a * Math.PI) / 180) * 130 + 26} 0,0 Z" fill="${col}"/>`;
  return (
    `<g transform="translate(${x},${y}) scale(${s})">` +
    `<path d="M-14,0 C-22,140 -30,250 -20,360 L20,360 C10,250 6,140 14,0 Z" fill="${col}"/>` +
    `<g transform="translate(0,2)">${[200, 225, 250, 290, 315, 340].map(frond).join('')}</g></g>`
  );
}

/** A paper lantern (Lunar New Year / festival). */
export function lantern(x: number, y: number, s: number, col = '#D8232A', cap = '#E8B23A'): string {
  return (
    `<g transform="translate(${x},${y}) scale(${s})">` +
    `<line x1="0" y1="-90" x2="0" y2="-56" stroke="${cap}" stroke-width="4"/>` +
    `<rect x="-24" y="-58" width="48" height="10" rx="3" fill="${cap}"/>` +
    `<ellipse cx="0" cy="0" rx="52" ry="60" fill="${col}"/>` +
    `<ellipse cx="0" cy="0" rx="52" ry="60" fill="none" stroke="#00000022" stroke-width="2"/>` +
    `<path d="M-30,-42 A60,60 0 0 0 -30,42 M0,-58 L0,58 M30,-42 A60,60 0 0 1 30,42" fill="none" stroke="${cap}" stroke-width="3" opacity="0.65"/>` +
    `<rect x="-24" y="48" width="48" height="10" rx="3" fill="${cap}"/>` +
    `<g stroke="${cap}" stroke-width="3">${[-16, -6, 4, 14].map((tx) => `<line x1="${tx}" y1="58" x2="${tx}" y2="92"/>`).join('')}</g></g>`
  );
}

/** Flowing marble veins across the whole tile. */
export function marbleVeins(seed = 12, n = 5, col = '#C7BFA8', op = 0.5): string {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const y0 = r() * 1024;
    const w = 2 + r() * 4;
    out.push(
      `<path d="M-40,${y0.toFixed(0)} C${(200 + r() * 120).toFixed(0)},${(y0 - 120 + r() * 80).toFixed(0)} ${(560 + r() * 120).toFixed(0)},${(y0 + 120 - r() * 80).toFixed(0)} 1064,${(y0 - 40 + r() * 80).toFixed(0)}" fill="none" stroke="${col}" stroke-width="${w.toFixed(1)}" opacity="${(op * (0.5 + r() * 0.5)).toFixed(2)}"/>`,
    );
  }
  return out.join('');
}

/** Layered nebula clouds for cosmic covers. */
export function nebula(cols = ['#7C4DFF', '#4D8CFF', '#FF6BAA']): string {
  const blob = (x: number, y: number, r: number, c: string, op: number) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${op}" filter="url(#blur24)"/>`;
  return (
    blob(360, 380, 300, cols[0], 0.5) +
    blob(680, 300, 260, cols[1], 0.42) +
    blob(560, 640, 320, cols[2], 0.32) +
    blob(220, 620, 200, cols[1], 0.3)
  );
}

/** Art-deco radiating rays from a point. */
export function decoRays(cx: number, cy: number, n: number, len: number, col: string, op = 0.5, spread = 360): string {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (spread / n) * i - spread / 2 - 90;
    const rad = (a * Math.PI) / 180;
    const w = i % 2 === 0 ? 8 : 3;
    out.push(`<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(rad) * len).toFixed(0)}" y2="${(cy + Math.sin(rad) * len).toFixed(0)}" stroke="${col}" stroke-width="${w}" opacity="${op}"/>`);
  }
  return out.join('');
}

/** A stylised globe with latitude/longitude arcs and glowing visited dots. */
export function globe(cx: number, cy: number, r: number, ocean: string, land: string, dot: string, seed = 30): string {
  const rnd = rng(seed);
  const dots: string[] = [];
  for (let i = 0; i < 18; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = Math.sqrt(rnd()) * r * 0.82;
    dots.push(`<circle cx="${(cx + Math.cos(a) * rr).toFixed(0)}" cy="${(cy + Math.sin(a) * rr * 0.9).toFixed(0)}" r="${(3 + rnd() * 4).toFixed(1)}" fill="${dot}" opacity="${(0.7 + rnd() * 0.3).toFixed(2)}"/>`);
  }
  return (
    `<circle cx="${cx}" cy="${cy}" r="${r + 14}" fill="${dot}" opacity="0.18" filter="url(#blur24)"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${ocean}"/>` +
    `<clipPath id="globeclip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>` +
    `<g clip-path="url(#globeclip)" stroke="${land}" stroke-width="2.5" fill="none" opacity="0.5">` +
    [-0.6, -0.3, 0, 0.3, 0.6].map((f) => `<ellipse cx="${cx}" cy="${(cy + r * f).toFixed(0)}" rx="${r}" ry="${(r * 0.16).toFixed(0)}"/>`).join('') +
    [-0.6, -0.3, 0, 0.3, 0.6].map((f) => `<ellipse cx="${(cx + r * f).toFixed(0)}" cy="${cy}" rx="${(r * 0.16).toFixed(0)}" ry="${r}"/>`).join('') +
    `</g>` +
    `<g clip-path="url(#globeclip)">${dots.join('')}</g>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="3"/>` +
    `<ellipse cx="${(cx - r * 0.3).toFixed(0)}" cy="${(cy - r * 0.34).toFixed(0)}" rx="${(r * 0.36).toFixed(0)}" ry="${(r * 0.22).toFixed(0)}" fill="#FFFFFF" opacity="0.14" filter="url(#blur12)"/>`
  );
}

/** Topographic contour lines — cartographic adventure covers. */
export function contours(seed = 8, col = '#FFFFFF', op = 0.12): string {
  const r = rng(seed);
  const out: string[] = [];
  const cx = 512, cy = 460;
  for (let i = 1; i <= 7; i++) {
    const rad = i * 66 + r() * 12;
    const wob = 0.06 + r() * 0.05;
    out.push(
      `<path d="M${(cx - rad).toFixed(0)},${cy} C${(cx - rad).toFixed(0)},${(cy - rad * (1 - wob)).toFixed(0)} ${(cx + rad).toFixed(0)},${(cy - rad * (1 + wob)).toFixed(0)} ${(cx + rad).toFixed(0)},${cy} C${(cx + rad).toFixed(0)},${(cy + rad * (1 + wob)).toFixed(0)} ${(cx - rad).toFixed(0)},${(cy + rad * (1 - wob)).toFixed(0)} ${(cx - rad).toFixed(0)},${cy} Z" fill="none" stroke="${col}" stroke-width="2.5" opacity="${op}"/>`,
    );
  }
  return out.join('');
}

/** An acacia (savanna) tree silhouette. */
export function acacia(x: number, y: number, s: number, col = '#1C130B'): string {
  return (
    `<g transform="translate(${x},${y}) scale(${s})">` +
    `<path d="M-6,0 C-14,-90 -40,-120 -70,-134 M-6,0 C-2,-96 20,-128 64,-140 M-6,0 L-2,0" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round"/>` +
    `<path d="M-150,-150 C-90,-186 90,-186 158,-150 C120,-172 -110,-172 -150,-150 Z" fill="${col}"/>` +
    `<rect x="-8" y="-6" width="12" height="10" fill="${col}"/></g>`
  );
}
