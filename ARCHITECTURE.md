# Architecture

How Explorer's Passport fits together — the data model, the derived-stats
engine, the component tree, and the path to native apps.

> Explorer's Passport began life as a cloud-synced board app and was
> repurposed. The Firebase + Vite + React + Tailwind foundation and the
> per-user real-time-sync pattern carried over; the domain is entirely new.

---

## 1. Application architecture

```
┌──────────────────────────────────────────────┐
│                    Browser                    │
│   ┌────────────────────────────────────┐     │
│   │       React (Vite + TS)            │     │
│   │   ThemeProvider                    │     │
│   │   └─ AuthProvider                  │     │
│   │      └─ Shell                      │     │
│   │         ├─ SignInPage (no user)    │     │
│   │         └─ AppShell (signed in)    │     │
│   │            ├─ Header + Nav         │     │
│   │            ├─ PassportView         │     │
│   │            ├─ ExpeditionsView      │     │
│   │            ├─ DiscoveriesView      │     │
│   │            └─ AlmanacView          │     │
│   └──────────────┬─────────────────────┘     │
│   ┌──────────────┴─────────────────────┐     │
│   │  Firebase SDK (auth + firestore)   │     │
│   │  └─ IndexedDB offline cache        │     │
│   └──────────────┬─────────────────────┘     │
└──────────────────┼────────────────────────────┘
                   ▼
   ┌──────────────────────────────────┐
   │  Firebase                        │
   │  ├─ Authentication               │
   │  └─ Cloud Firestore              │
   │     ├─ places/{placeId}          │
   │     ├─ expeditions/{id}  (later) │
   │     └─ discoveries/{id}  (later) │
   └──────────────────────────────────┘
```

No backend of our own. The browser talks directly to Firebase; Firestore
security rules enforce per-Member isolation.

## 2. Domain model

A Member's relationship with the world is captured as **places**. Everything
else on the Passport — flags, stamps, scores, statistics, recognitions, the
almanac — is _derived_ from places at render time, so there is a single source
of truth and nothing to keep in sync.

```ts
type Relationship =
  | 'visited' | 'lived' | 'worked' | 'studied'
  | 'based'   | 'born'  | 'aspiring';

interface Place {
  id: string;
  userId: string;             // Firebase Auth uid — used by security rules
  kind: 'country' | 'city';
  countryCode: string;        // ISO 3166-1 alpha-2 (parent country for a city)
  name: string;               // country name, or city name
  relationships: Relationship[];
  firstYear?: number;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

- A **country place** records your relationship at the country level.
- A **city place** belongs to a country via `countryCode`. A discovered city
  implies its country is discovered.
- `aspiring` is the wish-list relationship — it does _not_ count as a
  discovery.

The country reference dataset (`src/data/countries.ts`) maps ~230 ISO alpha-2
codes to names and continents. Flags are rendered from the code via Unicode
regional-indicator symbols (`src/lib/flags.ts`) — no image assets.

Forward-looking types (`Expedition`, `Journey`, `Discovery`,
`RecommendationVerdict`) live in `src/types.ts` and their collections are
already permitted by the security rules.

## 3. Derived data — the stats engine

`src/lib/stats.ts` is pure and side-effect-free:

- `aggregateByCountry(places)` groups places by `countryCode` into
  `CountryAggregate`s — merging the country place's relationships with those
  implied by its cities, deriving **stamps** (visited→Discovery, lived→
  Residency, worked→Work, studied→Study) and a **Discovery Score** (0–100,
  weighted by relationship depth, cities discovered, and whether a memory was
  recorded).
- `computeStats(aggregates)` rolls those up into `PassportStats` (countries,
  cities, continents, lived-in, stamps, average depth, flag codes).

`src/lib/recognitions.ts` evaluates milestone **Recognitions** against the
stats. Adding a new recognition is one entry in the `DEFS` array.

Because all of this is pure, the UI just calls it inside `useMemo` — see
`AppShell`, which subscribes once and feeds `aggregates` / `stats` to every
section.

## 4. Firebase architecture

- **Authentication**: email/password via `AuthContext`. Google/Apple are a
  single `signInWithPopup` away.
- **Firestore**: one collection per area (`places` today). Every document
  carries its owner's `userId`; queries filter by it; rules enforce it. No
  composite indexes required.
- **Offline cache**: `persistentLocalCache` + multi-tab manager persists the
  working set to IndexedDB. Reads serve from cache offline; writes queue and
  flush on reconnect.
- **Hosting**: Vercel static bundle.

### Security rules

[`firestore.rules`](firestore.rules) factors ownership into `isOwner()` /
`createIsOwner()` helpers and applies the identical pattern to `places`,
`expeditions` and `discoveries` — so new areas inherit isolation for free.

## 5. Real-time sync

```
usePlaces(uid)
  └─ subscribePlaces(uid, cb)
      └─ onSnapshot(query(collection('places'), where('userId','==',uid)))
           └─ on any change → cb(places[]) → setState → re-render
