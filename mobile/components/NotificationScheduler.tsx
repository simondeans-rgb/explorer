import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useData } from '../src/store/data';
import { rescheduleNotifications } from '../src/lib/notifications';

/** Reschedules our on-device reminders (travel anniversaries + post-trip
 *  discovery nudges) on launch and whenever the app returns to the foreground,
 *  so they stay current as the user's trips and places change. Renders nothing. */
export function NotificationScheduler() {
  const { places, expeditions, unifiedTrips } = useData();

  useEffect(() => {
    rescheduleNotifications(expeditions, places, unifiedTrips);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') rescheduleNotifications(expeditions, places, unifiedTrips);
    });
    return () => sub.remove();
  }, [places, expeditions, unifiedTrips]);

  return null;
}
