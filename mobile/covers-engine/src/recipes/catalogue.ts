/** First-generation catalogue expansion — new covers across every tier, each
 *  a Scene composed only from the shared libraries. Grouped by collection. */
import type { Scene } from '../compose';
import { linearBg, radialBg, sparkle4 } from '../filters';
import { GOLD, MARBLE, LINEN, ICE } from '../materials';
import {
  stars,
  bokeh,
  hills,
  ridge,
  pine,
  skyline,
  disc,
  petals,
  leaves,
  palm,
  lantern,
  marbleVeins,
  nebula,
  decoRays,
  globe,
  contours,
  acacia,
  dunes,
} from '../environments';

const B = '#0B0F1C';

/* ---------- Core ---------- */

export function linen(): Scene {
  const [d, b] = linearBg([[0, '#F4EEE0'], [0.5, '#EBE2CE'], [1, '#DCCFB2']], 0.25, 1);
  return {
    defs: [d],
    background: [b],
    environment: [
      // Woven weft — faint horizontal + vertical threads.
      `<g opacity="0.06">${Array.from({ length: 34 }, (_, i) => `<line x1="0" y1="${i * 32}" x2="1024" y2="${i * 32}" stroke="#6B5A38" stroke-width="6"/>`).join('')}${Array.from({ length: 34 }, (_, i) => `<line x1="${i * 32}" y1="0" x2="${i * 32}" y2="1024" stroke="#6B5A38" stroke-width="6"/>`).join('')}</g>`,
    ],
    mark: { material: LINEN, holeColors: ['#C4552F', '#6C8A4E', '#3E6B8F', '#B07C3A', '#8F5FA8'] },
    finish: { vignette: 0.26 },
  };
}

export function explorer(): Scene {
  const [d, b] = linearBg([[0, '#123A44'], [0.55, '#155E5A'], [1, '#0C2A2E']], 0.2, 1);
  return {
    defs: [d],
    background: [b],
    environment: [
      contours(8, '#EAF6F2', 0.1),
      // A compass rose glinting top-right.
      `<g transform="translate(824,196)" opacity="0.9">${decoRays(0, 0, 8, 66, '#EAD9A0', 0.5)}<path d="M0,-58 L14,0 L0,58 L-14,0 Z" fill="#EAD9A0"/><path d="M-58,0 L0,14 L58,0 L0,-14 Z" fill="#CDE7DE"/><circle r="9" fill="#123A44" stroke="#EAD9A0" stroke-width="4"/></g>`,
    ],
    mark: { holeColors: ['#FFB84D', '#24D1C3', '#FF6B9A', '#9B7CFF', '#4DA6FF'] },
    finish: { vignette: 0.34 },
  };
}

/* ---------- Seasonal ---------- */

export function spring(): Scene {
  const [d, b] = linearBg([[0, '#BFE8F2'], [0.5, '#DFF3E4'], [1, '#A6D48A']], 0.2, 1);
  return {
    defs: [d],
    background: [b],
    environment: [
      disc(824, 210, 66, '#FFF3C4', '#FFF6D8', 0.5),
      hills([[820, 120, '#8FC06A', 1], [900, 90, '#6FA84E', 1]]),
      petals(3, 22),
    ],
    mark: { holeColors: ['#FF8FB3', '#FFB84D', '#6FA84E', '#4DA6FF', '#9B7CFF'] },
    finish: { vignette: 0.28 },
  };
}

export function summer(): Scene {
  const [d, b] = linearBg([[0, '#37C0E8'], [0.5, '#7FE0DE'], [0.72, '#FBE7A6'], [1, '#F4C56B']], 0.15, 1);
  return {
    defs: [d],
    background: [b],
    environment: [
      disc(230, 220, 78, '#FFF6D8', '#FFEFAE', 0.55),
      `<path d="M-60,880 Q300,842 620,880 T1090,872 V1120 H-60 Z" fill="#2FB6C6"/>`,
      `<path d="M-60,930 Q320,902 660,930 T1090,922 V1120 H-60 Z" fill="#F0DCA0"/>`,
      palm(842, 636, 0.72, '#123A2E'),
      palm(150, 690, 0.5, '#123A2E'),
    ],
    mark: { holeColors: ['#FF6B9A', '#FFB84D', '#24D1C3', '#4DA6FF', '#9B7CFF'] },
    finish: { vignette: 0.3 },
  };
}

