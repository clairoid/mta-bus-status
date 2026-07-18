import { RouteBadge } from "../ui/RouteBadge";
import type { TripSuggestion } from "../../lib/data/types";

interface TripOptionCardProps {
  option: TripSuggestion;
  rank: number;
}

// README Trip Planner option: route badge, tag, total (walking) minutes,
// leg breakdown. The real /api/trip provides walk times + route (no ride
// ETA), so the total shown is walking minutes.
export function TripOptionCard({ option, rank }: TripOptionCardProps) {
  const tag = option.transferRequired ? "↻ Transfer" : rank === 0 ? "Direct · fastest" : "Direct";
  const tagColor = option.transferRequired ? "var(--yellow)" : "#22c55e";

  return (
    <div className="rounded-card border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <RouteBadge routeId={option.route} size="lg" />
        <span className="text-xs font-bold" style={{ color: tagColor }}>
          {tag}
        </span>
        <span className="ml-auto text-lg font-extrabold tabular-nums text-text">
          {option.totalWalkMin}
          <span className="ml-1 text-[11px] font-semibold text-dim">min walk</span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-text2">
        <span>🚶 {option.originStop.walkMin}m</span>
        <span className="text-dim">→</span>
        <RouteBadge routeId={option.route} size="sm" />
        <span className="text-dim">→</span>
        <span>🚶 {option.destStop.walkMin}m</span>
      </div>
      <div className="mt-2 truncate text-[11px] capitalize text-dim">
        {option.originStop.name.toLowerCase()} → {option.destStop.name.toLowerCase()}
      </div>
    </div>
  );
}
