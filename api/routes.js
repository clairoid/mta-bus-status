import { cors, fail, cacheFor, fetchJSON, SIRI_BASE, API_KEY, stripAgency } from "./_lib.js";

// GET /api/routes → the full MTA bus route catalog with real names, used by
// the "Manage lines" picker. Both agencies: NYCT (local/SBS) and MTABC
// (Brooklyn/Queens/Bronx express + suburban).
const AGENCIES = ["MTA NYCT", "MTABC"];
const TTL_MS = 60 * 60 * 1000; // route metadata changes rarely

let cache = { at: 0, routes: [] };

// SIRI uses a trailing + for SBS routes (B44+); the app uses -SBS.
function normalizeId(shortName, rawId) {
  const base = (shortName || stripAgency(rawId) || "").trim();
  return base.endsWith("+") ? `${base.slice(0, -1)}-SBS` : base;
}

async function loadAgency(agency) {
  const url = `${SIRI_BASE}/where/routes-for-agency/${encodeURIComponent(agency)}.json?key=${API_KEY}&version=2`;
  const data = await fetchJSON(url, 12000);
  const list = data?.data?.list || [];
  return list.map((r) => ({
    id: normalizeId(r.shortName, r.id),
    name: r.longName || r.description || "",
    agency,
  }));
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    // Set the CDN header on every path — it used to be set only on the
    // cache-miss branch, so a warm instance served no Cache-Control at all.
    cacheFor(res, 3600, 86400);
    if (Date.now() - cache.at < TTL_MS && cache.routes.length) {
      return res.status(200).json({ routes: cache.routes, cached: true });
    }
    const results = await Promise.allSettled(AGENCIES.map(loadAgency));
    const merged = new Map();
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      for (const route of r.value) {
        if (route.id && !merged.has(route.id)) merged.set(route.id, route);
      }
    }
    // Natural sort: letter prefix, then number (B1, B2, B10 — not B1, B10, B2).
    const routes = [...merged.values()].sort((a, b) => {
      const pa = a.id.match(/^([A-Za-z]+)(\d*)/) || [];
      const pb = b.id.match(/^([A-Za-z]+)(\d*)/) || [];
      if (pa[1] !== pb[1]) return (pa[1] || "").localeCompare(pb[1] || "");
      return (parseInt(pa[2] || "0", 10) - parseInt(pb[2] || "0", 10)) || a.id.localeCompare(b.id);
    });
    if (!routes.length) return fail(res, 502, "No routes returned by the MTA catalog");
    cache = { at: Date.now(), routes };
    return res.status(200).json({ routes });
  } catch (err) {
    // Serve stale on failure rather than breaking the picker.
    if (cache.routes.length) return res.status(200).json({ routes: cache.routes, stale: true });
    console.error("[routes] failed:", err);
    return fail(res, 502, "Could not load the route catalog");
  }
}
