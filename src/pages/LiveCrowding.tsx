import { PageShell } from "../components/chrome/PageShell";
import { OccupancyBar } from "../components/cards/OccupancyBar";
import { SegmentBarChart } from "../components/cards/SegmentBarChart";
import { Overline } from "../components/ui/Overline";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

import { useCrowding } from "../hooks/useCrowding";

const LEGEND: [string, string][] = [
  ["#22c55e", "Light"],
  ["#f59e0b", "Moderate"],
  ["#ef4444", "Heavy"],
];

// Live Crowding: left per-route occupancy bars; right, crowding along one
// route. Both derived from the SIRI Occupancy field on the live vehicle feed.
export function LiveCrowding() {
  const { crowding, loading, routes } = useCrowding();

  if (loading || !crowding) {
    return (
      <PageShell title="Live Crowding">
        <div className="grid grid-cols-1 gap-5 min-[1080px]:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageShell>
    );
  }

  if (routes.length === 0) {
    return (
      <PageShell title="Live Crowding">
        <EmptyState
          icon="users"
          title="No routes selected"
          subtitle="Pick a route chip on the Dashboard to see live occupancy."
        />
      </PageShell>
    );
  }

  const anyReporting = crowding.segments.length > 0;

  return (
    <PageShell title="Live Crowding">
      <div className="grid grid-cols-1 gap-5 min-[1080px]:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-[18px]">
          <Overline>Occupancy by route</Overline>
          <div className="mt-4 flex flex-col gap-4">
            {crowding.routes.map((entry) => (
              <OccupancyBar key={entry.route} entry={entry} />
            ))}
          </div>
          {/* Not every bus reports occupancy, and overnight almost none do —
              say so rather than showing an empty bar as if it meant "empty". */}
          <p className="mt-4 text-[11px] leading-relaxed text-dim">
            Occupancy comes from the MTA's live feed and isn't reported by every bus.
          </p>
        </div>

        <div className="rounded-card border border-border bg-card p-[18px]">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <Overline>
              {crowding.segmentRoute ? `${crowding.segmentRoute} crowding along route` : "Crowding along route"}
            </Overline>
            <div className="flex gap-3">
              {LEGEND.map(([color, label]) => (
                <span key={label} className="flex items-center gap-1.5 text-[11px] text-dim">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          {anyReporting ? (
            <>
              <div className="mt-4">
                <SegmentBarChart segments={crowding.segments} />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-dim">
                Each bar is a bus in service, at the stop it's approaching.
              </p>
            </>
          ) : (
            <p className="mt-6 text-sm text-dim">
              No buses on these routes are reporting occupancy right now.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
}
