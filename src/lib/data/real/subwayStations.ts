import { getJSON } from "./client";
import type { SubwayStation } from "../types";

// GET /api/subway-stations -> { stations: SubwayStation[] } (top 10 by distance)
export async function fetchSubwayStations(
  lat: number,
  lon: number,
  radius = 1000
): Promise<SubwayStation[]> {
  const data = await getJSON<{ stations: SubwayStation[] }>("/api/subway-stations", {
    lat: String(lat),
    lon: String(lon),
    radius: String(radius),
  });
  return data.stations;
}
