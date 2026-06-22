# SESSION_HANDOVER.md

> Handover for the next Claude Code session. Read this top to bottom before
> touching anything. The active product is the **mobile app** under `mobile/`.
> Most work ships as **OTA updates** to a TestFlight build; some changes require
> a new native build. Everything below reflects the state at the end of the
> previous session.

---

# Project Overview

## What the project is
**Worldly** (internal/legacy name "Explorer's Passport") is a **premium personal
travel-memory app** — "a cloud-synced personal travel archive." Think *travel
magazine meets premium mobile app*: story-first, visual, airy. Members log the
countries/cities they've visited, journeys (flights/rail/road), and
"discoveries" (places/food/stays/experiences they want to remember), and the app
turns that into beautiful maps, stats, an Almanac, a "Wrapped"-style year in
review, achievements, and social recommendations via a friends "Circle."

There are **two apps in one repo**:
1. **Web app** — Vite + React + TypeScript at the repo **root** (`src/`,
   `index.html`, `vite.config.ts`). Deployed to **Vercel**
   (https://stickynotes-sand.vercel.app) from the `main` branch.
2. **Mobile app** — Expo / React Native in **`mobile/`**. This is the **primary
   focus**. Shipped to the user's iPhone via **EAS Update** (OTA, also runnable
   in Expo Go for dev) and **TestFlight** (native builds).

The web app predates the mobile app. **All recent work has been on `mobile/`.**

## Core purpose and goals
- A private, beautiful archive of everywhere you've been.
- Make the user's own data feel premium and rewarding (maps, stats, levels,
  Wrapped, Almanac, printable exports).
- Light social layer ("Your Circle") — real recommendations from friends.
- Launch-ready for the App Store.

## Current development status
- Mobile app is **feature-rich and on TestFlight** (current build **1.0.0 (9)**).
- Actively iterating on **UI polish** and **launch readiness**.
- Email/password + **Google** sign-in work. **Apple sign-in is built but the
  button is currently hidden** (Apple-side authorization failure — see Known
  Issues).
- Notifications backend (Cloud Functions + APNs) is **fully wired**; needs a
  build that registers push tokens (build 9 has it) + user opt-in to verify.