export function autumn(): Scene {
  const [d, b] = linearBg([[0, '#F0B25A'], [0.5, '#DC7A3C'], [1, '#8C3A24']], 0.2, 1);
  return {
    defs: [d],
    background: [b],
    environment: [
      disc(512, 300, 120, '#FBE3A4', '#F6C871', 0.4),
      hills([[840, 110, '#9A4A24', 1], [920, 80, '#6E2E18', 1]]),
      leaves(4, 18),
    ],
    mark: { holeColors: ['#E8912F', '#D2542B', '#F2B84B', '#8C3A24', '#B23A28'] },
    finish: { vignette: 0.34 },
  };
}

export function lunarNewYear(): Scene {
  const [d, b] = radialBg([[0, '#C4222A'], [0.55, '#9E1820'], [1, '#5E0E14']], 0.34);
  return {
    defs: [d],
    background: [b],
    environment: [
      ...[0, 1, 2, 3, 4].map((i) => `<path d="${sparkle4(120 + i * 200, 150 + (i % 2) * 80, 10 + (i % 3) * 4)}" fill="#F3D27A" opacity="0.8"/>`),
      lantern(190, 220, 0.9, '#E23A32', '#F3CE6A'),
      lantern(842, 240, 0.72, '#E23A32', '#F3CE6A'),
    ],
    mark: { material: GOLD, holeColors: ['#C4222A', '#8E1218', '#C4222A', '#8E1218', '#C4222A'] },
    finish: { vignette: 0.3 },
  };
}

/* ---------- Premium ---------- */

export function gold(): Scene {
  const [d, b] = radialBg([[0, '#2A2418'], [0.6, '#161208'], [1, B]], 0.32);
  return {
    defs: [d],
    background: [b, bokeh(['#F0C25C', '#FFE9A8'], 12, 22, 14, 60, 0.06, 0.2)],
    mark: { material: GOLD, holeColors: ['#3A2E12', '#5A4718', '#3A2E12', '#5A4718', '#3A2E12'] },
    finish: { vignette: 0.44 },
  };
}

export function marble(): Scene {
  const [d, b] = linearBg([[0, '#FBFAF6'], [0.55, '#F1EFE8'], [1, '#DEDBD1']], 0.3, 1);
  return {
    defs: [d],
    background: [b, marbleVeins(12, 6, '#B9AF95', 0.45), marbleVeins(19, 3, '#8C8A6A', 0.2)],
    mark: { material: MARBLE, holeColors: ['#B08D2E', '#9A7B26', '#B08D2E', '#9A7B26', '#B08D2E'] },
    finish: { vignette: 0.26 },
  };
}

export function galaxy(): Scene {
  const [d, b] = radialBg([[0, '#2A1A54'], [0.5, '#160E33'], [1, '#080512']], 0.4);
  return {
    defs: [d],
    background: [b, nebula(['#7C4DFF', '#4D8CFF', '#FF6BAA']), stars(41, 90, '#FFFFFF', 3.2)],
    mark: { holeColors: ['#9B7CFF', '#4D8CFF', '#FF6BAA', '#4BE3B2', '#FFD36B'] },
    finish: { vignette: 0.42 },
  };
}

export function artDeco(): Scene {
  const [d, b] = linearBg([[0, '#123049'], [0.6, '#0C2033'], [1, '#08131F']], 0.2, 1);
  return {
    defs: [d],
    background: [b],
    environment: [
      `<g opacity="0.55">${decoRays(512, 1090, 15, 900, '#D9B45A', 0.4, 150)}</g>`,
      `<g fill="none" stroke="#D9B45A" stroke-width="5" opacity="0.5"><path d="M512,120 L604,220 L512,320 L420,220 Z"/><path d="M512,60 L676,220 L512,380 L348,220 Z"/></g>`,
    ],
    mark: { material: GOLD, holeColors: ['#123049', '#0C2033', '#123049', '#0C2033', '#123049'] },
    finish: { vignette: 0.38 },
  };
}

/* ---------- Lifestyle ---------- */

