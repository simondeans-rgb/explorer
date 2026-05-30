import type { PassportStats } from './stats';

/** Society Recognitions — meaningful milestones, not badges or points. */
export interface Recognition {
  id: string;
  title: string;
  description: string;
  earned: boolean;
}

interface RecognitionDef {
  id: string;
  title: string;
  description: string;
  test: (s: PassportStats) => boolean;
}

const DEFS: RecognitionDef[] = [
  {
    id: 'first-discovery',
    title: 'First Discovery',
    description: 'Record your first country.',
    test: (s) => s.countriesDiscovered >= 1,
  },
  {
    id: 'citizen-of-elsewhere',
    title: 'Citizen of Elsewhere',
    description: 'Make a home in two or more countries.',
    test: (s) => s.countriesLived >= 2,
  },
  {
    id: 'continental-explorer',
    title: 'Continental Explorer',
    description: 'Discover countries on three continents.',
    test: (s) => s.continentsDiscovered >= 3,
  },
  {
    id: 'globetrotter',
    title: 'Globetrotter',
    description: 'Reach ten countries.',
    test: (s) => s.countriesDiscovered >= 10,
  },
  {
    id: 'city-collector',
    title: 'City Collector',
    description: 'Discover twenty-five cities.',
    test: (s) => s.citiesDiscovered >= 25,
  },
  {
    id: 'master-cartographer',
    title: 'Master Cartographer',
    description: 'Chart twenty-five countries.',
    test: (s) => s.countriesDiscovered >= 25,
  },
  {
    id: 'world-wanderer',
    title: 'World Wanderer',
    description: 'Set foot on six continents.',
    test: (s) => s.continentsDiscovered >= 6,
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Reach fifty countries.',
    test: (s) => s.countriesDiscovered >= 50,
  },
  {
    id: 'society-laureate',
    title: 'Society Laureate',
    description: 'Discover one hundred countries.',
    test: (s) => s.countriesDiscovered >= 100,
  },
];

export function evaluateRecognitions(stats: PassportStats): Recognition[] {
  return DEFS.map(({ id, title, description, test }) => ({
    id,
    title,
    description,
    earned: test(stats),
  }));
}
