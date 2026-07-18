import { RouteBadge } from "../ui/RouteBadge";
import { StatTile } from "./StatTile";
import { routeName } from "../../lib/data/routeColors";
import type { ReliabilityEntry } from "../../lib/data/types";

interface RouteStatCardProps {
  routeId: string;
  buses: number;
  reliability?: ReliabilityEntry;
  tracked: boolean;
  onToggleTrack: () => void;
  onOpenMap: () => void;
}

function onTimeColor(pct: number): string {
  if (pct >= 85) return "#22c55e";
  if (pct >= 70) return "var(--yellow)";
  return "#ef4444";
}

// README Routes: badge + name (opens Route Map) + Track/Tracking pill
// (toggles, fires toast) + stats row (buses, on-time %, avg delay) that
// also opens Route Map.
export function RouteStatCard({
  routeId,
  buses,
  reliability,
  tracked,
  onToggleTrack,
  onOpenMap,
}: RouteStatCardProps) {
  const pct = reliability?.pct ?? null;

  return (
    <div className="rounded-card border border-border bg-card p-[18px]">
      <div className="mb-3.5 flex items-center gap-2.5">
        <RouteBadge routeId={routeId} size="lg" />
        <button
          type="button"
          onClick={onOpenMap}
          className="flex-1 text-left text-[13px] font-semibold text-text2 hover:text-text"
        >
          {routeName(routeId) ?? routeId}
        </button>
        <button
          type="button"
          onClick={onToggleTrack}
          className={`rounded-pill px-3 py-1 text-[11px] font-bold transition-colors ${
            tracked ? "bg-accent text-white" : "bg-chip text-chip-text hover:bg-accent-soft"
          }`}
        >
          {tracked ? "Tracking" : "Track"}
        </button>
      </div>
      <button type="button" onClick={onOpenMap} className="flex gap-5 text-left">
        <StatTile value={buses} label="Buses" />
        <StatTile
          value={pct !== null ? `${pct}%` : "—"}
          label="On time"
          valueColor={pct !== null ? onTimeColor(pct) : undefined}
        />
        <StatTile value={reliability?.avgDelay ?? "—"} label="Avg delay" />
      </button>
    </div>
  );
}
