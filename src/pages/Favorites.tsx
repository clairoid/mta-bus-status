import { useMemo } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { StopCard } from "../components/cards/StopCard";
import { StopCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { StopDrawerHost } from "../components/overlays/StopDrawerHost";
import { useArrivals } from "../hooks/useArrivals";
import { useAppStore } from "../store/useAppStore";

// README Favorites: 3-col grid of starred stops (live arrivals, ★ to
// unfavorite). Dashed empty state. Favorited stop IDs come from the store;
// their live arrivals come from the same real feed as the dashboard.
export function Favorites() {
  const mapRoutes = useAppStore((s) => s.mapRoutes);
  const fav = useAppStore((s) => s.fav);
  const setSelectedStop = useAppStore((s) => s.setSelectedStop);
  const { stops, loading } = useArrivals(mapRoutes);

  const favIds = useMemo(() => new Set(Object.keys(fav).filter((id) => fav[id])), [fav]);
  const favStops = useMemo(() => stops.filter((s) => favIds.has(s.stopId)), [stops, favIds]);

  const hasFavorites = favIds.size > 0;

  return (
    <PageShell title="Favorites">
      {loading && hasFavorites ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 min-[1080px]:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StopCardSkeleton key={i} />
          ))}
        </div>
      ) : !hasFavorites ? (
        <EmptyState
          icon="star"
          title="No favorites yet"
          subtitle="Tap the star on any stop to pin it here for quick access."
        />
      ) : favStops.length === 0 ? (
        <EmptyState
          icon="star"
          title="Your favorite stops aren't on the active routes"
          subtitle="Enable their routes from the Dashboard chips to see live arrivals here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 min-[1080px]:grid-cols-3">
          {favStops.map((stop) => (
            <StopCard key={stop.stopId} stop={stop} onOpen={setSelectedStop} />
          ))}
        </div>
      )}

      <StopDrawerHost stops={stops} />
    </PageShell>
  );
}
