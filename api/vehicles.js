import { cors, fail, cacheFor, parseRoutes, fetchJSON, SIRI_BASE, API_KEY, routeApiId, stripRoutePrefix, stripAgency } from "./_lib.js";

async function fetchVehicleMonitoring(lineRef) {
  let url = `${SIRI_BASE}/siri/vehicle-monitoring.json?key=${API_KEY}&version=2&OperatorRef=MTA&VehicleMonitoringDetailLevel=calls&MaximumNumberOfCallsOnwards=5`;
  if (lineRef) url += `&LineRef=${encodeURIComponent(routeApiId(lineRef))}`;
  return fetchJSON(url, 15000);
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const routes = parseRoutes(req.query.routes);
    const results = await Promise.all(routes.map(async (route) => {
      try {
        const data = await fetchVehicleMonitoring(route);
        const delivery = data?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery;
        const mon = Array.isArray(delivery) ? delivery[0] : delivery;
        return (mon?.VehicleActivity || []).map((v) => {
          const mvj = v.MonitoredVehicleJourney;
          const rawId = typeof mvj.VehicleRef === "string" ? mvj.VehicleRef : mvj.VehicleRef?.value || "";
          const vehicleNum = stripRoutePrefix(rawId);
          const onwardCalls = (mvj.OnwardCalls?.OnwardCall || []).map((call) => {
            const d = call.Extensions?.Distances || {};
            const stopId = stripAgency(call.StopPointRef || "");
            const dist = d.PresentableDistance || call.ArrivalProximityText || null;
            const stopsAway = d.StopsFromCall ?? call.NumberOfStopsAway ?? null;
            return { stopId, name: Array.isArray(call.StopPointName) ? call.StopPointName[0] : (call.StopPointName || stopId), distance: dist, stopsAway, metersAway: d.DistanceFromCall ?? call.DistanceFromStop ?? null };
          });
          const mc = mvj.MonitoredCall;
          const nextStop = mc ? { stopId: stripAgency(mc.StopPointRef || ""), distance: mc.Extensions?.Distances?.PresentableDistance || null, stopsAway: mc.Extensions?.Distances?.StopsFromCall ?? null } : null;
          return {
            id: vehicleNum, route: stripRoutePrefix(mvj.LineRef || "", route) || route,
            direction: mvj.DirectionRef === "0" ? "Outbound" : "Inbound",
            destination: Array.isArray(mvj.DestinationName) ? mvj.DestinationName[0] : mvj.DestinationName || "",
            lat: mvj.VehicleLocation?.Latitude, lon: mvj.VehicleLocation?.Longitude,
            bearing: mvj.Bearing || 0, progressRate: mvj.ProgressRate || "unknown",
            progressStatus: mvj.ProgressStatus || null, occupancy: mvj.Occupancy || null,
            destinationRef: stripAgency(mvj.DestinationRef || "") || null,
            onwardCalls, nextStop, recordedAt: v.RecordedAtTime || null,
          };
        });
      } catch { return []; }
    }));
    // Buses move constantly, but a short shared window still collapses many
    // clients polling on the same 15s cadence into one upstream fetch.
    cacheFor(res, 10);
    res.json({ vehicles: results.flat() });
  } catch (err) {
    console.error("[vehicles] failed:", err);
    fail(res, 502, "Could not load live vehicles");
  }
}
