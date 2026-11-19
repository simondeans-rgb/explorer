// Foreground "trip check-in": read where the device is right now and resolve it
// to a country + city. Used to auto-add visited places while a trip is on.
//
// Foreground location works in Expo Go; background/geofenced tracking does not
// (that needs a custom dev/standalone build) — see the trip screen for how this
// is surfaced. expo-location is imported lazily so it never loads at startup.

export type CheckInResult =
  | { status: 'ok'; countryCode: string; city?: string }
  | { status: 'denied' }
  | { status: 'unavailable' }
  | { status: 'error' };

/** Where the device is right now. `prompt: false` never shows the system
 *  permission dialog — it only reads the location when access was already
 *  granted (used for the automatic arrival check, which must not ask for
 *  permission out of the blue). */
export async function detectLocation(opts: { prompt?: boolean } = {}): Promise<CheckInResult> {
  const prompt = opts.prompt ?? true;
  try {
    const Location = await import('expo-location');

    const services = await Location.hasServicesEnabledAsync();
    if (!services) return { status: 'unavailable' };

    const perm = prompt ? await Location.requestForegroundPermissionsAsync() : await Location.getForegroundPermissionsAsync();
    if (perm.status !== 'granted') return { status: 'denied' };

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const places = await Location.reverseGeocodeAsync({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
    const a = places[0];
    const countryCode = a?.isoCountryCode?.toUpperCase();
    if (!countryCode) return { status: 'error' };

    const city = a?.city ?? a?.subregion ?? a?.district ?? a?.region ?? undefined;
    return { status: 'ok', countryCode, city: city ?? undefined };
  } catch {
    return { status: 'error' };
  }
}
