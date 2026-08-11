import { cors, fail, cacheFor, parseRoutes, fetchBuffer, protobuf, API_KEY } from "./_lib.js";

// GET /api/reliability?routes=B6,B8 → live schedule adherence per route.
//
// Source is the GTFS-RT tripUpdates feed (bt.mta.info/developers/gtfs-realtime),
// which the app wasn't using. Two fields matter and only one of them works:
//   stopTimeUpdate.arrival.delay → always 0 across all ~9.4k entries. Dead,
//     exactly like SIRI's Extensions.Deviation.Delay.
//   tripUpdate.delay             → populated on 100% of trips, real spread
//     (measured -607s to +2807s). This is the one.
//
// So this is a live snapshot of every in-service trip, not a historical
// average — there's no storage behind it.

// MTA's conventional bus on-time window: no more than 1 minute early, no more
// than 5 minutes late.
export const EARLY_SECS = -60;
export const LATE_SECS = 300;

const CACHE_MS = 30_000;
let cache = { at: 0, data: null };

function median(sorted) {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Group live trips by route and score each one. Pure so the scoring rules are
 * unit-testable without the feed.
 *
 * @param entities decoded FeedMessage.entity[]
 * @returns { byRoute: Map<string, entry>, citywide }
 */
export function aggregateReliability(entities) {
  const delaysByRoute = new Map();
  for (const e of entities || []) {
    const tu = e?.tripUpdate;
    const routeId = tu?.trip?.routeId;
    if (!routeId || tu.delay === null || tu.delay === undefined) continue;
    const route = String(routeId).toUpperCase();
    if (!delaysByRoute.has(route)) delaysByRoute.set(route, []);
    delaysByRoute.get(route).push(Number(tu.delay));
  }

  const byRoute = new Map();
  let allOnTime = 0;
  let allTrips = 0;

  for (const [route, delays] of delaysByRoute) {
    delays.sort((a, b) => a - b);
    const early = delays.filter((d) => d < EARLY_SECS).length;
    const late = delays.filter((d) => d > LATE_SECS).length;
    const onTime = delays.length - early - late;
    allOnTime += onTime;
    allTrips += delays.length;
    byRoute.set(route, {
      route,
      total: delays.length,
      onTime,
      early,
      late,
      pct: Math.round((100 * onTime) / delays.length),
      medianDelayMin: +(median(delays) / 60).toFixed(1),
    });
  }

  return {
    byRoute,
    citywide: {
      routes: byRoute.size,
      trips: allTrips,
      pct: allTrips ? Math.round((100 * allOnTime) / allTrips) : 0,
    },
  };
}

/** An entry for a route with nothing in service — distinct from 0% on time. */
export function emptyEntry(route) {
  return { route, total: 0, onTime: 0, early: 0, late: 0, pct: 0, medianDelayMin: 0 };
}

async function load() {
  if (cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;
  const buffer = await fetchBuffer(`https://gtfsrt.prod.obanyc.com/tripUpdates?key=${API_KEY}`, 20000);
  const feed = protobuf.transit_realtime.FeedMessage.decode(buffer);
  const data = aggregateReliability(feed.entity);
  cache = { at: Date.now(), data };
  return data;
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const routes = parseRoutes(req.query.routes);
    const { byRoute, citywide } = await load();
    // A requested route with no trips running yields an explicit zero-trip
    // entry, so the UI can say "nothing in service" rather than "0% on time".
    const entries = routes.map((r) => byRoute.get(r) ?? emptyEntry(r));
    cacheFor(res, 30);
    res.json({ routes: entries, citywide, sampledAt: Date.now() });
  } catch (err) {
    if (cache.data) {
      const routes = parseRoutes(req.query.routes);
      return res.json({
        routes: routes.map((r) => cache.data.byRoute.get(r) ?? emptyEntry(r)),
        citywide: cache.data.citywide,
        sampledAt: cache.at,
        stale: true,
      });
    }
    console.error("[reliability] failed:", err);
    fail(res, 502, "Could not load schedule adherence");
  }
}
