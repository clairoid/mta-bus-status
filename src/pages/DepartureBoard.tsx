import { useMemo } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { DepartureRow } from "../components/cards/DepartureRow";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { StopDrawerHost } from "../components/overlays/StopDrawerHost";
import { useArrivals } from "../hooks/useArrivals";
import { flattenDepartures } from "../lib/data/departures";
import { useAppStore } from "../store/useAppStore";

// README Departure Board: full table (Route / Stop / Destination / Time);
// rows open stop detail. Destination column hides on mobile.
export function DepartureBoard() {
  const mapRoutes = useAppStore((s) => s.mapRoutes);
  const setSelectedStop = useAppStore((s) => s.setSelectedStop);
  const { stops, loading } = useArrivals(mapRoutes);

  const departures = useMemo(() => flattenDepartures(stops), [stops]);

  return (
    <PageShell title="Departure Board" liveCount={departures.length}>
      {loading ? (
        <Skeleton className="h-80 w-full max-w-[720px]" />
      ) : departures.length === 0 ? (
        <EmptyState
          icon="list"
          title="No departures right now"
          subtitle="Enable routes from the Dashboard to populate the board."
        />
      ) : (
        <div className="max-w-[720px] overflow-hidden rounded-card border border-border bg-card">
          <div className="grid grid-cols-[60px_1fr_70px] gap-2.5 bg-chip-soft px-[18px] py-3 text-[10px] font-bold uppercase tracking-wide text-dim min-[720px]:grid-cols-[60px_1fr_1fr_70px]">
            <span>Route</span>
            <span>Stop</span>
            <span className="hidden min-[720px]:block">Destination</span>
            <span className="text-right">Time</span>
          </div>
          {departures.map((dp, i) => (
            <DepartureRow key={`${dp.stopId}-${dp.route}-${i}`} departure={dp} onOpen={setSelectedStop} />
          ))}
        </div>
      )}

      <StopDrawerHost stops={stops} />
    </PageShell>
  );
}
