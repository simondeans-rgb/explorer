import type { RecommendationVerdict } from '../../types';

// Recommendation verdict styling, drawn from the Navigator / Cartographer
// palettes. `active` is the selected toggle; `chip` is the read-only badge.
export const VERDICT_STYLE: Record<
  RecommendationVerdict,
  { active: string; chip: string }
> = {
  recommend: {
    active: 'bg-passport-navy text-passport-parchment border-passport-navy',
    chip: 'bg-passport-navy/10 text-passport-navy dark:text-passport-goldsoft border-passport-navy/30',
  },
  'hidden-gem': {
    active: 'bg-passport-gold text-passport-ink border-passport-gold',
    chip: 'bg-passport-gold/15 text-passport-ink dark:text-passport-goldsoft border-passport-gold/40',
  },
  'worth-visiting': {
    active: 'bg-passport-chart text-passport-parchment border-passport-chart',
    chip: 'bg-passport-chart/10 text-passport-chart dark:text-passport-goldsoft border-passport-chart/30',
  },
  overrated: {
    active: 'bg-passport-brass text-passport-vellum border-passport-brass',
    chip: 'bg-passport-brass/15 text-passport-brass dark:text-passport-amber border-passport-brass/30',
  },
  avoid: {
    active: 'bg-passport-burgundy text-passport-vellum border-passport-burgundy',
    chip: 'bg-passport-burgundy/15 text-passport-burgundy dark:text-passport-amber border-passport-burgundy/30',
  },
};
