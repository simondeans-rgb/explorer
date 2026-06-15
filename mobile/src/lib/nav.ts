import { router } from 'expo-router';

/** Go back if there's somewhere to go, otherwise fall back to the Story tab.
 *  Used by every screen's back/close control so it always does something. */
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
