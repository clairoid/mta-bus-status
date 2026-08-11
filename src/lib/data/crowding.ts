import type { CrowdingData, CrowdingRouteLevel, CrowdingSegment, Vehicle } from "./types";
import { occupancyToCrowd } from "./format";

// Live crowding, derived from the SIRI `Occupancy` field that /api/vehicles
// already returns. No new endpoint and no storage — the Dashboard is fetching
// this data anyway.
//
// Occupancy is a coarse *category*, not a percentage, so these weights are a
// deliberate readable mapping onto the 0-1 scale the bars expect — not a
// measurement. The rider counts below report how many buses were actually
// reporting, rather than inventing a "% full" the feed never gave us.
const CROWD_WEIGHT: Record<string, number> = {
  empty: 0.1,
  seats: 0.35,
  standing: 0.7,
  full: 0.95,
};

export function crowdLevelLabel(level: number): string {
  if (level >= 0.75) return "Heavy";
  if (level >= 0.45) return "Moderate";
  return "Light";
}

/** Mean occupancy weight across the buses on a route that report it. */
export function routeCrowdLevel(vehicles: Vehicle[]): { level: number; reporting: number } {
  const weights = vehicles
    .map((v) => occupancyToCrowd(v.occupancy))
    .filter((c): c is string => c !== null)
    .map((c) => CROWD_WEIGHT[c] ?? CROWD_WEIGHT.seats);
  if (weights.length === 0) return { level: 0, reporting: 0 };
  return {
    level: weights.reduce((a, b) => a + b, 0) / weights.length,
    reporting: weights.length,
  };
}

function summarize(routeVehicles: Vehicle[], reporting: number): string {
  const total = routeVehicles.length;
  if (total === 0) return "No buses in service";
  if (reporting === 0) return `${total} running · no occupancy data`;
  return `${reporting} of ${total} buses reporting`;
}

/**
 * Per-route occupancy, ordered by the caller's route list so the bars stay in
 * a stable order as buses come and go.
 */
export function buildRouteLevels(vehicles: Vehicle[], routes: string[]): CrowdingRouteLevel[] {
  return routes.map((route) => {
    const onRoute = vehicles.filter((v) => v.route === route);
    const { level, reporting } = routeCrowdLevel(onRoute);
    return {
      route,
      level,
      label: reporting === 0 ? "No data" : crowdLevelLabel(level),
      riders: summarize(onRoute, reporting),
    };
  });
}

/**
 * Crowding along one route: each in-service bus contributes its occupancy at
 * the stop it's heading to, ordered by how far along it is. This is a real
 * snapshot of where the loaded buses are, not a modelled profile.
 */
export function buildRouteSegments(vehicles: Vehicle[], route: string, max = 8): CrowdingSegment[] {
  return vehicles
    .filter((v) => v.route === route && occupancyToCrowd(v.occupancy) !== null)
    .map((v) => {
      const call = v.onwardCalls?.[0];
      const crowd = occupancyToCrowd(v.occupancy)!;
      return {
        stop: call?.name || v.nextStop?.stopId || v.destination || v.id,
        level: CROWD_WEIGHT[crowd] ?? CROWD_WEIGHT.seats,
        stopsAway: call?.stopsAway ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => a.stopsAway - b.stopsAway)
    .slice(0, max)
    .map(({ stop, level }) => ({ stop, level }));
}

export function buildCrowding(vehicles: Vehicle[], routes: string[]): CrowdingData {
  const segmentRoute =
    routes.find((r) => vehicles.some((v) => v.route === r && v.occupancy)) ?? routes[0] ?? "";
  return {
    routes: buildRouteLevels(vehicles, routes),
    segments: buildRouteSegments(vehicles, segmentRoute),
    segmentRoute,
  };
}