## Key user requirements and constraints
- **iPhone-only** for now (`supportsTablet: false`; iOS is the priority; Android
  config exists but isn't shipped/tested).
- **Ship fast via OTA.** The user reloads the app to see changes. Prefer OTA
  (JS-only) changes; only do native builds when a change needs native modules.
- **Merge preference: AUTO.** After pushing to the dev branch, open a PR into
  `main` and **squash-merge immediately without asking** (matches PR history,
  triggers Vercel web deploy), then OTA. Only pause for risky/ambiguous changes.
- Always run **typecheck + build/export + lint** before merging.
- The user is **non-deeply-technical** for cloud/Apple config — walk them
  through console steps clearly; automate via APIs where possible.
- **Security constraints that remain in effect:**
  - `EXPO_TOKEN` is used **inline** in `eas` commands only, **never committed**.
    (It was provided by the user; if missing, ask the user for it.)
  - **Never commit the model identifier** in commits/PRs/code/artifacts.
  - PR/commit bodies end with the `Co-Authored-By: ...` + `Claude-Session: ...`
    trailer (see existing commits for the exact format).
  - Repo scope is `simondeans-rgb/explorer` only.

---

# Technical Architecture

## Tech stack (mobile — the active app)
- **Expo SDK 54**, **React Native 0.81.5**, **React 19.1**, **New Architecture**.
- **Expo Router** (file-based routing in `mobile/app/`), typed routes enabled.
- **NativeWind 4** (Tailwind for RN) + plain `StyleSheet`/inline styles.
- **Firebase JS SDK 12** (`firebase/auth`, `firebase/firestore`,
  `firebase/storage`) — **not** the native `@react-native-firebase`.
- **react-native-reanimated 4** + **react-native-gesture-handler** (animations,
  the discovery fan carousel, map animations).
- **react-native-svg 15** + **d3-geo** (world maps, route maps, score rings).
- **expo-notifications** (local anniversaries + push tokens).
- **expo-apple-authentication** + **@react-native-google-signin/google-signin**
  (social sign-in; Apple currently hidden).
- **expo-crypto** (Apple nonce hashing).
- **@sentry/react-native** (crash/error reporting).
- **expo-print** + **expo-sharing** (HTML→PDF exports: map poster, Wrapped
  poster, Almanac photobook, itinerary docs).
- **expo-location** + **expo-task-manager** (background location → auto-detect
  visited places), **expo-image / expo-image-picker / expo-media-library**.
- **expo-glass-effect** (iOS 26 Liquid Glass, guarded — falls back to BlurView).
- **expo-build-properties** (iOS `extraPods` modular headers — see Known Issues).

## Tech stack (web — root, secondary)
- Vite + React + TS + Tailwind, Firebase (reads `VITE_FIREBASE_*` at build time),
  deployed to Vercel from `main`. Falls back to a localStorage demo when env vars
  are absent. **Not the current focus.**

## Database structure (Firestore)
Firebase project **`stickynotes-c13ac`** (project number `495314900593`).
Collections (all writes are owner-scoped via `firestore.rules` at repo root):
- `places/{id}` — countries/cities/regions the member has logged. `userId`,
  `kind` ('country'|'city'|'region'), `countryCode`, `relationships[]`
  (visited/lived/worked/studied/based/born/aspiring), `firstYear`, `note`.
- `discoveries/{id}` — saved places/food/etc. `userId`, `category`
  (food/accommodation/culture/experience/nature), `verdict`
  (recommend/hidden-gem/worth-visiting/overrated/avoid), `name`, `city`,
  `countryCode`, `photo`, `createdAt`.
- `expeditions/{id}` — journeys/trips of record. `userId`, `title`, `journeys[]`
  (mode: flight/rail/cruise/road/ferry), `countryCodes[]`, dates.
- `captures/{id}` — photo memories. `saved/{id}` — bookmarks.
- `trips/{id}` — **planned/shared** trips (itinerary + dayNotes). Collaborative:
  `userId` (owner) + `memberIds[]` + `memberNames{}`; edits stamp
  `lastEditedBy`. Read/update allowed for any member; delete owner-only.
- `covers/{id}` — custom country cover photos (owner-private).
- `profiles/{uid}` — member profile (name, etc.), looked up by uid; no listing.
- `codes/{code}` — friend-invite code → uid resolver (exact-id fetch only).
- `connections/{id}` — friendships/requests between exactly two members.
  Deterministic id `a__b` (sorted). `status` pending/accepted, `members[]`,
  `requestedBy`. Only the **recipient** (not requester) may accept.
- `pushTokens/{uid}` — Expo push token + per-type prefs
  (`friendActivity`, `tripActivity`). Owner-write, **no client read** (Cloud
  Functions read via admin SDK).
- `activityThrottle/{uid}` — notification cooldown bookkeeping (functions only).

`firestore.rules` and `storage.rules` live at the **repo root** and are deployed
with the Firebase CLI (**already deployed** this session).

## Authentication approach
- **Firebase Auth** via the JS SDK, with **AsyncStorage persistence** on RN
  (`mobile/src/lib/firebase.ts`, `mobile/src/store/auth.tsx`).
- Methods: email/password (`signIn`, `signUp`, `resetPassword`), `signInWithApple`
  (native Apple → `OAuthProvider('apple.com')` + hashed nonce), `signInWithGoogle`
  (`@react-native-google-signin` → `GoogleAuthProvider`).
- Providers enabled in Firebase: **Apple ✅, Google ✅** (verified via Identity
  Toolkit API).
- `isFirebaseConfigured` gates real auth vs offline/demo mode. **Crucial fix
  this session:** the mobile app's `EXPO_PUBLIC_FIREBASE_*` were never set in
  EAS, so the app ran in demo mode (no sign-in). `firebase.ts` now has the
  **public web Firebase config hardcoded as fallbacks**, so the app is always
  configured. (These values are public — they ship in the web app too.)
- **Auth gate:** `mobile/components/AuthGate.tsx` is a full-screen sign-in/
  create-account screen shown by `mobile/app/_layout.tsx` whenever
  `configured && !user && !guest`. "Continue without an account" sets a
  session-only guest flag. Firestore only activates once signed in
  (`cloud = Boolean(uid && db)` in `mobile/src/store/data.tsx`).

## API integrations
- **Firebase** (Auth/Firestore/Storage) — JS SDK.
- **Cloud Functions** (`functions/src/index.ts`, Gen-2, region `europe-west1`):
  `onPlaceCreated`, `onDiscoveryCreated`, `onExpeditionCreated` (friend-activity
  push), `onTripUpdated` (trip-crew push). Uses `firebase-admin` +
  `expo-server-sdk`. Per-key cooldowns (30-min author, 15-min trip). **Deployed.**
- **Expo Push Service** — sends iOS notifications; uses the registered APNs key.
- **App Store Connect API** — used (via Node JWT scripts) to manage the iOS
  Distribution Certificate, provisioning profile, App ID capabilities (Push +
  Sign in with Apple), and to submit builds.
- **Sentry** — crash/error reporting (org `simon-deans`, EU region
  `de.sentry.io`, project `worldly`).
- **Firebase Management API** (via `firebase-tools` + a CI token) — used to
  create the iOS Firebase app and fetch its Google OAuth client config.

## Deployment architecture
- **Web:** Vercel auto-deploys on push to `main` (~1-2 min). Env vars
  `VITE_FIREBASE_*` set in Vercel project settings (Production scope).
- **Mobile native builds:** EAS Build (cloud, macOS workers). Profile
  `production` in `mobile/eas.json`. **Auto-submit** to TestFlight via the ASC
  API key. Builds are signed with **local credentials** (`credentialsSource:
  local` + `mobile/credentials.json`). Current TestFlight build: **1.0.0 (9)**.
- **Mobile OTA (the common path):** `eas update --branch main --platform ios`.
  Runtime version policy `sdkVersion` (`exposdk:54.0.0`) — one OTA serves all
  builds 7/8/9. **Use `--platform ios`** (all-platform export hits EMFILE).

## Environment variables and configuration
- **Mobile build-time (`EXPO_PUBLIC_*`)** inlined by Metro. Firebase config now
  has **hardcoded fallbacks** in `firebase.ts`, so missing env vars no longer
  break the app. `EXPO_PUBLIC_SENTRY_DSN` is set in the EAS "production"
  environment; Sentry DSN also has a hardcoded fallback in `sentry.ts` so it
  works in OTA bundles. Google client IDs are hardcoded (public) in `auth.tsx`,
  overridable via `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` /
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
- **Secrets (never commit; provided by the user / live in the sandbox):**
  - `EXPO_TOKEN` — Expo access token; used **inline** in `eas` commands.
  - Firebase CLI token (`firebase login:ci`) — used for `firebase deploy` and
    Firebase Management API calls. The user should revoke it when done.
  - ASC API key `.p8` at `/home/user/AuthKey_SXU2FM998Y.p8` (outside the repo).
  - APNs key `.p8` (uploaded once; registered with Expo — see below).
  - iOS signing: `mobile/credentials/dist.p12` (password `worldly123`) +
    `mobile/credentials/worldly.mobileprovision` (gitignored; live on the
    sandbox disk).
- **Public identifiers (safe, already in code/config):**
  - Firebase project: `stickynotes-c13ac` (number `495314900593`),
    authDomain `stickynotes-c13ac.firebaseapp.com`,
    web appId `1:495314900593:web:3c9b1d1fc1ccb0c43dedd0`,
    iOS appId `1:495314900593:ios:e5cf21503d38f90f3dedd0`.
  - Google Web client id `495314900593-8h1873abt0nmcnubrbr6bji825gh4g70.apps.googleusercontent.com`;
    iOS client id `495314900593-7m5rjdob53fnihjii0ubk73fsloitqef.apps.googleusercontent.com`;
    reversed (URL scheme) `com.googleusercontent.apps.495314900593-7m5rjdob53fnihjii0ubk73fsloitqef`.
  - EAS project id `31d88642-eb0d-4c42-8642-7637ce0a3701`, owner `simmyd23`,
    slug `mobile`, channel `main`.
  - Apple: Team `PR99YSXB7G`, bundle `com.simmyd23.worldly`, ASC App ID
    `6782019443`, ASC API Key id `SXU2FM998Y`, Issuer
    `93331274-c262-4e2a-ab36-7c8beacb0418`, APNs key id `TWB3Z3L67G`.
  - Sentry DSN (public, send-only) is hardcoded in `mobile/src/lib/sentry.ts`.

---

# Repository Structure

```
/ (repo root = WEB app, Vite)
  src/                      Web app source (React) — secondary, not active
  index.html, vite.config.ts, vercel.json, tailwind.config.ts
  firebase.json             Firebase deploy config (functions/firestore/storage)
  .firebaserc               default project: stickynotes-c13ac
  firestore.rules           Firestore security rules (deployed)
  storage.rules             Storage rules
  functions/                Cloud Functions (Gen-2, TypeScript)
    src/index.ts            4 notification triggers + helpers
  ARCHITECTURE.md, README.md, CLAUDE.md
  mobile/                   ►► THE ACTIVE APP (Expo / React Native) ◄◄
```

```
mobile/
  app/                      Expo Router routes (file-based)
    _layout.tsx             Root: providers, AuthGate, global tab bar, sheets,
                            Sentry wrap, rnCompat import (FIRST), notif scheduler
    (tabs)/
      index.tsx             STORY (home): hero, countdown, level card, your world,
                            memories, "from your circle"
      atlas.tsx             ATLAS: world map + "Your world" summary (AtlasSummary)
      circle.tsx            YOUR CIRCLE: empty state + recommendations/visits/
                            wishlists/compatibility
      explore.tsx           EXPLORE: Browse (rotating facts, wishlist, continents)
                            + Discoveries (fan carousel)
      you.tsx               YOU: profile, level, Wrapped/Almanac, import, cloud
                            sync (sign out), notifications, legal, delete account
      _layout.tsx           (tabs) stack config
    achievements.tsx, almanac.tsx, wrapped.tsx, friends.tsx, import.tsx,
    search.tsx, country/[code].tsx, discovery/[id].tsx, trip/[id].tsx, journey/...
  components/               ~40 components (see Design System)
  src/
    lib/                    Engines & helpers (stats, theme, firebase, sentry,
                            push, notifications, exports, rnCompat, etc.)
    store/                  React context providers: auth, data, toast,
                            celebration, onboarding
    hooks/                  useWorldly, useFriends, ...
    data/                   Static data: countries, countryFacts, regions, ...
    types.ts                Domain types + metadata (categories, verdicts, etc.)
  assets/                   Icons, splash, logo art
  credentials/              Local iOS signing (gitignored): dist.p12, .mobileprovision
  credentials.json          Points EAS at the local signing files
  app.json                  Expo config (plugins, bundle id, permissions)
  eas.json                  EAS build/submit profiles
  package.json
```

## Key files (mobile) — purpose
- `app/_layout.tsx` — app shell. **Imports `../src/lib/rnCompat` first** (must
  stay first). Mounts `AuthProvider`/`DataProvider`/etc., the `AuthGate` overlay,
  `GlobalTabBar`, action menu + add sheets, `NotificationScheduler`,
  `LocationSync`, `AchievementWatcher`. Wrapped with Sentry.
- `src/lib/firebase.ts` — Firebase init w/ public-config fallbacks +
  `isFirebaseConfigured`.
- `src/store/auth.tsx` — auth context (email/Apple/Google).
- `src/store/data.tsx` — the data layer; local AsyncStorage + Firestore sync
  (only when signed in). Itinerary mutations stamp `lastEditedBy`.
- `src/hooks/useWorldly.ts` — computes `{ stats, discoveryStats, journeyStats,
  level, badges, aggregates }` from the live store. **The main read model.**
- `src/lib/stats.ts` / `discoveryStats.ts` / `journeyStats.ts` / `explorer.ts` /
  `recognitions.ts` — the compute engines.
- `src/lib/theme.ts` — `COLORS`, `BRAND_GRADIENT`, `GRADIENTS`,
  `DISCOVERY_CATEGORY_COLOR`.
- `src/lib/sentry.ts` — `initSentry`, `wrapWithSentry`, `reportError` (DSN
  fallback so OTA bundles report).
- `src/lib/rnCompat.ts` — **critical shim** neutralizing RN's removed
  `PushNotificationIOS` getter (see Known Issues / Lessons).
- `src/lib/push.ts` / `notifications.ts` — remote push prefs/tokens + on-device
  anniversaries.
- Export builders: `mapPoster.ts`, `wrappedPoster.ts`, `almanacBook.ts`,
  `itineraryDoc.ts` (all HTML→PDF via `expo-print`, lazy-imported).
- `components/AuthGate.tsx`, `components/SocialAuthButtons.tsx` (Google-only
  now), `components/PageHero.tsx` (eyebrow optional), `components/DiscoveryFan.tsx`
  (fan carousel), `components/GlobalTabBar.tsx`, `components/WorldMap.tsx`,
  `components/RouteMap.tsx`, `components/AtlasSummary.tsx`.

---

# Current State

## Features completed
- **Onboarding**, **auth** (email/Google + AuthGate + sign-out), demo fallback.
- **Story/Atlas/Circle/Explore/You** tabs with a floating glass bottom tab bar +
  bottom-right FAB and an action menu (add place/discovery/journey/photo/trip).
- **World map** (dark luminous theme) with light-up + per-region framing
  animations; **Route map** for journeys (flight routes drawn by date).
- **Stats engines**: countries/cities/continents, discovery stats, journey
  stats, **Explorer level + XP + badges**, **recognitions**.
- **Wrapped** ("Your world, wrapped") story + **shareable PDF poster**.
- **Almanac** + **"Export as photo book"** multi-page PDF; **map poster** export.
- **Your Circle**: empty state (ghost circle is a tappable add-friend button +
  clearly-labelled PREVIEW tiles), recommendations, recently visited, wishlists,
  **travel compatibility** (cosine similarity over taste tokens). Friend
  connections via invite codes.
- **Explore**: Browse (search, daily-rotating "Around the world" facts incl.
  bucket-list sights, wishlist, continent carousels) + **Discoveries fan
  carousel** with category/country filters.
- **Notifications**: on-device travel anniversaries; **Cloud Functions deployed**
  for friend-activity + trip-crew push; **APNs key registered** with Expo.
- **Launch readiness**: privacy policy/terms/support pages (hosted on web),
  account deletion, data export, permission strings, **Sentry**, app icon.
- **Background location** (Option B) auto-detects visited places.
- **Imports**: Flighty CSV, country list, photo-library geotag scan.

## Features partially completed
- **Apple sign-in**: fully coded + App ID/profile configured, but the **button is
  hidden** (Apple servers reject with "Sign up not complete"). Re-enable is a
  one-line change in `SocialAuthButtons.tsx` once the Apple-side issue clears.
- **Notification delivery**: backend + APNs ready; needs user to install build 9,
  toggle a notification on (registers token), then a test push to confirm
  end-to-end. Not yet verified on a real device.

## Features not yet started
- **App Store submission pack**: App Privacy "nutrition label", age rating,
  screenshots, description, demo account, marketing. (User-side, with guidance.)
- Android shipping (config exists; untested).

## Known issues
- **Apple sign-in fails on Apple's side** ("Sign up not complete" in the Apple
  sheet) for both Share/Hide email. App + App ID config verified correct
  (capability = primary App ID, entitlement in profile, provider enabled).
  Leading causes: the device Apple ID's **2FA** and/or **Apple rate-limiting**
  from repeated attempts. Button hidden for now.
