// The celebration a new country earns, if any — shared by every "add a country"
// entry point (the add sheet, tap-to-add on the map) so the delight is
// identical everywhere. Pure, so it's unit-testable.
import { COUNTRIES, countryName } from '../data/countries';

export interface Milestone {
  emoji: string;
  title: string;
  subtitle?: string;
}

const continentOf = (code: string): string | undefined => COUNTRIES.find((c) => c.code === code)?.continent;

/** Given the countries already discovered and a freshly-added code, the confetti
 *  moment it deserves — first country, every tenth (plus 25/75), a new
 *  continent, or all seven — or null for an ordinary add (which just buzzes). */
export function countryMilestone(priorCodes: Set<string>, code: string): Milestone | null {
  if (priorCodes.has(code)) return null;
  const count = priorCodes.size + 1;
  const priorConts = new Set([...priorCodes].map(continentOf).filter(Boolean) as string[]);
  const newCont = continentOf(code);
  const isNewContinent = !!newCont && !priorConts.has(newCont);
  const contsAfter = new Set(priorConts);
  if (newCont) contsAfter.add(newCont);

  if (count === 1) return { emoji: '🌍', title: 'Your first country!', subtitle: `${countryName(code)} — the adventure begins` };
  if (isNewContinent && contsAfter.size === 7) return { emoji: '🌏', title: 'Every continent!', subtitle: "You've now set foot on all seven" };
  if (count % 10 === 0 || count === 25 || count === 75) return { emoji: '🎉', title: `${count} countries!`, subtitle: `${countryName(code)} makes ${count}` };
  if (isNewContinent) return { emoji: '🗺️', title: 'A new continent', subtitle: `Welcome to ${newCont}` };
  return null;
}
