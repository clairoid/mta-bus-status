import { getJSON } from "./client";
import type { StopArrivals } from "../types";

// GET /api/arrivals -> { stops: StopArrivals[] }
export async function fetchArrivals(
  routes: string[],
  stops?: Record<string, string[]>
): Promise<StopArrivals[]> {
  const params: Record<string, string> = { routes: routes.join(",") };
  if (stops) {
    params.stops = Object.entries(stops)
      .map(([route, ids]) => `${route}:${ids.join(",")}`)
      .join("|");
  }
  const data = await getJSON<{ stops: StopArrivals[] }>("/api/arrivals", params);
  return data.stops;
}
