import { getJSON } from "./client";
import type { RoutePolylines } from "../types";

// GET /api/polylines/:route -> { route, segments: [[lng,lat],...][] } (1hr server cache)
export async function fetchPolylines(route: string): Promise<RoutePolylines> {
  return getJSON<RoutePolylines>(`/api/polylines/${encodeURIComponent(route)}`);
}
