# MTA Bus Status

Live NYC bus tracking — real-time map, arrivals, service alerts and trip
planning. React + Vite SPA with a thin Vercel serverless backend whose main job
is keeping the MTA API key off the client.

**Production:** https://mta-bus-status.vercel.app

---

## Stack

| Layer | What |
|---|---|
| UI | React 19, TypeScript, Tailwind CSS v4, React Router 7 (SPA) |
| State | Zustand (`persist` → localStorage), Supabase sync when signed in |
| Map | Mapbox GL (lazy-loaded), MTA polylines + SIRI vehicle positions |
| Backend | Vercel serverless functions in `api/` |
| Data | MTA Bus Time SIRI (JSON) + GTFS-Realtime (protobuf) |
| Auth/DB | Supabase (email+password, Postgres with RLS) |
| Push | Web Push / VAPID, driven by a daily Vercel cron |

---

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values below
npm run server            # API on :3005
npm run dev               # Vite on :5173, proxies /api → :3005
```

Both processes are needed in development — Vite proxies `/api` to the Express
wrapper, which mounts the same handlers Vercel runs in production.

### Environment

Only `MTA_BUSTIME_KEY` is required; without the rest the app still runs, just
anonymously and without push.

**Server-side** (never exposed to the browser):

| Variable | Required | Purpose |
|---|---|---|
| `MTA_BUSTIME_KEY` | yes | MTA Bus Time SIRI + GTFS-RT feeds |
| `SUPABASE_URL` | for push | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | for push | Server-side DB access (bypasses RLS — never ship to the client) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | for push | Web Push signing keys (`npx web-push generate-vapid-keys`) |
| `VAPID_SUBJECT` | no | `mailto:` or URL contact for the push service |
| `CRON_SECRET` | for push | Gates `GET /api/push`. **Required** — the endpoint fails closed without it |

**Client-side** (compiled into the bundle — treat all as public):

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Auth + cross-device sync. Safe to publish: every table is RLS-protected |
| `VITE_MAPBOX_TOKEN` | Map tiles + geocoding. Use a **public** (`pk.`) token with a URL restriction |
| `VITE_VAPID_PUBLIC_KEY` | Same value as `VAPID_PUBLIC_KEY`; needed to subscribe |

### Database

Run `supabase/schema.sql` once in the Supabase dashboard (SQL Editor → paste →
Run). It is idempotent and safe to re-run. It creates `profiles`, `user_state`
and `push_subscriptions`, enables RLS with own-row-only policies on all three,
and installs a trigger that provisions rows on signup.

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Vite dev server (needs `npm run server` alongside) |
| `npm run server` | Express wrapper around the `api/` handlers on :3005 |
| `npm run build` | `tsc -b` then `vite build` → `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm start` | Build, then serve `dist/` + the API from one process |

---

## API

All endpoints are `GET` unless noted, return JSON, and set a `s-maxage` CDN
cache so repeat polling doesn't re-invoke the function.

| Endpoint | Cache | Notes |
|---|---|---|
| `/api/health` | none | Liveness + which integrations are configured. `503` when degraded |
| `/api/arrivals?routes=&stops=` | 15s | Arrivals per stop. `stops` is `ROUTE:ID,ID\|ROUTE2:ID` |
| `/api/arrivals/:stopId?route=` | 15s | Raw SIRI stop-monitoring for one stop |
| `/api/vehicles?routes=` | 10s | Live vehicle positions + onward calls |
| `/api/alerts` | 60s | Active GTFS-RT service alerts (also memory-cached 60s) |
| `/api/routes` | 1h | Full MTA route catalog for the line picker |
| `/api/stops/:route` | 1h | Stops with coordinates |
| `/api/polylines/:route` | 1h | Decoded route geometry |
| `/api/trip?originLat=&originLng=&destLat=&destLng=&routes=` | 5m | Nearest-stop trip suggestions |
| `/api/push` | none | `GET` = cron alert scan (needs `CRON_SECRET`). `POST` = send a test push to your own subscription (needs a Supabase bearer token) |

**`?routes=` is validated and capped at 8 entries.** Each entry costs one
upstream MTA call, so an uncapped list is an amplification vector against the
shared API key.

---

## Deployment

Deploys are **CLI-driven** — there is no GitHub→Vercel integration, so
`git push` alone ships nothing:

```bash
npx vercel --prod
```

This uploads and builds the **local working tree**, not a commit. Commit first
so production always corresponds to something in git.

Environment variables live in the Vercel project (`npx vercel env ls`).
`vercel.json` rewrites all non-`/api` paths to `index.html` and registers the
daily push cron (`0 13 * * *`).

Rollback: previous deployments stay live — promote an older one from the Vercel
dashboard, or `npx vercel rollback`.

---

## Architecture notes

```
src/
  components/{chrome,cards,ui,overlays,inputs,map,pwa}
  hooks/          data fetching + polling (usePolling pauses in hidden tabs)
  lib/data/
    real/         typed wrappers over /api/*
    adapters/     swappable sources for domains with no backend yet
    mock/         fixtures behind those adapters
  pages/          one component per route
  store/          Zustand; PERSISTED_KEYS defines the durable slice
api/              Vercel handlers; _lib.js holds shared helpers
tests/            Vitest
```

Two things worth knowing before changing data code:

**Route IDs are fiddly.** SIRI uses a trailing `+` for Select Bus Service
(`B44+`) while the app uses `-SBS` (`B44-SBS`), and express routes sit under
`MTABC_` rather than `MTA NYCT_`. The `-SBS` check must run *before* the
`BX`/`BM` prefix check, or Bronx SBS routes get the wrong agency. See
`routeApiId` in `api/_lib.js` — it's covered by tests for exactly this reason.

**Some screens are still mock-backed.** Crowding, reliability, service calendar,
notifications and saved views/trip history read from `lib/data/adapters`, which
currently point at `lib/data/mock/mta.ts`. Swapping one to a real backend means
editing `adapters/index.ts` and nothing else.

---

## Security

- The MTA key is server-side only; the browser never sees it.
- `POST /api/push` requires a Supabase bearer token and only sends to a
  subscription owned by that user, with a fixed server-side payload.
- `GET /api/push` fails closed without `CRON_SECRET`.
- The service worker only opens same-origin URLs from notification payloads.
- Every Supabase table is RLS-protected to the owning user, which is what makes
  the anon key safe to ship.
- Map popups build HTML by hand and escape every field from the feed
  (`escHtml` in `components/map/mapHelpers.ts`) — keep it that way.
