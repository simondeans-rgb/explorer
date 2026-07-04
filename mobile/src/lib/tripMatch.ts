// Match a photo (geotag country + taken-at time) to the trip it belongs to,
// so "add a photo" can pre-select the right journey — accept or change.
import { countryName } from '../data/countries';
import type { Expedition } from '../types';

const DAY = 86_400_000;
// Photos from the flight out / home, or with a slightly-off camera clock,
// should still land on the trip.
const GRACE = 3 * DAY;

function range(e: Expedition): { from: number; to: number } | null {
  if (!e.startDate) return null;
  const from = new Date(e.startDate).getTime();
  const to = e.endDate ? new Date(e.endDate).getTime() + DAY : from + DAY; // end date is inclusive
  return isFinite(from) && isFinite(to) ? { from, to } : null;
}

/** Best trip for a photo. Dated matches (taken during the trip ± grace) win;
 *  a country + same-year match is the fallback. Returns undefined when nothing
 *  plausibly fits — never guess a wrong trip. */
export function matchExpedition(
  expeditions: Expedition[],
  photo: { countryCode?: string; takenAt?: number },
): Expedition | undefined {
  let best: Expedition | undefined;
  let bestScore = 0;
  for (const e of expeditions) {
    const r = range(e);
    let score = 0;
    if (photo.takenAt && r && photo.takenAt >= r.from - GRACE && photo.takenAt <= r.to + GRACE) {
      score = 2;
      if (photo.countryCode && e.countryCodes.includes(photo.countryCode)) score = 3;
    } else if (
      photo.countryCode &&
      e.countryCodes.includes(photo.countryCode) &&
      photo.takenAt &&
      e.startDate &&
      new Date(photo.takenAt).getFullYear() === Number(e.startDate.slice(0, 4))
    ) {
      score = 1;
    }
    if (score > bestScore) {
      best = e;
      bestScore = score;
    } else if (score === bestScore && score > 0 && best && r) {
      // Tie-break on the trip whose start is closest to the photo.
      const bestR = range(best);
      if (photo.takenAt && bestR && Math.abs(photo.takenAt - r.from) < Math.abs(photo.takenAt - bestR.from)) best = e;
    }
  }
  return best;
}

/** Short display label for a trip row: "Spain · Nov 2021". */
export function expeditionLabel(e: Expedition): string {
  const title = e.title || (e.countryCodes[0] ? countryName(e.countryCodes[0]) : 'Trip');
  if (!e.startDate) return title;
  const d = new Date(e.startDate);
  const when = isFinite(d.getTime())
    ? `${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}`
    : e.startDate.slice(0, 4);
  return title.includes(String(d.getFullYear())) ? title : `${title} · ${when}`;
}
