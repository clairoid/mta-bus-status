import { useCallback, useState } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { NearbyCard, type NearbyStopView } from "../components/cards/NearbyCard";
import { StopDrawerHost } from "../components/overlays/StopDrawerHost";
import { useGeolocation, type GeoCoords } from "../hooks/useGeolocation";
import { fetchStopsForRoute } from "../lib/data/real/stops";
import { fetchArrivals } from "../lib/data/real/arrivals";
import { haversineMeters } from "../lib/data/format";
import { useAppStore } from "../store/useAppStore";
import type { StopArrivals } from "../lib/data/types";

// README Nearby: distance-labeled stop cards with route chips; click opens
// stop detail. Real geolocation + /api/stops/:route (per active route),
// haversine-sorted client-side; clicking a stop fetches its live arrivals
// on demand and opens the drawer.
export function Nearby() {
  const mapRoutes = useAppStore((s) => s.mapRoutes);
  const setSelectedStop = useAppStore((s) => s.setSelectedStop);
  const { findMe, loading: geoLoading, error: geoError } = useGeolocation();

  const [nearby, setNearby] = useState<NearbyStopView[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [drawerStops, setDrawerStops] = useState<StopArrivals[]>([]);

  const locate = useCallback(() => {
    findMe(async (coords: GeoCoords) => {
      setSearching(true);
      try {
        const perRoute = await Promise.all(
          mapRoutes.map(async (route) => {
            try {
              const stops = await fetchStopsForRoute(route);
              return stops.map((s) => ({ ...s, route }));
            } catch {
              return [];
            }
          })
        );

        // Merge duplicate stops (a stop served by several routes) and keep
        // the nearest 9 by haversine distance from the user.
        const byId = new Map<string, NearbyStopView>();
        for (const s of perRoute.flat()) {
          if (s.lat == null || s.lon == null) continue;
          const distanceMeters = haversineMeters(coords.lat, coords.lng, s.lat, s.lon);
          const existing = byId.get(s.id);
          if (existing) {
            if (!existing.routes.includes(s.route)) existing.routes.push(s.route);
          } else {
            byId.set(s.id, {
              stopId: s.id,
              name: s.name,
              distanceMeters,
              routes: [s.route],
            });
          }
        }
        const sorted = [...byId.values()].sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, 9);
        setNearby(sorted);
      } finally {
        setSearching(false);
      }
    });
  }, [findMe, mapRoutes]);

  const openStop = useCallback(
    async (stopId: string) => {
      const stop = nearby?.find((s) => s.stopId === stopId);
      if (!stop) return;
      // Fetch this stop's live arrivals on demand, then open the shared drawer.
      try {
        const result = await fetchArrivals([stop.routes[0]], { [stop.routes[0]]: [stopId] });
        const withData: StopArrivals =
          result.find((s) => s.stopId === stopId) ??
          { stopId, name: stop.name, route: stop.routes[0], arrivals: [] };
        setDrawerStops((prev) => [...prev.filter((s) => s.stopId !== stopId), withData]);
        setSelectedStop(stopId);
      } catch {
        setDrawerStops((prev) => [
          ...prev.filter((s) => s.stopId !== stopId),
          { stopId, name: stop.name, route: stop.routes[0], arrivals: [] },
        ]);
        setSelectedStop(stopId);
      }
    },
    [nearby, setSelectedStop]
  );

  const busy = geoLoading || searching;

  return (
    <PageShell title="Nearby">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={locate}
          disabled={busy}
          className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          📍 {busy ? "Locating…" : "Find stops near me"}
        </button>
        {nearby && (
          <span className="text-xs text-dim">{nearby.length} stops on your active routes</span>
        )}
      </div>

      {geoError && (
        <div className="mb-4 whitespace-pre-line rounded-card border border-border bg-card p-4 text-xs text-text2">
          {geoError}
        </div>
      )}

      {nearby === null ? (
        <EmptyState
          icon="📍"
          title="No stops nearby yet"
          subtitle="Enable location to find stops around you on your active routes."
        />
      ) : nearby.length === 0 ? (
        <EmptyState
          icon="📍"
          title="No stops nearby"
          subtitle="No stops on your active routes were found near your location."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 min-[1080px]:grid-cols-3">
          {nearby.map((stop) => (
            <NearbyCard key={stop.stopId} stop={stop} onOpen={openStop} />
          ))}
        </div>
      )}

      <StopDrawerHost stops={drawerStops} />
    </PageShell>
  );
}
