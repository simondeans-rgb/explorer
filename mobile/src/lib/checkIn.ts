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

export async function detectLocation(): Promise<CheckInResult> {
  try {
    const Location = await import('expo-location');

    const services = await Location.hasServicesEnabledAsync();
    if (!services) return { status: 'unavailable' };

    const perm = await Location.requestForegroundPermissionsAsync();
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
