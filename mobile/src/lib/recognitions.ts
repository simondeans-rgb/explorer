import type { PassportStats } from './stats';
import type { DiscoveryStats } from './discoveryStats';

/** Discovery-derived counts needed by some Recognitions. Defaults to zero so
 *  callers without Discoveries loaded still evaluate the Passport ones. */
export type RecognitionContext = Pick<
  DiscoveryStats,
  'total' | 'restaurants'
>;

const NO_DISCOVERIES: RecognitionContext = { total: 0, restaurants: 0 };

// Society Recognitions — meaningful milestones, never badges, achievements or
// trophies (Brand Book §06/§07). The canonical six from the brand book. Two of
// them (Culinary Explorer, Master Cartographer) depend on the Discoveries area
// and remain unearned until it ships; the strip and Almanac surface only earned
// Recognitions, so they stay quietly dormant until then.
export interface Recognition {
  id: string;
  title: string;
  description: string;
  symbol: string;
  earned: boolean;
}

interface RecognitionDef {
  id: string;
  title: string;
  description: string;
  symbol: string;
  test: (s: PassportStats, d: RecognitionContext) => boolean;
}

const DEFS: RecognitionDef[] = [
  {
    id: 'first-discovery',
    title: 'First Discovery',
    description: 'First place added to your Passport.',
    symbol: '✦',
    test: (s) => s.countriesDiscovered >= 1,
  },
  {
    id: 'citizen-of-elsewhere',
    title: 'Citizen of Elsewhere',
    description: 'Lived in three or more countries.',
    symbol: '⋈',
    test: (s) => s.countriesLived >= 3,
  },
  {
    id: 'continental-explorer',
    title: 'Continental Explorer',
    description: 'All seven continents visited.',
    symbol: '⊕',
    test: (s) => s.continentsDiscovered >= 7,
  },
  {
    id: 'culinary-explorer',
    title: 'Culinary Explorer',
    description: 'Fifty restaurants discovered.',
    symbol: '◈',
    test: (_s, d) => d.restaurants >= 50,
  },
  {
    id: 'master-cartographer',
    title: 'Master Cartographer',
    description: 'One hundred Discoveries mapped.',
    symbol: '⊗',
    test: (_s, d) => d.total >= 100,
  },
  {
    id: 'society-laureate',
    title: 'Society Laureate',
    description: 'A lifetime honour of distinction.',
    symbol: '◉',
    test: (s) => s.countriesDiscovered >= 100,
  },
];

export function evaluateRecognitions(
  stats: PassportStats,
  discovery: RecognitionContext = NO_DISCOVERIES,
): Recognition[] {
  return DEFS.map(({ id, title, description, symbol, test }) => ({
    id,
    title,
    description,
    symbol,
    earned: test(stats, discovery),
  }));
}
