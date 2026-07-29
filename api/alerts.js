import { cors, fail, cacheFor, fetchBuffer, protobuf, API_KEY } from "./_lib.js";

let cached = null;
let cachedAt = 0;
const CACHE_MS = 60_000;

const EFFECT_MAP = { 1: "NO_SERVICE", 2: "REDUCED_SERVICE", 3: "SIGNIFICANT_DETOUR", 4: "MODIFIED_SERVICE", 5: "DELAY", 6: "DETOUR", 7: "STOP_CLOSED", 8: "STOP_MOVED" };
const CAUSE_MAP = { 1: "UNKNOWN_CAUSE", 2: "OTHER_CAUSE", 3: "TECHNICAL_PROBLEM", 4: "STRIKE", 5: "DEMONSTRATION", 6: "ACCIDENT", 7: "HOLIDAY", 8: "WEATHER", 9: "MAINTENANCE", 10: "CONSTRUCTION", 11: "POLICE_ACTIVITY", 12: "MEDICAL_EMERGENCY" };

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if (cached && Date.now() - cachedAt < CACHE_MS) {
      cacheFor(res, 60);
      return res.json({ alerts: cached });
    }
    const buffer = await fetchBuffer(`https://gtfsrt.prod.obanyc.com/alerts?key=${API_KEY}`);
    const feed = protobuf.transit_realtime.FeedMessage.decode(buffer);
    const now = Math.floor(Date.now() / 1000);
    const alerts = [];
    for (const entity of feed.entity) {
      if (!entity.alert) continue;
      const alert = entity.alert;
      const affectedRoutes = [...new Set((alert.informedEntity || [])
        .map((e) => (e.routeId || e.trip?.routeId || "").toUpperCase())
        .filter(Boolean))];
      if (affectedRoutes.length === 0) continue;
      const activePeriods = alert.activePeriod || [];
      const isActive = activePeriods.length === 0 || activePeriods.some((p) => {
        const s = parseInt(p.start) || 0, e = parseInt(p.end) || Infinity; return now >= s && now <= e;
      });
      if (!isActive) continue;
      alerts.push({
        id: entity.id, routes: affectedRoutes,
        header: alert.headerText?.translation?.[0]?.text || "Service Alert",
        description: alert.descriptionText?.translation?.[0]?.text || "",
        cause: CAUSE_MAP[alert.cause] || "UNKNOWN_CAUSE",
        effect: EFFECT_MAP[alert.effect] || `UNKNOWN_${alert.effect}`,
        activePeriods: activePeriods.map((p) => ({ start: p.start ? parseInt(p.start) : null, end: p.end ? parseInt(p.end) : null })),
      });
    }
    cached = alerts;
    cachedAt = Date.now();
    cacheFor(res, 60);
    res.json({ alerts });
  } catch (err) {
    // Serve stale alerts rather than erroring if the feed hiccups.
    if (cached) {
      cacheFor(res, 30);
      return res.json({ alerts: cached, stale: true });
    }
    console.error("[alerts] failed:", err);
    fail(res, 502, "Could not load service alerts");
  }
}
