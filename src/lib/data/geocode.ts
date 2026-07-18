const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
// Bias results to NYC.
const PROXIMITY = "-73.94,40.65";

export interface GeoPlace {
  label: string;
  lat: number;
  lon: number;
}

// Mapbox geocoding (as used in the legacy app) — turns typed text into
// NYC coordinates for the /api/trip planner.
export async function geocodePlaces(query: string, limit = 5): Promise<GeoPlace[]> {
  const q = query.trim();
  if (!q || !TOKEN) return [];
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json` +
    `?access_token=${TOKEN}&country=us&proximity=${PROXIMITY}&types=address,place,poi,neighborhood&limit=${limit}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features ?? []).map((f: { place_name: string; center: [number, number] }) => ({
      label: f.place_name.replace(/, United States$/, ""),
      lon: f.center[0],
      lat: f.center[1],
    }));
  } catch {
    return [];
  }
}
