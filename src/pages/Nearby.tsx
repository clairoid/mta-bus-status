import { useCallback, useState } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { Icon } from "../components/ui/Icon";
import { NearbyCard, type NearbyStopView } from "../components/cards/NearbyCard";
import { StopDrawerHost } from "../components/overlays/StopDrawerHost";
import { useGeolocation, type GeoCoords } from "../hooks/useGeolocation";
import { useOnDemandStop } from "../hooks/useOnDemandStop";
import { fetchStopsForRoute } from "../lib/data/real/stops";
import { haversineMeters } from "../lib/data/format";
import { useAppStore } from "../store/useAppStore";

// README Nearby: distance-labeled stop cards with route chips; click opens
// stop detail. Real geolocation + /api/stops/:route (per active route),
// haversine-sorted client-side; clicking a stop fetches its live arrivals
// on demand and opens the drawer.
export function Nearby() {
  const mapRoutes = useAppStore((s) => s.mapRoutes);
  const { findMe, loading: geoLoading, error: geoError } = useGeolocation();
  const { drawerStops, openStop } = useOnDemandStop();

  const [nearby, setNearby] = useState<NearbyStopView[] | null>(null);
  const [searching, setSearching] = useState(false);

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

  const onCardOpen = useCallback(
    (stopId: string) => {
      const stop = nearby?.find((s) => s.stopId === stopId);
      if (stop) openStop(stopId, stop.routes[0], stop.name);
    },
    [nearby, openStop]
  );

  const busy = geoLoading || searching;

  return (
    <PageShell title="Nearby">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={locate}
          disabled={busy}
          className="flex min-h-11 items-center gap-2 rounded-control bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-95 disabled:opacity-60"
        >
          <Icon name="crosshair" size={16} />
          {busy ? "Locating…" : "Find stops near me"}
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
          icon="pin"
          title="No stops nearby yet"
          subtitle="Enable location to find stops around you on your active routes."
        />
      ) : nearby.length === 0 ? (
        <EmptyState
          icon="pin"
          title="No stops nearby"
          subtitle="No stops on your active routes were found near your location."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
          {nearby.map((stop) => (
            <NearbyCard key={stop.stopId} stop={stop} onOpen={onCardOpen} />
          ))}
        </div>
      )}

      <StopDrawerHost stops={drawerStops} />
    </PageShell>
  );
}
