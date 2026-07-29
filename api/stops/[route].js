import { cors, fail, cacheFor, fetchJSON, SIRI_BASE, API_KEY, routeApiId, isValidRoute, stripAgency } from "../_lib.js";

// Bounded per-instance cache (route geometry changes rarely).
const cache = new Map();
const TTL_MS = 3600_000;
const MAX_ENTRIES = 60;

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const route = req.query.route?.toUpperCase();
    if (!route) return fail(res, 400, "route is required");
    if (!isValidRoute(route)) return fail(res, 400, "Invalid route");

    cacheFor(res, 3600, 86400);
    const hit = cache.get(route);
    if (hit && Date.now() - hit.ts < TTL_MS) return res.json(hit.data);

    const url = `${SIRI_BASE}/where/stops-for-route/${encodeURIComponent(routeApiId(route))}.json?key=${API_KEY}&includePolylines=false&version=2`;
    const data = await fetchJSON(url, 10000);
    const rawStops = data?.data?.references?.stops || [];
    const stops = rawStops.map((s) => ({
      id: stripAgency(s.id || "") || s.code,
      name: s.name,
      lat: s.lat,
      lon: s.lon,
      direction: s.direction || null,
      routeIds: s.routeIds || [],
    }));
    const result = { route, stops };
    if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
    cache.set(route, { data: result, ts: Date.now() });
    res.json(result);
  } catch (err) {
    console.error("[stops] failed:", err);
    fail(res, 502, "Could not load stops for this route");
  }
}