export function nordic(): Scene {
  const [d, b] = linearBg([[0, '#1B3A5C'], [0.45, '#3E6E92'], [0.72, '#9FC6DA'], [1, '#E7C9B0']], 0.15, 1);
  return {
    defs: [d],
    background: [b],
    environment: [
      disc(512, 340, 62, '#FBE7CE', '#F6D2B4', 0.4),
      `<g filter="url(#blur6)" opacity="0.85">${ridge([[70, 560], [240, 420], [430, 560], [640, 400], [850, 560], [980, 460]], 720, '#3C5B78', 1)}</g>`,
      ridge([[120, 660], [320, 460], [520, 640], [740, 440], [940, 640]], 880, '#213D57', 1, '#EAF3FC'),
      `<path d="M-60,880 Q300,858 620,880 T1090,874 V1120 H-60 Z" fill="#16293D"/>`,
      pine(150, 900, 0.8, '#12283C', '#DFEDF9'),
      pine(880, 890, 0.9, '#12283C', '#DFEDF9'),
    ],
    mark: { material: ICE, holeColors: ['#4DA6FF', '#24D1C3', '#9FC6DA', '#FFB84D', '#9B7CFF'] },
    finish: { vignette: 0.32 },
  };
}

export function safari(): Scene {
  const [d, b] = linearBg([[0, '#F4C05A'], [0.45, '#E88A3C'], [0.72, '#C25A34'], [1, '#7A3524']], 0.15, 1);
  return {
    defs: [d],
    background: [b],
    environment: [
      disc(512, 360, 118, '#FFE7A6', '#FBC96C', 0.45),
      dunes([[820, 80, '#B85E30', 0.95], [900, 70, '#8C4322', 1]], '#F4C05A'),
      acacia(210, 812, 0.9, '#1C130B'),
      acacia(860, 838, 0.66, '#1C130B'),
    ],
    mark: { holeColors: ['#E88A3C', '#FFB84D', '#7A3524', '#24D1C3', '#FF6B9A'] },
    finish: { vignette: 0.36 },
  };
}

export function mediterranean(): Scene {
  const [d, b] = linearBg([[0, '#2E9BD6'], [0.5, '#6FC5E6'], [1, '#BFE6F2']], 0.15, 1);
  return {
    defs: [d],
    background: [b],
    environment: [
      disc(848, 200, 52, '#FFF6DC', '#FFEDBC', 0.5),
      // Whitewashed coastal town.
      skyline(52, 940, '#F4F1EA', '#2E9BD6', 60, 150, 0),
      `<g fill="#2E86C4">${[210, 470, 730].map((x) => `<path d="M${x - 34},760 A34,34 0 0 1 ${x + 34},760 Z" />`).join('')}</g>`,
      `<path d="M-60,952 Q300,930 620,952 T1090,946 V1120 H-60 Z" fill="#1C7FC0"/>`,
    ],
    mark: { holeColors: ['#2E9BD6', '#FFB84D', '#FF6B9A', '#24D1C3', '#9B7CFF'] },
    finish: { vignette: 0.28 },
  };
}

/* ---------- Achievement ---------- */

export function everyContinent(): Scene {
  const [d, b] = radialBg([[0, '#123A6B'], [0.55, '#0C2247'], [1, '#060D1F']], 0.36);
  return {
    defs: [d],
    background: [b, stars(61, 70, '#FFFFFF', 2.6)],
    environment: [globe(512, 470, 250, '#1E6B9E', '#8FD0EC', '#FFD36B', 30)],
    mark: { holeColors: ['#FFD36B', '#4BE3B2', '#FF6B9A', '#9B7CFF', '#4DA6FF'] },
    finish: { vignette: 0.4, gloss: true },
  };
}

export function worldlyLegend(): Scene {
  const [d, b] = radialBg([[0, '#231B08'], [0.55, '#120D04'], [1, '#050301']], 0.34);
  return {
    defs: [d],
    background: [
      b,
      `<g opacity="0.6">${decoRays(512, 470, 24, 640, '#E8C25A', 0.28)}</g>`,
      bokeh(['#E8C25A', '#FFE9A8'], 10, 27, 12, 46, 0.05, 0.16),
    ],
    environment: [
      ...[0, 1, 2].map((i) => `<path d="${sparkle4(220 + i * 300, 180, 14 - i * 2)}" fill="#F3D888" opacity="0.85"/>`),
    ],
    mark: { material: GOLD, holeColors: ['#2A2008', '#463612', '#2A2008', '#463612', '#2A2008'] },
    finish: { vignette: 0.46 },
  };
}

export const CATALOGUE_RECIPES: Record<string, () => Scene> = {
  linen,
  explorer,
  spring,
  summer,
  autumn,
  'lunar-new-year': lunarNewYear,
  gold,
  marble,
  galaxy,
  'art-deco': artDeco,
  nordic,
  safari,
  mediterranean,
  'every-continent': everyContinent,
  'worldly-legend': worldlyLegend,
};
