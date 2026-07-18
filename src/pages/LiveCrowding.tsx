import { PageShell } from "../components/chrome/PageShell";
import { OccupancyBar } from "../components/cards/OccupancyBar";
import { SegmentBarChart } from "../components/cards/SegmentBarChart";
import { Overline } from "../components/ui/Overline";
import { Skeleton } from "../components/ui/Skeleton";

import { useCrowding } from "../hooks/useCrowding";

const LEGEND: [string, string][] = [
  ["#22c55e", "Light"],
  ["#f59e0b", "Moderate"],
  ["#ef4444", "Heavy"],
];

// README Live Crowding: left per-route occupancy bars; right B6 along-route
// segment bar chart + legend. Mock-backed until SIRI Occupancy aggregation.
export function LiveCrowding() {
  const { crowding, loading } = useCrowding();

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
        </div>

        <div className="rounded-card border border-border bg-card p-[18px]">
          <div className="mb-1 flex items-center justify-between">
            <Overline>B6 crowding along route</Overline>
            <div className="flex gap-3">
              {LEGEND.map(([color, label]) => (
                <span key={label} className="flex items-center gap-1.5 text-[11px] text-dim">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <SegmentBarChart segments={crowding.segments} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
