import { useMemo, useState } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { Chip } from "../components/ui/Chip";
import { ChipRail } from "../components/inputs/ChipRail";
import { StopCard } from "../components/cards/StopCard";
import { StopCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { StopDrawerHost } from "../components/overlays/StopDrawerHost";
import { useArrivals } from "../hooks/useArrivals";
import { useAppStore } from "../store/useAppStore";
import type { StopArrivals } from "../lib/data/types";

// README Live Arrivals: route filter chips (single-select) + 3-col StopCard
// grid (same card as dashboard). Empty state when filtered to nothing.
export function LiveArrivals() {
  const mapRoutes = useAppStore((s) => s.mapRoutes);
  const setSelectedStop = useAppStore((s) => s.setSelectedStop);
  const { stops, loading, refresh } = useArrivals(mapRoutes);
  const [filter, setFilter] = useState("all");

  const liveCount = useMemo(
    () => stops.reduce((n, s) => n + s.arrivals.length, 0),
    [stops]
  );

  const filtered = useMemo<StopArrivals[]>(() => {
    if (filter === "all") return stops;
    return stops
      .filter((s) => s.arrivals.some((a) => a.route === filter))
      .map((s) => ({ ...s, arrivals: s.arrivals.filter((a) => a.route === filter) }));
  }, [stops, filter]);

  const chips = ["all", ...mapRoutes];

  return (
    <PageShell title="Live Arrivals" liveCount={liveCount} onRefresh={refresh}>
      <ChipRail className="mb-4">
        {chips.map((c) => (
          <Chip
            key={c}
            label={c === "all" ? "All" : c}
            variant="solid"
            active={filter === c}
            onClick={() => setFilter(c)}
          />
        ))}
      </ChipRail>

      {loading ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 min-[1080px]:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StopCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="pin"
          title="No arrivals for this filter"
          subtitle="Pick a different route or clear the search."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 min-[1080px]:grid-cols-3">
          {filtered.map((stop) => (
            <StopCard key={stop.stopId} stop={stop} onOpen={setSelectedStop} />
          ))}
        </div>
      )}

      <StopDrawerHost stops={stops} />
    </PageShell>
  );
}
