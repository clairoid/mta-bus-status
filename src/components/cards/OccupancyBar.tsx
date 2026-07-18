import { RouteBadge } from "../ui/RouteBadge";
import { crowdLevelColor } from "../../lib/data/format";
import type { CrowdingRouteLevel } from "../../lib/data/types";

// README Live Crowding: per-route occupancy bar (% full, color by level).
export function OccupancyBar({ entry }: { entry: CrowdingRouteLevel }) {
  const color = crowdLevelColor(entry.level);
  return (
    <div className="flex items-center gap-3">
      <RouteBadge routeId={entry.route} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-text2">{entry.label}</span>
          <span className="text-dim">{entry.riders}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-chip">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.round(entry.level * 100)}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}
