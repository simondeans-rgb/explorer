# Live-flight pushes (`pollLiveFlights`)

Keeps the flight Live Activity (Lock Screen + Dynamic Island) current while the
app is closed: gate announced/changed, delays, boarding, take-off, landing.

Flow: the app starts a Live Activity and writes `liveFlights/{uid}` (flight
number, date, the activity's APNs push token). Every 2 minutes this function
looks up each tracked flight on AeroDataBox and, when what the activity shows
has changed, pushes the new state to that activity via APNs. Landing ends the
activity and deletes the document. Signed-in members only.

## One-time setup

1. Apple Developer → Certificates, IDs & Profiles → Keys → create a key with
   **Apple Push Notifications service (APNs)** enabled. Download the `.p8`
   (once only) and note its **Key ID**. Your **Team ID** is `PR99YSXB7G`.
2. Set the secrets:

   ```
   firebase functions:secrets:set APNS_KEY_P8      # paste the whole .p8 file
   firebase functions:secrets:set APNS_KEY_ID      # the 10-character Key ID
   firebase functions:secrets:set APNS_TEAM_ID     # PR99YSXB7G
   firebase functions:secrets:set AERODATABOX_KEY  # same RapidAPI key the app uses
   ```
3. Deploy: `firebase deploy --only functions,firestore:rules`

`firebase deploy` refuses to deploy `pollLiveFlights` until all four secrets
exist. APNs host is production (`api.push.apple.com`), which is what TestFlight
and App Store builds use.

## Cost

One AeroDataBox call per distinct tracked flight per poll: every 2 min within
2 h of departure and while boarding, every 6–8 min otherwise. Roughly 80–120
calls for a long-haul flight tracked from six hours out.
