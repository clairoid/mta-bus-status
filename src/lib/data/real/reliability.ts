import { getJSON } from "./client";
import type { ReliabilityData } from "../types";

// GET /api/reliability -> live schedule adherence derived from GTFS-RT
// tripUpdates. A snapshot of in-service trips, not a historical average.
export async function fetchReliability(routes: string[]): Promise<ReliabilityData> {
  return getJSON<ReliabilityData>("/api/reliability", { routes: routes.join(",") });
}
