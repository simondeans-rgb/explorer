# Explorer's Passport

**Issued by the Society of Discovery.**

A lifelong personal travel archive that helps you document, preserve and
celebrate a lifetime of discovery. Where other apps plan trips or track
flights, Explorer's Passport is designed to become _the permanent record of
your travel life_ — places visited and lived in, the journeys between them,
the things you discovered, and how your story connects to the world.

Built with **Vite + React 18 + TypeScript + Tailwind CSS**, **Framer Motion**
for motion, and **Firebase** (Auth + Firestore + IndexedDB offline cache) for
real-time sync. Deployed via Vercel.

For the deep dive on architecture, the data model and the roadmap, see
[ARCHITECTURE.md](ARCHITECTURE.md).

## What's in this build (MVP foundation)

The **Passport** — the heart of the product — is fully working:

- **Countries & Cities** with the Society's seven **relationships**: Visited,
  Lived, Worked, Studied, Based, Born and Aspiring.
- **Flags** — every country you discover adds its flag to your collection.
- **Stamps** — Discovery, Residency, Work and Study seals, pressed
  automatically from your relationships.
- **Discovery Score** — a per-country gauge of _how deeply_ you experienced a
  place, not merely whether you visited.
- **Travel statistics** — countries, cities, continents, places lived, stamps
  and average depth, computed live.
- **Society Recognitions** — meaningful milestones (First Discovery,
  Continental Explorer, Citizen of Elsewhere, Master Cartographer…).
- **The Almanac** — a Lifetime edition and per-year editions, published from
  your Passport.
- Everything syncs in real time across signed-in devices and works offline.

**Discoveries** is live too — record restaurants, culture, accommodation,
experiences and nature, attach them to the countries/cities in your Passport,
and mark a recommendation verdict (Recommend, Hidden Gem, Worth Visiting,
Overrated, Avoid). Discoveries feed your statistics and unlock the Culinary
Explorer and Master Cartographer Recognitions.

**Expeditions** is live — log each trip with its dates, the countries it
crossed, and the **journeys** within it (flights, rail, cruises, road trips,
ferries). Attach Discoveries to an Expedition, and your journey counts feed the
Almanac.

**Friend Recommendations** is live — connect with fellow Members by share code,
and on any country (including ones you're only *planning*) you'll see which
friends have visited or lived there and the discoveries they recommend, with
hidden gems and warnings colour-coded. The Friends tab also has a browsable
"friends' picks" digest, filterable by verdict. Friends get read-only access to
your Passport and Discoveries once a connection is accepted. (Needs a real
account, not the demo, and the latest [`firestore.rules`](firestore.rules)
published.)

**Statistics** gives the full tally — travel (countries, cities, continents and
every relationship), journeys (by mode), and discoveries (by category) —
computed live from your Passport.

**Import from Flighty** (in Expeditions) turns a [Flighty](https://flighty.com)
CSV export into your record: every flight becomes a journey, contiguous flights
are reconstructed into trips (Expeditions), and the countries and cities you
passed through are added to your Passport — with the earliest year for each.
It runs entirely client-side, merges into existing places, is safe to re-run
(flights already imported are skipped), and shows a preview with an advisory
that non-flight travel and unlogged flights must be added manually.

**Residence history makes trips smarter.** When you mark a place as *lived*, you
can record the dates you lived there. The importer uses this **home timeline**:
a flight home to the city you lived in at the time ends a trip, so a domestic
hop somewhere else becomes a proper trip — and as your home changes over the
years, trip boundaries follow it. If you correct your residence history later,
**Re-evaluate** (in Expeditions) rebuilds your imported trips from their flights
against the updated timeline. With no residence dates set, trips fall back to
home-country segmentation.

**The AI Travel Historian** (in the Almanac) composes a written narrative of
your travels — lifetime or for a chosen year — from the record of your
Passport, streamed live in the Society's voice. It runs through a server-side
Vercel Edge function (`api/historian.ts`) that calls Google's Gemini API, so
the API key stays off the client. Set **`GEMINI_API_KEY`** in your Vercel
project (Environment Variables) to enable it — get a key at
[aistudio.google.com](https://aistudio.google.com/apikey); without it the
feature reports that it isn't configured. Optionally override the model with
`GEMINI_MODEL` (defaults to `gemini-2.5-flash`). It requires the deployed app
(or `vercel dev`) — a plain `npm run dev` won't serve the `/api` function.

> **Upgrading an existing project?** The Friends feature changed the Firestore
> rules (new `profiles`, `codes`, `connections` collections and friend reads).
> Re-paste [`firestore.rules`](firestore.rules) into the Firebase console and
> publish, or connecting will be denied.

## Setup

### 1. Install

```bash
npm install
```

### 2. Create a Firebase project

1. Open the [Firebase console](https://console.firebase.google.com) and create
   a project.
2. **Authentication → Sign-in method**: enable **Email/Password**. Optionally
   also enable **Google** to get the "Continue with Google" button (no extra
   config needed beyond toggling the provider on).
3. **Firestore Database → Create database** in production mode.
4. **Firestore Database → Rules**: paste [`firestore.rules`](firestore.rules)
   and publish.
5. **Project settings → Your apps → Add app → Web**: register a web app and
   copy the config values.

### 3. Wire up env vars

```bash
cp .env.example .env.local
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run

```bash
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run preview    # preview the production build
npm run lint       # eslint
```

## Deploy (Vercel)

1. Import this repo at [vercel.com/new](https://vercel.com/new) — Vite is
   auto-detected.
2. Add the six `VITE_FIREBASE_*` env vars in **Project Settings**.
3. Add your Vercel domain to **Firebase Authentication → Settings → Authorized
   domains**.

## Using your Passport

- **Add** a country from the Passport tab, choose your relationship(s) to it,
  and optionally a first-discovered year and a detail worth remembering.
- Tap a country card to edit it, **+ City** to add cities within it, or a city
  chip to edit that city.
- Mark somewhere you haven't been yet as **Aspiring** to build a wish list.
- Watch your flags, stamps, statistics and Recognitions fill in, then read it
  back as an **Almanac**.
