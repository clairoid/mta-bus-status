import { cors, fail, cacheFor, parseRoutes, fetchJSON, SIRI_BASE, API_KEY, routeApiId, stripAgency } from "./_lib.js";

// Roughly the NYC metro area — reject coordinates that can't be a local trip.
const NYC_BOUNDS = { minLat: 40.2, maxLat: 41.2, minLon: -74.5, maxLon: -73.4 };
const WALK_METERS_PER_MIN = 80;

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inBounds(lat, lon) {
  return lat >= NYC_BOUNDS.minLat && lat <= NYC_BOUNDS.maxLat && lon >= NYC_BOUNDS.minLon && lon <= NYC_BOUNDS.maxLon;
}

async function fetchStopsForRoute(route) {
  try {
    const url = `${SIRI_BASE}/where/stops-for-route/${encodeURIComponent(routeApiId(route))}.json?key=${API_KEY}&includePolylines=false&version=2`;
    const data = await fetchJSON(url, 10000);
    return (data?.data?.references?.stops || []).map((s) => ({
      id: stripAgency(s.id || ""),
      name: s.name,
      lat: s.lat,
      lon: s.lon,
    }));
  } catch { return []; }
}

function buildSuggestion(oStop, dStop, transferRequired) {
  const walkOrigin = Math.round(oStop.distFromOrigin / WALK_METERS_PER_MIN);
  const walkDest = Math.round(dStop.distFromDest / WALK_METERS_PER_MIN);
  return {
    route: oStop.route,
    originStop: { id: oStop.id, name: oStop.name, lat: oStop.lat, lon: oStop.lon, walkMin: walkOrigin },
    destStop: { id: dStop.id, name: dStop.name, lat: dStop.lat, lon: dStop.lon, walkMin: walkDest },
    totalWalkMin: walkOrigin + walkDest,
    transferRequired,
    ...(transferRequired ? { transferNote: "Transfer may be needed" } : {}),
  };
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const { originLat, originLng, destLat, destLng } = req.query;
    const oLat = parseFloat(originLat), oLng = parseFloat(originLng);
    const dLat = parseFloat(destLat), dLng = parseFloat(destLng);
    if ([oLat, oLng, dLat, dLng].some(Number.isNaN)) {
      return fail(res, 400, "originLat, originLng, destLat, destLng are required");
    }
    if (!inBounds(oLat, oLng) || !inBounds(dLat, dLng)) {
      return fail(res, 400, "Coordinates must be within the NYC area");
    }

    const routes = parseRoutes(req.query.routes);

    const allStops = await Promise.all(routes.map(async (route) => {
      const stops = await fetchStopsForRoute(route);
      return stops.map((s) => ({ ...s, route }));
    }));
    const flat = allStops.flat();

    const originStops = flat
      .map((s) => ({ ...s, distFromOrigin: haversineMeters(oLat, oLng, s.lat, s.lon) }))
      .sort((a, b) => a.distFromOrigin - b.distFromOrigin)
      .slice(0, 5);

    const destStops = flat
      .map((s) => ({ ...s, distFromDest: haversineMeters(dLat, dLng, s.lat, s.lon) }))
      .sort((a, b) => a.distFromDest - b.distFromDest)
      .slice(0, 5);

    // Prefer same-route (no transfer) pairings; fall back to cross-route pairs.
    let suggestions = [];
    for (const oStop of originStops) {
      for (const dStop of destStops) {
        if (oStop.route === dStop.route) suggestions.push(buildSuggestion(oStop, dStop, false));
      }
    }
    if (suggestions.length === 0) {
      for (const oStop of originStops.slice(0, 3)) {
        for (const dStop of destStops.slice(0, 3)) {
          suggestions.push(buildSuggestion(oStop, dStop, true));
        }
      }
    }

    suggestions = suggestions.sort((a, b) => a.totalWalkMin - b.totalWalkMin).slice(0, 8);

    // Stop geometry is stable; the walk math is pure. Safe to cache a while.
    cacheFor(res, 300);
    res.json({
      suggestions,
      originStops: originStops.map((s) => ({ id: s.id, name: s.name, route: s.route, lat: s.lat, lon: s.lon, dist: Math.round(s.distFromOrigin) })),
      destStops: destStops.map((s) => ({ id: s.id, name: s.name, route: s.route, lat: s.lat, lon: s.lon, dist: Math.round(s.distFromDest) })),
    });
  } catch (err) {
    console.error("[trip] failed:", err);
    fail(res, 502, "Could not plan a trip");
  }
}
