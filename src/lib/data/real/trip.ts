import { getJSON } from "./client";
import type { RouteStop, TripSuggestion } from "../types";

export interface TripPlanResult {
  suggestions: TripSuggestion[];
  originStops: RouteStop[];
  destStops: RouteStop[];
}

// GET /api/trip -> { suggestions, originStops, destStops }
export async function fetchTrip(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  routes?: string[]
): Promise<TripPlanResult> {
  return getJSON<TripPlanResult>("/api/trip", {
    originLat: String(originLat),
    originLng: String(originLng),
    destLat: String(destLat),
    destLng: String(destLng),
    routes: routes?.join(","),
  });
}
