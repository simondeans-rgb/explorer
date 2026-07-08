// Pure rules for Passport Covers (no assets, no native imports) so the season
// windows and unlock-progress copy are unit-testable under node.

export interface CoverUnlock {
  countries?: number;
  level?: number;
}

/** Months (1–12) a seasonal pack is in season, plus its off-season teaser. */
export interface CoverSeason {
  months: number[];
  returns: string; // "Returns in October"
}

/** Is a (possibly seasonal) section in season this month? month is 1–12. */
export function seasonActive(season: CoverSeason | undefined, month: number): boolean {
  return !season || season.months.includes(month);
}

/** Progress-aware lock caption, e.g. "Explore 25 countries — you have 19". */
export function lockProgress(cover: { unlock?: CoverUnlock }, countries: number, level: number): string | null {
  if (!cover.unlock) return null;
  if (cover.unlock.countries && countries < cover.unlock.countries) {
    return `Explore ${cover.unlock.countries} countries — you have ${countries}`;
  }
  if (cover.unlock.level && level < cover.unlock.level) {
    return `Reach Level ${cover.unlock.level} — you're Level ${level}`;
  }
  return null;
}
