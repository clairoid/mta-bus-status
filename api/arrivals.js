import { FAVORITES, cors, fail, cacheFor, parseRoutes, fetchJSON, SIRI_BASE, API_KEY, routeApiId, stripRoutePrefix, stripAgency } from "./_lib.js";

// Per-route stop lists are resolved to satisfy `?routes=`; cap how many stops
// each route contributes so one request can't fan out into hundreds of
// upstream SIRI calls.
const MAX_STOPS_PER_ROUTE = 6;

async function fetchArrivals(stopId, lineRef) {
  let url = `${SIRI_BASE}/siri/stop-monitoring.json?key=${API_KEY}&version=2&OperatorRef=MTA&MonitoringRef=${encodeURIComponent(stopId)}&StopMonitoringDetailLevel=calls`;
  if (lineRef) url += `&LineRef=${encodeURIComponent(routeApiId(lineRef))}`;
  return fetchJSON(url, 12000);
}

function parseArrivals(data) {
  const delivery = data?.Siri?.ServiceDelivery?.StopMonitoringDelivery;
  const mon = Array.isArray(delivery) ? delivery[0] : delivery;
  const visits = mon?.MonitoredStopVisit || [];
  return visits.map((v) => {
    const mvj = v.MonitoredVehicleJourney; const call = mvj?.MonitoredCall;
    if (!call) return null;
    const route = stripRoutePrefix(mvj.LineRef || "");
    const dir = mvj.DirectionRef === "0" ? "Outbound" : "Inbound";
    const dest = Array.isArray(mvj.DestinationName) ? mvj.DestinationName[0] : mvj.DestinationName || "Unknown";
    const arrival = call.ExpectedArrivalTime || call.AimedArrivalTime;
    const mins = arrival ? Math.max(0, Math.round((new Date(arrival) - new Date()) / 60000)) : null;
    return { route, direction: dir, destination: dest, minutes: mins, stopsAway: call.NumberOfStopsAway ?? null, delay: call.Extensions?.Deviation?.Delay || 0 };
  }).filter(Boolean);
}

const routeStopsCache = new Map();
const ROUTE_STOPS_TTL = 3600_000;
const ROUTE_STOPS_MAX = 100; // bound the per-instance cache

async function getStopsForRoute(route) {
  const hit = routeStopsCache.get(route);
  if (hit && Date.now() - hit.ts < ROUTE_STOPS_TTL) return hit.stops;
  try {
    const data = await fetchJSON(`${SIRI_BASE}/where/stops-for-route/${encodeURIComponent(routeApiId(route))}.json?key=${API_KEY}&includePolylines=false&version=2`, 10000);
    const rawStops = data?.data?.entry?.stops || data?.data?.references?.stops || [];
    const stops = rawStops.map((s) => ({ stopId: stripAgency(s.id) || s.id, name: s.name || "" }));
    // Simple FIFO eviction so a long-lived instance can't grow unboundedly.
    if (routeStopsCache.size >= ROUTE_STOPS_MAX) {
      routeStopsCache.delete(routeStopsCache.keys().next().value);
    }
    routeStopsCache.set(route, { stops, ts: Date.now() });
    return stops;
  } catch { return []; }
}

// `stops` param: "ROUTE:ID,ID|ROUTE2:ID,ID" — which specific stops the user
// selected per route.
function parseUserStops(stopsParam) {
  const userStops = {};
  if (!stopsParam || typeof stopsParam !== "string") return userStops;
  for (const part of stopsParam.split("|")) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;
    const route = part.substring(0, colonIdx).trim().toUpperCase();
    if (!route) continue;
    const idsStr = part.substring(colonIdx + 1).trim();
    userStops[route] = idsStr
      ? idsStr.split(",").map((id) => id.trim()).filter((id) => /^\d+$/.test(id)).slice(0, MAX_STOPS_PER_ROUTE)
      : [];
  }
  return userStops;
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const routes = parseRoutes(req.query.routes, []);
    if (routes.length === 0) {
      cacheFor(res, 15);
      return res.json({ stops: [] });
    }
    const userStops = parseUserStops(req.query.stops);

    const stopLists = await Promise.all(routes.map(async (route) => {
      const userStopIds = userStops[route];
      if (userStopIds !== undefined) {
        if (userStopIds.length === 0) return { route, stops: [] };
        const allStops = await getStopsForRoute(route);
        const selected = userStopIds.map((id) => allStops.find((s) => s.stopId === id)).filter(Boolean);
        return { route, stops: selected };
      }
      const routeFavs = FAVORITES.filter((f) => f.route === route);
      if (routeFavs.length > 0) return { route, stops: routeFavs };
      const stops = await getStopsForRoute(route);
      return { route, stops: stops.slice(0, 3) };
    }));

    const wanted = [];
    for (const { route, stops } of stopLists) {
      for (const s of stops.slice(0, MAX_STOPS_PER_ROUTE)) wanted.push({ ...s, route });
    }

    const results = await Promise.all(wanted.map(async (stop) => {
      try {
        const data = await fetchArrivals(stop.stopId, stop.route);
        return { stopId: stop.stopId, name: stop.name, route: stop.route, arrivals: parseArrivals(data) };
      } catch {
        return { stopId: stop.stopId, name: stop.name, route: stop.route, arrivals: [] };
      }
    }));

    // Merge duplicate stops (a stop served by two followed routes).
    const byStop = new Map();
    for (const r of results) {
      const existing = byStop.get(r.stopId);
      if (existing) existing.arrivals = [...existing.arrivals, ...r.arrivals];
      else byStop.set(r.stopId, r);
    }

    cacheFor(res, 15);
    res.json({ stops: [...byStop.values()] });
  } catch (err) {
    console.error("[arrivals] failed:", err);
    fail(res, 502, "Could not load arrivals");
  }
}
