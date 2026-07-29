import { cors, fail, cacheFor, fetchJSON, SIRI_BASE, API_KEY, routeApiId, isValidRoute } from "../_lib.js";

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const stopId = req.query.stopId;
    const route = req.query.route;
    if (!stopId) return fail(res, 400, "stopId is required");
    if (!/^\d{1,10}$/.test(stopId)) return fail(res, 400, "Invalid stopId");
    if (route && !isValidRoute(route)) return fail(res, 400, "Invalid route");

    let url = `${SIRI_BASE}/siri/stop-monitoring.json?key=${API_KEY}&version=2&OperatorRef=MTA&MonitoringRef=${encodeURIComponent(stopId)}&StopMonitoringDetailLevel=calls`;
    if (route) url += `&LineRef=${encodeURIComponent(routeApiId(route))}`;
    const data = await fetchJSON(url, 12000);
    cacheFor(res, 15);
    res.json(data);
  } catch (err) {
    console.error("[arrivals/:stopId] failed:", err);
    fail(res, 502, "Could not load arrivals for this stop");
  }
}
