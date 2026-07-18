import { getJSON } from "./client";
import type { RouteStop } from "../types";

// GET /api/stops/:route -> { route, stops: RouteStop[] } (1hr server cache)
export async function fetchStopsForRoute(route: string): Promise<RouteStop[]> {
  const data = await getJSON<{ route: string; stops: RouteStop[] }>(
    `/api/stops/${encodeURIComponent(route)}`
  );
  return data.stops;
}
