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

Implements the **Explorer's Passport Brand Book (First Edition)** — classic,
archival, prestigious, never gamified. All tokens live in `tailwind.config.ts`
under the `passport.*` namespace; base styles in `src/index.css`.

- **Colour — Palette A "Navigator" (primary)**: Midnight `#0D1B2E`,
  Admiralty `#1A2E4A`, Chart Blue `#2A4568`, Gold Seal `#C9A84C` (accent only,
  never a large fill), Pale Gold `#E8C97A`, Cartridge `#F8F4EC` (app
  background). **Interior — Parchment** `#F2EDE0` is used for passport page
  bodies (never white/cream), with Aged Parchment `#E6DFC8` for MRZ strips and
  Field Label `#8B7B4E` / Field Text `#6B5E3E`. Palette B "Cartographer"
  (burgundy/brass) is reserved for stamps and special editions.
- **Typography**: **Cormorant Garamond** (display serif, 600/500/italic) for
  all headings, figures, country names and serif page values; **DM Sans**
  (300/400/500) for all interface text, labels and stats; a mono treatment for
  the MRZ strip.
- **Passport pages**: the Member Bio Page (`BioPage` in `PassportView`) follows
  §08 — navy header band with gold type, parchment body, spaced-caps field
  labels, a gold globe-crest seal (`Crest`) bottom-right, and an MRZ strip.
- **Stamps** (`Stamp`): per §07, a stamped tile carrying the country name, its
  ISO-3 code (Cormorant), the year and the relationship, coloured by stamp
  type (Discovered → navy/gold, Lived → burgundy/amber, Worked → chart/gold,
  Studied → green). ISO-3 codes are in `src/data/countries.ts`.
- **Recognitions**: the brand's canonical six, surfaced only once earned, as
  gold seals carrying their glyph.
- **Voice**: Society vocabulary throughout — Members, Expeditions, Journeys,
  Discoveries, Recognitions, Almanacs. Measured, specific, never breathless;
  no emoji in copy.
- **Motion**: `fade-in` / `rise-in` on mount; the add/edit sheet rises from the
  bottom on mobile, centres on desktop.

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

- **Discoveries** *(shipped)*: a `discoveries` collection with categories and
  recommendation verdicts, attached to countries/cities (and, later,
  expeditions). Mirrors the places stack — `lib/discoveries.ts` (+
  `localDiscoveries.ts` for demo mode), `useDiscoveries`, and
  `computeDiscoveryStats`. Feeds the Bio Page, the Almanac and the
  Culinary Explorer / Master Cartographer Recognitions.
- **Expeditions** *(shipped)*: an `expeditions` collection — `lib/expeditions.ts`
  (+ `localExpeditions.ts`), `useExpeditions`. Each Expedition embeds its
  **Journeys** (`flight` / `rail` / `cruise` / `road` / `ferry`); Discoveries
  reference an `expeditionId`. `computeJourneyStats` feeds the Almanac's
  Journeys-taken figures, and the Bio Page shows an Expeditions count.
- **Friend recommendations** *(shipped, Phase 1)*: Members connect by share
  code. A `profiles/{uid}` holds the Member's name + code; `codes/{code}` maps a
  code to a uid (fetched by exact id only — no enumeration); `connections/{pair}`
  (a sorted-uid id) holds the friendship + status. Security rules let an
  **accepted** friend read your `places`/`discoveries` via an `exists()`/`get()`
  lookup on the deterministic connection id (`sharedRead`). The client
  (`useFriendsData`) subscribes to friends' places/discoveries (`where userId in
  […]`), and `friendsByCountry` powers the "friends who've been here" panel on
  each country. Expeditions stay private. Requires real Firebase (not the
  local demo).
- **AI Travel Historian** *(shipped)*: a Vercel Edge function
  (`api/historian.ts`) calls the Claude API (`claude-opus-4-8`, streaming) to
  compose a narrative from a compact record built client-side
  (`lib/historian.ts` → `buildHistorianContext`). The `ANTHROPIC_API_KEY` is a
  server-only secret; the SDK never enters the client bundle. Surfaced in the
  Almanac (`TravelHistorian`), keyed per edition.
- **Almanac printing, Travel DNA, Family & Legacy passports**: all read from
  the existing derived-stats engine.

## 12. Going native

The web build wraps cleanly with **Capacitor** (iOS/Android) and **Tauri**
(macOS/Windows). The Firebase web SDK runs inside Capacitor's WebView; native
Sign in with Apple/Google can exchange a credential into Firebase Auth later.
The Firestore schema is unchanged across every client.