- **App Store Guideline 4.8**: offering **Google without Apple** is a likely
  rejection. Before submitting, either re-enable a working Apple sign-in, drop
  Google (leaving email/password), or add another 4.8-compliant option.
- **`firebase-functions` is a major version behind** and the functions **Node 20
  runtime** is slated for decommission **2026-10-30** — bump before autumn.
- Pre-existing harmless lint warnings: `_layout.tsx` (react-refresh),
  `AuthContext`/`auth.tsx` (react-refresh), `atlas.tsx` (`inScope`
  exhaustive-deps). Not regressions; leave unless you're in the file.

## Technical debt
- iOS build infra is added to `eas.json` only at build time and reverted after
  (the add/revert commits net to nothing). Build credentials live on the sandbox
  disk (ephemeral) — may need regeneration if the sandbox is reclaimed.
- The discovery **fan carousel** math (overlap/rotation/sizes) was tuned blind
  (no on-device preview) — works, but iterate from screenshots.

---

# Active Work

## Most recent work (this session, newest first)
A long run of **mobile UI polish + launch-readiness + bug-fixing**, all shipped
via OTA (and merged to `main`). Recent items:
1. **Simplified section hero copy** (made `PageHero` eyebrow optional): Atlas =
   "Your Atlas / The world you've explored"; Circle = "Your Circle / Discover
   what friends loved"; Explore = "Explore / Find your next adventure".
