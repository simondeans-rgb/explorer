import { router } from 'expo-router';

/** Go back if there's somewhere to go, otherwise fall back to the Story tab.
 *  Used by every screen's back/close control so it always does something. */
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// A route a signed-out user chose from onboarding QuickStart. We can't navigate
// there while the sign-in wall is up, so we stash it and replay it once they
// authenticate (or continue as guest) — otherwise the QuickStart buttons would
// silently do nothing.
let pendingRoute: string | null = null;
export function setPendingRoute(route: string | null): void {
  pendingRoute = route;
}
export function takePendingRoute(): string | null {
  const r = pendingRoute;
  pendingRoute = null;
  return r;
}