```

Writes go through `createPlace` / `updatePlace` / `deletePlace` in
`src/lib/places.ts`, each stamping `updatedAt: serverTimestamp()`. Firestore
rejects `undefined`, so optional fields are normalised (empty → `null`) in
`toDoc()`. Conflicts are last-write-wins per field — acceptable for a
single-Member-multi-device archive.

## 6. Component structure

```
App
└─ ThemeProvider              src/contexts/ThemeContext.tsx
   └─ AuthProvider            src/contexts/AuthContext.tsx
      └─ Shell                src/App.tsx
         ├─ SignInPage        src/components/auth/SignInPage.tsx
         └─ AppShell          src/components/AppShell.tsx
            ├─ PassportView   src/components/passport/PassportView.tsx
            │  ├─ AddPlaceModal      (create/edit a place + country picker)
            │  ├─ CountryCard        (flag, relationships, stamps, cities)
            │  ├─ DiscoveryRing      (score gauge)
            │  └─ Stamp              (inked seal)
            ├─ ExpeditionsView  src/components/expeditions/
            ├─ DiscoveriesView  src/components/discoveries/
            └─ AlmanacView      src/components/almanac/
```

`AppShell` is the orchestrator: it owns the active section, subscribes via
`usePlaces`, computes `aggregates`/`stats` once, and passes them down.
Sections are pure presentational consumers of that derived data.

## 7. State management

No Redux/Zustand. Firestore is the state manager.

- **Server state** (places): `usePlaces` → real-time array.
- **Derived state**: pure functions in `lib/stats.ts` / `lib/recognitions.ts`,
  memoised in components.
- **Auth / theme**: React Context (+ localStorage for theme).
- **UI state** (active section, open modal, picker): local `useState`.

## 8. UI design system

The Society of Discovery house style — classic, archival, not gamified.

- **Surfaces**: warm parchment (`#F5EFE1`) / dark (`#1A1916`) with a faint
  engraved dot-grid (`.passport-bg`); navy header (`#15233F`); gold accent
  (`#C0974A`). Cards in `passport-card` / `passport-carddark`.
- **Typography**: Fraunces (display serif) for headings and figures; Inter for
  UI text; a mono treatment for the passport "data page" line.
- **Components**: passport identity card, stat strip, flag wall, country cards
  with a circular Discovery Score gauge and inked stamps, recognition seals.
- **Motion**: `fade-in` / `rise-in` on mount; the add/edit sheet rises from the
  bottom on mobile and centres on desktop.

Tokens live in `tailwind.config.ts`; base styles in `src/index.css`.

## 9. Environment variables

Firebase web config keys are public-by-design (security comes from rules +
Auth):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## 10. Folder structure

```
explorer/
├─ ARCHITECTURE.md
├─ README.md
├─ firestore.rules
├─ index.html
├─ package.json
├─ tailwind.config.ts
├─ tsconfig.json
├─ vite.config.ts
├─ .env.example
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ App.tsx
   ├─ main.tsx
   ├─ index.css
   ├─ types.ts                 # domain model
   ├─ data/
   │  └─ countries.ts          # ISO codes → name + continent
   ├─ contexts/
   │  ├─ AuthContext.tsx
   │  └─ ThemeContext.tsx
   ├─ hooks/
   │  └─ usePlaces.ts
   ├─ lib/
   │  ├─ cn.ts
   │  ├─ firebase.ts
   │  ├─ flags.ts
   │  ├─ places.ts             # Firestore CRUD + subscription
   │  ├─ stats.ts              # aggregation + scores (pure)
   │  └─ recognitions.ts       # milestone evaluation (pure)
   └─ components/
      ├─ AppShell.tsx
      ├─ auth/SignInPage.tsx
      ├─ passport/             # PassportView, AddPlaceModal, CountryCard,
      │                        # DiscoveryRing, Stamp, relationshipIcons
      ├─ expeditions/ExpeditionsView.tsx
      ├─ discoveries/DiscoveriesView.tsx
      └─ almanac/AlmanacView.tsx
```

## 11. Roadmap — growing into the full product

The foundation is deliberately shaped so each area is additive:

- **Expeditions**: an `expeditions` collection (rules already in place). A
  place/discovery references an `expeditionId`; an Expedition view groups them
  by trip.
- **Journeys**: sub-documents of an Expedition (`flight` / `rail` / `cruise` /
  `road` / `ferry`) that feed Journey statistics.
- **Discoveries**: a `discoveries` collection with categories and
  recommendation verdicts, attached to countries/cities and expeditions.
- **Friend recommendations**: a social graph + shared read access; "friends
  who have been here" surfaces from the same place/discovery data.
- **Almanac printing, Travel DNA, AI Travel Historian, Family & Legacy
  passports**: all read from the existing derived-stats engine.

## 12. Going native

The web build wraps cleanly with **Capacitor** (iOS/Android) and **Tauri**
(macOS/Windows). The Firebase web SDK runs inside Capacitor's WebView; native
Sign in with Apple/Google can exchange a credential into Firebase Auth later.
The Firestore schema is unchanged across every client.