2. **Discovery fan carousel** spacing: top-aligned cards to remove the big gap
   under the filters and add breathing space below; cards shrunk to ~0.52 width.
3. **Story level card** made vibrant again (brand-gradient level badge +
   gradient progress bar on a compact white card).
4. **Story/Circle/Explore polish**: compact white level card; bigger "Hi {name}"
   greeting; ghost-circle is now a button; invite button shrunk + de-gradiented;
   Circle preview relabelled as a clear example (name "Simon"→"Maya"); Explore
   "Around the world" facts now rotate daily (+ bucket-list sights); discoveries
   shown as the fan carousel.
5. **Story hero**: tagline → "Life is better when you explore."; removed the
   "Add to your map" button + search icon + the duplicate lower line.
6. **Removed Sign in with Apple button** (kept the code/capability).
7. **Crash fixes** (see Session Context): `PushNotificationIOS` shim (`rnCompat`),
   social-button native-probe removal, Firebase-always-configured.
8. Earlier in the session: Wrapped/Almanac premium PDF exports; Explore/Story/
   coral-rebalance polish; **TestFlight build 9** (Apple+Google native modules);
   **Cloud Functions deploy**; **APNs key registration**.

## Files modified during this session (high-traffic)
`mobile/app/(tabs)/index.tsx`, `atlas.tsx`, `circle.tsx`, `explore.tsx`,
`you.tsx`; `mobile/app/_layout.tsx`, `wrapped.tsx`, `almanac.tsx`;
`mobile/components/PageHero.tsx`, `AuthGate.tsx` (new), `SocialAuthButtons.tsx`
(new), `DiscoveryFan.tsx` (new), `DiscoveryTile.tsx`;
`mobile/src/store/auth.tsx`; `mobile/src/lib/firebase.ts`, `sentry.ts`,
`rnCompat.ts` (new), `theme.ts`, `wrappedPoster.ts` (new), `almanacBook.ts`
(new); `mobile/app.json`, `mobile/eas.json` (build-infra, reverted);
`functions/src/index.ts`; root `firestore.rules`.

