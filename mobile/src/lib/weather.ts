// Current weather for the flight's destination, via Open-Meteo — free, no API
// key, no auth. Fetched by coordinates (which we already resolve for the route)
// and cached ~30 min per location so re-renders and polling stay cheap.

export interface Weather {
  tempC: number;
  code: number; // WMO weather code
  label: string;
  emoji: string;
}

/** Map a WMO weather code to a short label + emoji. */
export function wmoMeta(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: 'Clear', emoji: '☀️' };
  if (code <= 2) return { label: 'Partly cloudy', emoji: '🌤️' };
  if (code === 3) return { label: 'Cloudy', emoji: '☁️' };
  if (code === 45 || code === 48) return { label: 'Fog', emoji: '🌫️' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', emoji: '🌦️' };
  if (code >= 61 && code <= 67) return { label: 'Rain', emoji: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Snow', emoji: '🌨️' };
  if (code >= 80 && code <= 82) return { label: 'Showers', emoji: '🌦️' };
  if (code >= 85 && code <= 86) return { label: 'Snow showers', emoji: '🌨️' };
  if (code >= 95) return { label: 'Thunderstorm', emoji: '⛈️' };
  return { label: 'Weather', emoji: '🌡️' };
}

const CACHE_MS = 30 * 60 * 1000;
const cache = new Map<string, { at: number; value: Weather | null }>();

/** Current weather at [lat, lon]. Returns null on any failure so the tile just
 *  omits the weather rather than erroring. */
export async function fetchWeather(lat: number, lon: number, nowMs = Date.now()): Promise<Weather | null> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && nowMs - hit.at < CACHE_MS) return hit.value;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
    const res = await fetch(url);
    if (!res.ok) {
      cache.set(key, { at: nowMs, value: hit?.value ?? null });
      return hit?.value ?? null;
    }
    const data = await res.json();
    const t = data?.current?.temperature_2m;
    const code = data?.current?.weather_code;
    if (typeof t !== 'number' || typeof code !== 'number') {
      cache.set(key, { at: nowMs, value: null });
      return null;
    }
    const meta = wmoMeta(code);
    const value: Weather = { tempC: Math.round(t), code, label: meta.label, emoji: meta.emoji };
    cache.set(key, { at: nowMs, value });
    return value;
  } catch {
    cache.set(key, { at: nowMs, value: hit?.value ?? null });
    return hit?.value ?? null;
  }
}
