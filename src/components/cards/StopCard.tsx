import type { StopArrivals } from "../../lib/data/types";
import { minutesToSecs } from "../../hooks/useArrivals";
import { RouteBadge } from "../ui/RouteBadge";
import { CountdownTime } from "../ui/CountdownTime";
import { Icon } from "../ui/Icon";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "../overlays/toast-context";

interface StopCardProps {
  stop: StopArrivals;
  accessible?: boolean;
  distance?: string;
  onOpen?: (stopId: string) => void;
}

// README dashboard/arrivals StopCard: header (name, mono stop code, ★ toggle)
// + per-arrival rows (route badge, destination, live countdown).
//
// The ★ used to be a role="button" span *nested inside* the header button —
// invalid HTML (the a11y tree read it as button-inside-button) and a 15×23px
// target. Header and star are now siblings in a flex row, each with its own
// hit area.
export function StopCard({ stop, accessible, distance, onOpen }: StopCardProps) {
  const isFav = useAppStore((s) => !!s.fav[stop.stopId]);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const { showToast } = useToast();

  const onToggleFav = () => {
    toggleFavorite(stop.stopId);
    showToast(isFav ? "Removed from favorites" : "Added to favorites", "star");
  };

  return (
    <div className="self-start overflow-hidden rounded-card border border-border bg-card">
      <div className="flex items-stretch border-b border-border">
        <button
          type="button"
          onClick={() => onOpen?.(stop.stopId)}
          // Without this the header button had no accessible name at all —
          // screen readers announced a bare "button".
          aria-label={`${stop.name}, ${stop.arrivals.length} approaching. Open stop details`}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 py-3 pl-4 text-left transition-colors active:bg-chip"
        >
          {accessible && (
            <Icon name="accessibility" size={15} className="shrink-0 text-accent" title="Accessible stop" />
          )}
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-bold text-text">{stop.name}</span>
            <span className="block truncate font-mono text-[11px] text-dim">
              {distance ?? stop.stopId}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onToggleFav}
          aria-pressed={isFav}
          aria-label={isFav ? `Unfavorite ${stop.name}` : `Favorite ${stop.name}`}
          className="flex w-12 shrink-0 items-center justify-center transition-colors active:bg-chip"
          style={{ color: isFav ? "var(--yellow)" : "var(--dim)" }}
        >
          <Icon name="star" size={17} filled={isFav} />
        </button>
      </div>

      {stop.arrivals.length === 0 ? (
        <div className="px-4 py-3 text-xs text-dim">No upcoming arrivals</div>
      ) : (
        stop.arrivals.map((a, i) => (
          <div
            key={`${a.route}-${a.destination}-${i}`}
            className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 first:border-t-0"
          >
            <div className="flex min-w-0 items-center gap-2">
              <RouteBadge routeId={a.route} size="sm" />
              <span className="truncate text-xs capitalize text-text2">
                {a.destination.toLowerCase()}
              </span>
            </div>
            <CountdownTime seconds={minutesToSecs(a.minutes)} />
          </div>
        ))
      )}
    </div>
  );
}