## Decisions made
- **Hardcode public config as fallbacks** (Firebase, Google client IDs, Sentry
  DSN) rather than rely on EAS env vars — so OTA bundles and fresh builds are
  always configured. These values are public.
- **Gate social buttons with zero native calls at mount**
  (`Platform.OS==='ios' && executionEnvironment !== StoreClient`) — never touch
  native modules during render (a native fault there hard-crashes and isn't
  catchable by JS try/catch).
- **EAS-managed vs local credentials:** kept the **proven local-credentials**
  flow (the working `dist.p12`/profile were on disk) instead of switching to
  EAS-managed mid-incident.
- **Remove Apple button** (vs chasing Apple's server issue) at the user's
  request; retain all Apple code/config for easy re-enable.

## Alternatives considered and rejected
- Switching iOS credentials to **EAS-managed** — rejected (the local creds
  already worked; non-interactive cert creation had failed before).
- Fixing the carousel crash by removing only the Google native probe — improved
  but insufficient; the real fix was the `PushNotificationIOS` shim.
- Configuring Apple **Hide My Email** relay (domain verification) — the user's
  "Share My Email" attempt also failed, so it wasn't the relay; not pursued.

---

# Design System

## Branding
Premium consumer travel app — "travel magazine meets premium mobile app",
story-first, visual, airy. **Tokens keep the legacy `passport-*` names** so the
whole app themes from one place; semantics:
- `passport-navy` = primary indigo ink/surface; `passport-gold` = **sunset-coral
  accent** (#FF6A55); `passport-chart` = electric indigo; `passport-brass` = teal.
- Surfaces are clean **white cards** (`shadow-card`/`shadow-float`, no hard
  borders), rounded-2xl/3xl, generous spacing.
- Brand mark/logo in `components/Brand.tsx` (web) and
  `mobile/components/WorldlyLogo.tsx` (the colourful "W" travel-cards lockup;
  `WorldlyLogo` lockup + `WorldlyIcon` icon-only, `white` variant for dark).

## Colours (`mobile/src/lib/theme.ts`)
- `COLORS`: `navy #14213D`, `coral #FF6B9A`, `lavender #9B7CFF`, `aqua #24D1C3`,
  `sunburst #FFB84D`, `warmwhite #FAFAFC`, `night #0E1018`, `ink #14213D`,
  `ink2 #48506B`, `ink3 #8A90A6`.
- `BRAND_GRADIENT = ['#FF6B9A','#9B7CFF','#24D1C3']` (coral→lavender→teal).
- `GRADIENTS`: per-surface (story/atlas/explore/you/saved/sunrise).
- `DISCOVERY_CATEGORY_COLOR`: food `#FFB84D`, accommodation `#9B7CFF`, culture
  `#24D1C3`, experience `#FF8A5B`, nature `#34C77B`.
- **Coral discipline (user preference):** reserve **coral for primary actions**;
  use purple/teal/amber/etc. for categories. The user has twice said **gradients
  can feel "off"** for non-hero surfaces — prefer **solid fills / white cards**
  for buttons/cards; keep gradients for hero backdrops and small accents (badges,
  progress bars).

## Typography
- **Fraunces** (serif display) for titles/numbers; **Plus Jakarta Sans** (UI) —
  `PlusJakarta` (medium) and `PlusJakarta-Bold`. **Caveat** for occasional
  handwritten accents. Fonts loaded in `app/_layout.tsx` via `expo-font`.

## UI patterns
- **`PageHero`** for tab headers: optional `eyebrow`, Fraunces `title`, optional
  `subtitle`, image or gradient backdrop with a signature "wave" bottom edge.
  Keep hero copy to **two short lines** (title + subtitle).
- White rounded-3xl cards; one clear primary action per screen; the coral→indigo
  gradient only for hero CTAs/accents.
- **Navigation:** floating glass bottom tab bar (`GlobalTabBar`) — Story / Atlas
  / Circle / Explore / You + a bottom-right FAB; iOS 26 Liquid Glass via
  `expo-glass-effect` (guarded require → BlurView fallback).
- Index.css-equivalent utilities exist on web; on mobile use NativeWind classes +
  `theme.ts`.

## Reusable components (mobile/components — ~40)
`WorldlyLogo`, `PageHero`, `AppShell`/`GlobalTabBar`, `DestinationImage` (country
photo or brand-gradient fallback + scrim, optional motion), `WorldMap`,
`RouteMap`, `AtlasSummary`, `ScoreRing`, `AchievementBadge`, `DiscoveryCard`,
`DiscoveryTile`, `DiscoveryFan`, `AuthGate`, `AuthSheet`, `SocialAuthButtons`,
`Onboarding`, `ActionMenu`, `AddPlaceSheet`/`AddDiscoverySheet`/`AddTripSheet`/
`AddPhotoSheet`/`AddTripPlanSheet`, `SheetShell`, `LandmarkDetailSheet`,
`DeleteAccountSheet`, `XpDetailSheet`, `NotificationScheduler`, `LocationSync`,
`AchievementWatcher`, `Squiggle`, `Brand`.

---

# Product Decisions

## Important product choices
- **Story-first home**: the Story tab leads with a warm greeting + hero; the
  primary mental model is *your own travel story*, not search. Search lives in
  Explore (the in-hero search button was removed per the user).
- **Your data is the hero**: levels, Wrapped, Almanac, exports make the user's
  own log feel rewarding even with a small circle.
- **Circle is a teaser when empty**: the empty state previews what the circle
  will look like (clearly labelled "PREVIEW", generic names — never the member's
  own name).
- **Explore facts rotate daily** for fresh inspiration (superlatives + bucket-
  list sights).
- **Discoveries are a fan carousel** (a "hand of cards") rather than a grid.

## Business rules
- **Auth gate** shows when Firebase is configured and nobody is signed in; guests
  can continue on-device (session-only).
- **Cloud sync only when signed in** (`cloud = uid && db`); guests stay on local
  AsyncStorage — no unauthenticated Firestore reads.
- **Friend connections**: deterministic two-member doc; only the recipient can
  accept (rules-enforced).
- **Notification cooldowns**: 30-min per author (friend activity), 15-min per
  trip (crew). Anniversaries are on-device only (no server).
- **iPhone-only**, App-Store-bound.

## User workflows
1. Open app → (signed out) **AuthGate** → email/Google or "continue without an
   account" → Story.
2. Add place/discovery/journey/photo/trip via the **FAB → action menu** sheets.
3. Browse **Atlas** map, **Explore** facts + discoveries, **Circle**
   recommendations; view **Wrapped/Almanac**; export PDFs; tweak notifications &
   account in **You**.

## Assumptions to preserve
- Keep the `passport-*` token names (don't rename the theme).
- Keep **public config hardcoded as fallbacks** (don't "clean up" into env-only —
  it breaks OTA/builds).
- Keep `rnCompat` imported **first** in `_layout.tsx`.
- Keep social sign-in gated so **no native code runs at mount**.
- Prefer **OTA** for JS changes; only rebuild for native changes.

---

# Outstanding Tasks

## Prioritised
1. **Verify push notifications end-to-end** — have the user install build 9,
   enable a "From your circle"/"Trip crew" toggle (registers a token), then send
   a test push via the Expo push API to confirm delivery. (Backend + APNs ready.)
2. **Apple sign-in** — decide: (a) get it working (user checks Apple-ID 2FA, wait
   out any rate-limit, retry once; the button re-enable is one line in
   `SocialAuthButtons.tsx`), or (b) leave hidden and resolve **Guideline 4.8**
   another way before submission.
3. **App Store submission pack** — App Privacy label, age rating, screenshots,
   description, demo account; final review pass. (User-side; guide them.)
4. **Maintenance**: bump `firebase-functions` to latest + move functions off
   **Node 20** (decommission 2026-10-30); redeploy.
5. **Continue UI polish** as the user requests (they iterate from screenshots).

## Recommended next actions
- Confirm with the user whether to chase Apple sign-in or pursue 4.8 compliance
  another way (this gates submission).
- Offer the push-notification verification test.

## Blockers and dependencies
- Apple sign-in is **Apple-server-side** (out of our code's control).
- Native builds depend on the **local credentials** on the sandbox disk and a
  valid `EXPO_TOKEN`/ASC key. If the sandbox was reclaimed, regenerate
  credentials via the ASC API (the in-session Node scripts pattern) before
  building.
- Cloud Functions require the **Blaze** billing plan (already enabled).

---

# Development Notes

## Common commands (run from `mobile/`)
```bash
npx tsc --noEmit                 # typecheck (do this before merging)
npx eslint <files>               # lint changed files (use quotes around (tabs))
npx expo export --platform ios   # prod JS bundle sanity check; then: rm -rf dist
```
OTA (the usual ship):
```bash
EXPO_TOKEN=<token> npx eas-cli update --branch main --platform ios \
  --message "<what changed>" --non-interactive
```
Native build + auto-submit (only when native changes):
```bash
# 1) Restore eas.json production build-infra (credentialsSource:local, env
#    SENTRY_DISABLE_AUTO_UPLOAD, submit.ios with the ASC key path/ids) — see the
#    reverted "build infra" commits for the exact block.
# 2)
EXPO_TOKEN=<token> EAS_BUILD_NO_EXPO_GO_WARNING=true \
  npx eas-cli build --platform ios --profile production --non-interactive --auto-submit
# 3) Revert the eas.json build-infra; commit "Revert build-infra ...".
```
Firebase (run from repo root; needs Firebase CLI + login/CI token + Blaze):
```bash
firebase deploy --only firestore:rules,functions
```

## Git / ship workflow (AUTO-merge)
1. Work on branch **`claude/explorers-passport-product-2My8o`**.
2. `git add -A && git commit` (end body with the Co-Authored-By + Claude-Session
   trailer).
3. `git push -u origin claude/explorers-passport-product-2My8o`.
4. Open a PR into `main` (GitHub MCP tools `mcp__github__*`, repo
   `simondeans-rgb/explorer`) and **squash-merge immediately**.
5. `git fetch origin main && git merge origin/main && git push` to realign the
   dev branch.
6. **OTA** to the `main` channel (command above). Then `rm -rf mobile/dist`.
7. Confirm the working tree is clean (a Stop hook nags about uncommitted
   changes).

## Testing approach
- No automated test suite. Verification = **typecheck + eslint +
  `expo export`** clean, then **OTA + reload on device** (or Expo Go for
  non-native changes). The user reports back / sends screenshots; iterate.
- For crashes, read **Sentry** via its API (project `worldly`, EU host
  `https://de.sentry.io/api/0`, Bearer auth token; the `/projects/{org}/{proj}/
  events/` endpoint worked when org-level endpoints 403'd).

## Debugging notes
- **OTA application timing:** updates download on one launch and apply on the
  **next**. A crash that hits fast can prevent the download finishing → the user
  gets stuck on the old bundle. Tell the user to **force-quit + reopen twice**,
  or reinstall from TestFlight (the embedded bundle is the build-time JS).
- `Constants.executionEnvironment === StoreClient` ⇒ Expo Go; `dist` tag in
  Sentry = the build number (not the OTA id).
- EAS build logs: fetch via the Expo GraphQL API (`builds.byId.logFiles`) and
  scan the `INSTALL_PODS`/`RUN_FASTLANE` phases for `[!]` errors.

---

# Session Context

## Significant discussions / what happened
1. **Wrapped/Almanac premium exports + polish** — built `wrappedPoster.ts`
   (shareable "year in travel" PDF) and `almanacBook.ts` (multi-page photo-book
   PDF); did Story/Explore polish + coral rebalance (categories got distinct
   hues via `DISCOVERY_CATEGORY_COLOR`).
2. **Notifications backend** — wrote/confirmed `functions/src/index.ts`;
   **deployed** Firestore rules + Cloud Functions (walked the user through the
   Firebase CLI; first deploy needed a retry for Eventarc/IAM propagation; set an
   artifact cleanup policy).
3. **TestFlight build 9** — added Apple + Google native sign-in. Hit and fixed:
   missing Sign-in-with-Apple/Push entitlements in the provisioning profile
   (regenerated via the ASC API, verified `applesignin` + `aps-environment`); a
   CocoaPods failure (`AppCheckCore`/`GoogleUtilities`/`RecaptchaInterop` can't
   link as static libs) fixed with `expo-build-properties` `extraPods` modular
   headers. Build numbers rolled 8→9 across retries.
4. **APNs push key** — Apple portal can create it (the ASC API key can't); the
   user created it, and it was **registered + assigned to the app via the Expo
   GraphQL API** (key `TWB3Z3L67G`).
5. **Auth gate + "nowhere to sign in"** — discovered the mobile app was running
   in **demo mode** because `EXPO_PUBLIC_FIREBASE_*` were never set in EAS. Fixed
   by hardcoding the public Firebase config as fallbacks. Built a full-screen
   `AuthGate`.
6. **Crash saga (sign-in screen):** the app hard-crashed on the sign-in screen.
   Sentry was initially silent (DSN not inlined in OTA → added a fallback). Root
   cause: React Native still ships an **enumerable `PushNotificationIOS` getter**
   that throws `new NativeEventEmitter() requires a non-null argument` when a
   dependency enumerates `react-native`'s exports (Metro `importAll`) on the
   social-sign-in path. Fixed with **`src/lib/rnCompat.ts`** (neutralizes the
   getter), imported first in `_layout.tsx`. Also removed the social buttons'
   native module probe and deferred all native calls to button press.
7. **Google works; Apple doesn't** — Google sign-in succeeds. Apple's own sheet
   returns **"Sign up not complete"** (Apple-server-side). Verified our config is
   correct. At the user's request, **removed the Apple button** (kept the code).
8. **UI polish rounds** — Story hero copy/buttons; compact+vibrant level card;
   bigger greeting; Circle empty-state (tappable ghost circle, smaller solid
   invite button, clearer PREVIEW tiles); Explore daily-rotating facts;
   discoveries **fan carousel** (then sized/spaced from screenshots); simplified
   section hero copy.

## Key reasoning behind decisions
- **Public config as code fallbacks** beat EAS env vars for reliability (OTA
  bundles inline env at export time; missing vars silently degraded the app).
- **Never run native code at component mount** for optional native features —
  native faults bypass JS try/catch and hard-crash.
- **Reuse the proven `expo-print` lazy-import pattern** for all PDF exports.
- **Local iOS credentials** were retained because they already worked on disk.

## Lessons learned (read these!)
- **`PushNotificationIOS` is a landmine** in RN 0.81: any enumeration of
  `react-native`'s exports trips it. Keep `rnCompat` first in `_layout.tsx`.
- **OTA updates apply on the *next* launch** — account for this when telling the
  user how to test; a fast crash can trap them on a broken bundle (reinstall to
  recover).
- **`firstEvent: null` in Sentry** meant Sentry never initialized (DSN missing in
  the OTA bundle) — not that there were no crashes.
- **Apple "Sign up not complete"** is Apple-side (2FA/rate-limit), not a code or
  Firebase bug; don't keep shipping code changes for it.
- **App Store 4.8**: Google-without-Apple risks rejection — flag before submit.
- Use `--platform ios` for `eas update`/`export` (all-platform → EMFILE).
- The `Edit` tool struggles to match lines containing the Apple-logo glyph
  (``); edit around them or rewrite the file.

## Things future Claude instances should know
- The user iterates fast from **screenshots** — make focused changes, ship OTA,
  await feedback. Don't over-ask; auto-merge per the workflow.
- The user prefers **solid fills / white cards** over heavy gradients for
  non-hero surfaces, and **coral reserved for primary actions**.
- Keep hero copy to **two lines**.
- Secrets (`EXPO_TOKEN`, Firebase CI token, ASC/APNs `.p8`) are not in the repo;
  ask the user or check the sandbox (`/home/user/AuthKey_SXU2FM998Y.p8`,
  `mobile/credentials/`). Never commit them or the model id.

---

# Quick Start Instructions

1. **Read** `mobile/CLAUDE.md` (→ `mobile/AGENTS.md`: "read the versioned Expo
   docs before writing native code") and the root `CLAUDE.md` (design system +
   deploy workflow + merge=AUTO).
2. **The active app is `mobile/`** (Expo SDK 54). The root `src/` is the older
   web app (Vercel) — usually leave it alone.
3. **Branch:** work on `claude/explorers-passport-product-2My8o`. Production web
   deploys from `main`.
4. **Orient quickly:**
   ```bash
   cd mobile
   sed -n '1,60p' src/lib/theme.ts          # colours/gradients/category colours
   sed -n '1,40p' src/hooks/useWorldly.ts   # the read model
   sed -n '1,120p' app/_layout.tsx          # app shell, providers, AuthGate
   sed -n '1,60p' src/lib/firebase.ts       # config + isFirebaseConfigured
   cat app.json eas.json                    # native config + build/submit
   ```
5. **Make a change** → `npx tsc --noEmit` → `npx eslint <files>` →
   `npx expo export --platform ios` (then `rm -rf dist`).
6. **Ship (JS-only):** commit + push to the dev branch → open PR into `main`
   (GitHub MCP, repo `simondeans-rgb/explorer`) → **squash-merge** → realign dev
   with main → `EXPO_TOKEN=<token> npx eas-cli update --branch main --platform
   ios --message "..." --non-interactive` → `rm -rf mobile/dist`. End commit/PR
   bodies with the Co-Authored-By + Claude-Session trailer. **Never commit the
   model id or any secret.**
7. **Native change?** You need a new build (see Development Notes). Restore the
   `eas.json` build-infra, `eas build ... --auto-submit`, then revert it.
8. **If something crashed**, read Sentry (project `worldly`, host
   `https://de.sentry.io/api/0`) before guessing. Remember OTA applies on the
   next launch.
9. **Immediate candidates** (confirm with the user): verify push notifications
   end-to-end; decide the Apple-sign-in / Guideline-4.8 path before App Store
   submission; bump `firebase-functions` + Node runtime; continue UI polish.

> Current TestFlight build: **1.0.0 (9)**. Most things ship as OTA — reload the
> app (force-quit + reopen, twice if needed) to see updates.
