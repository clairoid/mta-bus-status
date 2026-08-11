import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/chrome/PageShell";
import { RouteBadge } from "../components/ui/RouteBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { Overline } from "../components/ui/Overline";
import { Icon } from "../components/ui/Icon";
import { useAppStore } from "../store/useAppStore";
import { groupTrips, clockTime } from "../lib/data/tripHistory";
import type { TripHistoryEntry } from "../lib/data/types";

// Trip History: the trips this user actually planned, grouped by day.
// Backed by the synced store rather than a mock list. No ride-outcome
// "status" is shown, because the app never observes whether a ride happened.
export function TripHistory() {
  const navigate = useNavigate();
  const setTrip = useAppStore((s) => s.setTrip);
  const tripHistory = useAppStore((s) => s.tripHistory);
  const clearTripHistory = useAppStore((s) => s.clearTripHistory);

  const groups = useMemo(() => groupTrips(tripHistory), [tripHistory]);

  const replay = (entry: TripHistoryEntry) => {
    setTrip(entry.from, entry.to);
    navigate("/trip-planner");
  };

  return (
    <PageShell title="Trip History">
      {tripHistory.length === 0 ? (
        <EmptyState
          icon="history"
          title="No trips yet"
          subtitle="Plan a trip and it'll be saved here so you can run it again."
          action={
            <button
              type="button"
              onClick={() => navigate("/trip-planner")}
              className="flex min-h-11 items-center rounded-control bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-95"
            >
              Plan a trip
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-dim">
              {tripHistory.length} trip{tripHistory.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={clearTripHistory}
              className="flex min-h-11 items-center rounded-control border border-border bg-card px-3.5 text-xs font-semibold text-text2 transition-colors hover:bg-chip active:bg-chip"
            >
              Clear history
            </button>
          </div>

          {groups.map(({ group, trips }) => (
            <section key={group} className="mb-5">
              <Overline>{group}</Overline>
              <div className="mt-2.5 grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2">
                {trips.map((entry) => (
                  <div key={entry.id} className="rounded-card border border-border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2.5">
                      <RouteBadge routeId={entry.route} />
                      <span className="ml-auto text-[11px] text-dim">{clockTime(entry.at)}</span>
                    </div>
                    <div className="text-sm font-semibold text-text">
                      {entry.from} → {entry.to}
                    </div>
                    <div className="mt-1 text-[11px] text-dim">{entry.walkMin} min walking</div>
                    <button
                      type="button"
                      onClick={() => replay(entry)}
                      className="mt-3 flex min-h-9 items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-xs font-semibold text-text2 transition-colors hover:bg-chip active:bg-chip"
                    >
                      <Icon name="refresh" size={13} />
                      Replay
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </PageShell>
  );
}
