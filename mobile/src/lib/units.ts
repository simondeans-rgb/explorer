// Distance / area unit preference + conversions.
//
// All travel distances are stored canonically in MILES (see travelStats) and
// country areas in KM² (see countryFacts); these helpers convert to whatever
// the Member picked in the Passport so the whole app reads in one system.

export type DistanceUnit = 'mi' | 'km';
export type TempUnit = 'c' | 'f';

export const KM_PER_MI = 1.609344;
const KM2_PER_MI2 = 2.589988; // 1 square mile in km²

const group = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Convert a canonical mileage to the chosen unit. */
export function convertMiles(miles: number, unit: DistanceUnit): number {
  return unit === 'km' ? miles * KM_PER_MI : miles;
}

/** Short label for the distance unit, e.g. "mi" / "km". */
export function distanceUnitLabel(unit: DistanceUnit): string {
  return unit;
}

/** A grouped, unit-converted distance number (no unit suffix). */
export function formatDistance(miles: number, unit: DistanceUnit): string {
  return group(convertMiles(miles, unit));
}

/** Convert a km² area to the chosen unit's area (km² or mi²). */
export function convertAreaKm2(km2: number, unit: DistanceUnit): number {
  return unit === 'mi' ? km2 / KM2_PER_MI2 : km2;
}

/** Area unit label, e.g. "km²" / "mi²". */
export function areaUnitLabel(unit: DistanceUnit): string {
  return unit === 'mi' ? 'mi²' : 'km²';
}

/** Convert a per-km² density (e.g. people/km²) to the chosen unit's per-area. */
export function convertDensityPerKm2(perKm2: number, unit: DistanceUnit): number {
  return unit === 'mi' ? perKm2 * KM2_PER_MI2 : perKm2;
}

/** Per-area unit label, e.g. "/km²" / "/mi²". */
export function perAreaUnitLabel(unit: DistanceUnit): string {
  return unit === 'mi' ? '/mi²' : '/km²';
}

/** Convert a Celsius temperature to the chosen unit (rounded to a whole degree). */
export function convertCelsius(celsius: number, unit: TempUnit): number {
  return unit === 'f' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
}

/** Temperature unit label, "°C" / "°F". */
export function tempUnitLabel(unit: TempUnit): string {
  return unit === 'f' ? '°F' : '°C';
}
