// TripIt → Worldly places.
//
// TripIt can publish your trips as an iCalendar (.ics) feed / export: each
// itinerary item (flight, lodging, activity) is a VEVENT with a SUMMARY,
// a LOCATION and a start date. There's no explicit country field, so we
// best-effort match a country out of the LOCATION/SUMMARY text and record the
// year from DTSTART. Countries only (not per-item trips) — reliable and safe.
import { matchCountry, scanCountries } from './listImport';
import type { PlaceRow } from './flightyImport';

export interface TripitResult {
  rows: PlaceRow[];
  events: number; // VEVENTs seen
  matched: number; // events we pinned to a country
}

/** Unfold RFC-5545 folded lines: a CRLF followed by a space/tab continues the
 *  previous line. */
function unfold(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n');
}

/** Property value, stripping any ;PARAM= segments before the ':'. */
function propValue(line: string, name: string): string | null {
  if (!line.startsWith(name)) return null;
  const rest = line.slice(name.length);
  if (rest[0] !== ':' && rest[0] !== ';') return null;
  const colon = line.indexOf(':');
  return colon >= 0 ? line.slice(colon + 1).trim() : null;
}

function yearOf(dtstart: string | null): number | undefined {
  const m = dtstart?.match(/(\d{4})(\d{2})(\d{2})/) ?? dtstart?.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? Number(m[1]) : undefined;
}

/** Pull a "City, Country" pair out of a LOCATION string, if the last comma
 *  segment is a recognised country. */
function cityCountry(location: string): { code?: string; city?: string } {
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const code = matchCountry(parts[i]);
    if (code) return { code, city: i > 0 ? parts[i - 1] : undefined };
  }
  return {};
}

export function parseTripit(text: string): TripitResult {
  const lines = unfold(text);
  const rows: PlaceRow[] = [];
  const seenCountry = new Set<string>();
  const seenCity = new Set<string>();
  let events = 0;
  let matched = 0;

  let summary = '';
  let location = '';
  let dtstart: string | null = null;
  let inEvent = false;

  const flush = () => {
    events += 1;
    const blob = `${location} ${summary}`;
    const year = yearOf(dtstart);
    const { code, city } = cityCountry(location);
    const codes = new Set<string>();
    if (code) codes.add(code);
    for (const c of scanCountries(blob)) codes.add(c);
    if (codes.size) matched += 1;
    for (const c of codes) {
      if (!seenCountry.has(c)) {
        seenCountry.add(c);
        rows.push({ kind: 'country', countryCode: c, firstYear: year });
      }
      if (city && code === c) {
        const key = `${c}|${city.toLowerCase()}`;
        if (!seenCity.has(key)) {
          seenCity.add(key);
          rows.push({ kind: 'city', countryCode: c, name: city, firstYear: year });
        }
      }
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      summary = location = '';
      dtstart = null;
      continue;
    }
    if (line === 'END:VEVENT') {
      if (inEvent) flush();
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;
    const s = propValue(line, 'SUMMARY');
    if (s !== null) summary = s;
    const l = propValue(line, 'LOCATION');
    if (l !== null) location = l.replace(/\\,/g, ',').replace(/\\n/g, ' ');
    const d = propValue(line, 'DTSTART');
    if (d !== null) dtstart = d;
  }

  return { rows, events, matched };
}
