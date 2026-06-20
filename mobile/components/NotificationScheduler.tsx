import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useData } from '../src/store/data';
import { rescheduleAnniversaries } from '../src/lib/notifications';

/** Reschedules travel-anniversary notifications on launch and whenever the app
 *  returns to the foreground, so the upcoming "on this day" reminders stay
 *  current as the user's trips and places change. Renders nothing. */
export function NotificationScheduler() {
  const { places, expeditions } = useData();

  useEffect(() => {
    rescheduleAnniversaries(expeditions, places);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') rescheduleAnniversaries(expeditions, places);
    });
    return () => sub.remove();
  }, [places, expeditions]);

  return null;
}
