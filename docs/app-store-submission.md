# Worldly — App Store Connect submission pack

A working checklist for submitting Worldly to the App Store. Fill these into
App Store Connect when the TestFlight build is ready.

---

## 1. App Privacy ("nutrition label")

In **App Store Connect → your app → App Privacy → Get Started**. For each data
type below: mark **Collected = Yes**, **Linked to the user = Yes**, **Used for
tracking = No**, **Purpose = App Functionality** (unless noted). Worldly uses
**no** analytics, ads, or third-party tracking SDKs.

| Apple data type | Collected | Linked | Tracking | Purpose | Why |
|---|---|---|---|---|---|
| Contact Info → **Email Address** | Yes | Yes | No | App Functionality | Account sign-in (Firebase Auth) |
| Contact Info → **Name** | Yes | Yes | No | App Functionality | Display name on profile |
| **Location → Precise Location** | Yes | Yes | No | App Functionality | Check-ins / trip tracking (only city+country retained) |
| User Content → **Photos or Videos** | Yes | Yes | No | App Functionality | Profile + discovery/trip photos you add |
| User Content → **Other User Content** | Yes | Yes | No | App Functionality | Places, discoveries, notes, trips, journeys |
| Identifiers → **User ID** | Yes | Yes | No | App Functionality | Firebase account ID |

- **Do NOT** declare: Usage Data, Diagnostics (no analytics/crash SDK), Contacts,
  Financial, Health, Browsing/Search History, Purchases.
- When asked **"Does your app use data to track?"** → **No**.
- **Account deletion offered?** → **Yes** (Profile → Delete account).

> Note on Location: the app reads precise GPS to work out where you are, but only
> ever stores the **city + country** — declare "Precise Location" honestly, and
> explain the minimisation in the Review Notes (section 2).

---

## 2. App Review Information

**Provide a demo account** (reviewers must be able to test sign-in, friends,
sync and deletion). Create one in the app, then enter it here:

- Sign-in required: **No** (the app is fully usable in local demo mode), but a
  demo account is provided to test cloud features.
- **Username:** `review@worldly.app` (create this)
- **Password:** `(set one)`

**Notes for the reviewer** (paste into the Notes box):

```
Worldly is a personal travel-memory app. Sign-in is optional — the app works
fully in a local demo mode — but a demo account is provided above to test cloud
sync, friends, and account deletion.

BACKGROUND LOCATION (UIBackgroundModes: location):
- It is OFF by default and entirely user-initiated.
- To enable it: open a Trip whose dates include today → "Travel log" → turn on
  "Auto-add places I visit". A screen first explains what it does and that it
  will request "Always" permission and that trip collaborators can see added
  places. Only then is permission requested.
- Purpose: while a trip is active, the app adds the cities/countries you pass
  through to your travel map automatically, even when the app is closed.
- Privacy minimisation: each location fix is reverse-geocoded ON DEVICE to a
  city + country + date. We never store raw GPS coordinates or a location trail.
- It stops automatically at the trip's end date, and can be turned off anytime.

ACCOUNT DELETION: Profile tab → "Delete account" (re-enter password to confirm)
removes the account and all associated data.
```

---

## 3. Age rating

Answer the questionnaire with **None / No** for all mature-content categories
(violence, sexual content, profanity, gambling, etc.). Friend sharing is private
(accepted connections only), not public social networking, and there is no
in-app web browser. Expected rating: **4+**.

---

## 4. Export compliance (encryption)

The app only uses standard HTTPS/TLS encryption. To avoid the per-upload prompt,
add to `app.json` → `ios.infoPlist`:

```json
"ITSAppUsesNonExemptEncryption": false
```

(Then in App Store Connect the "Export Compliance" question is auto-answered.)

---

## 5. App listing / metadata

- **Name:** Worldly
- **Subtitle (30 char max):** `Your personal travel atlas`
- **Promotional text (170 char max):**
  `Every country you've stepped in, every place worth remembering — beautifully mapped. Plan trips, log discoveries, and let your world fill in as you go.`
- **Keywords (100 char max, comma-separated, no spaces):**
  `travel,map,countries,trip planner,travel journal,passport,visited,bucket list,itinerary,atlas,cities`
- **Description:**

```
Worldly is your personal travel archive — a beautiful map of everywhere you've
been and everywhere you're dreaming of.

COLLECT THE WORLD
Mark the countries and cities you've visited and watch your personal world map
fill in. See your stats: countries, cities, continents, and the percentage of
the world you've explored.

KEEP WHAT MATTERS
Save "discoveries" — the restaurants, sights, stays and experiences worth
remembering — with your own photos, notes and verdicts.

PLAN YOUR TRIPS
Build day-by-day itineraries with a drag-and-drop planner, add popular landmarks
and friends' recommendations, and export the whole thing as a document.

TRACK A TRIP, HANDS-FREE (optional)
Turn on tracking for a trip and Worldly adds the cities and countries you visit
automatically — even when the app is closed. Only the place names are saved,
never your precise location, and it switches off when your trip ends.

TRAVEL TOGETHER
Connect with friends to see each other's discoveries, and plan trips together.

Your data is yours: everything syncs privately to your account, and you can
delete it — or your whole account — anytime.
```

- **Support URL (required):** a web page — reuse `https://stickynotes-sand.vercel.app`
  or I can add a simple `/support` page. (A mailto is not accepted as the URL.)
- **Privacy Policy URL:** `https://stickynotes-sand.vercel.app/privacy`
- **Marketing URL (optional):** `https://stickynotes-sand.vercel.app`
- **Copyright:** `2026 Worldly`
- **Category:** Primary **Travel**; Secondary (optional) **Lifestyle**.

---

## 6. Screenshots

Required: one set of **6.9" iPhone** screenshots — **1320 × 2868 px** (portrait).
Apple scales these for smaller iPhones, so one set is enough. Provide **3–6**.

Suggested shots (all on-brand, photo-forward):
1. **Atlas** — the world map with your "Your world" stats card.
2. **A country page** — hero photo, facts, landmarks.
3. **Discoveries gallery** — the photo-tile grid.
4. **Trip planner** — the drag-and-drop itinerary with the ideas tray.
5. **Travel log / tracking** — the "Auto-add places I visit" card (shows the
   location feature in context — good for reviewers).
6. **Wrapped or You tab** — the personal stats.

> **iPad:** `app.json` currently has `"supportsTablet": true`, which means App
> Store Connect will also require **13" iPad** screenshots. If you want to launch
> iPhone-only, set `supportsTablet: false` and the iPad requirement disappears.

---

## 7. Quick gotchas
- **Sign in with Apple:** not required (only email/password is offered).
- **Build:** select the TestFlight build under "Build" before submitting.
- First submission also needs the **app icon** (already in the build) and a
  filled-in **"What's New"** (for updates).
