import { RouteBadge } from "../ui/RouteBadge";
import { Icon } from "../ui/Icon";

export interface NearbyStopView {
  stopId: string;
  name: string;
  distanceMeters: number;
  routes: string[];
  accessible?: boolean;
}

interface NearbyCardProps {
  stop: NearbyStopView;
  onOpen: (stopId: string) => void;
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

// README Nearby: distance-labeled stop cards with route chips; click opens
// stop detail.
export function NearbyCard({ stop, onOpen }: NearbyCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(stop.stopId)}
      className="flex flex-col gap-3 rounded-card border border-border bg-card p-4 text-left transition-colors hover:bg-chip active:bg-chip"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0" style={{ color: stop.accessible ? "var(--accent)" : "var(--dim)" }}>
            {stop.accessible ? (
              <Icon name="accessibility" size={15} title="Accessible stop" />
            ) : (
              <Icon name="pin" size={15} />
            )}
          </span>
          <span className="truncate text-[13px] font-bold capitalize text-text">
            {stop.name.toLowerCase()}
          </span>
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-dim">
          {formatDistance(stop.distanceMeters)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {stop.routes.map((r) => (
          <RouteBadge key={r} routeId={r} size="sm" />
        ))}
      </div>
    </button>
  );
}
