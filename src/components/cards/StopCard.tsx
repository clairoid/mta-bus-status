import type { StopArrivals } from "../../lib/data/types";
import { minutesToSecs } from "../../hooks/useArrivals";
import { RouteBadge } from "../ui/RouteBadge";
import { CountdownTime } from "../ui/CountdownTime";
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
export function StopCard({ stop, accessible, distance, onOpen }: StopCardProps) {
  const isFav = useAppStore((s) => !!s.fav[stop.stopId]);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const { showToast } = useToast();

  const onToggleFav = () => {
    toggleFavorite(stop.stopId);
    showToast(isFav ? "Removed from favorites" : "Added to favorites", isFav ? "☆" : "★");
  };

  return (
    <div className="self-start overflow-hidden rounded-card border border-border bg-card">
      <button
        type="button"
        onClick={() => onOpen?.(stop.stopId)}
        className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          {accessible && <span className="text-[13px] text-accent">♿</span>}
          <div>
            <div className="text-[13px] font-bold text-text">{stop.name}</div>
            <div className="font-mono text-[11px] text-dim">{distance ?? stop.stopId}</div>
          </div>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onToggleFav();
            }
          }}
          className="cursor-pointer text-[15px]"
          style={{ color: isFav ? "var(--yellow)" : "var(--dim)" }}
          aria-label={isFav ? "Unfavorite stop" : "Favorite stop"}
        >
          {isFav ? "★" : "☆"}
        </span>
      </button>

      {stop.arrivals.length === 0 ? (
        <div className="px-4 py-3 text-xs text-dim">No upcoming arrivals</div>
      ) : (
        stop.arrivals.map((a, i) => (
          <div
            key={`${a.route}-${a.destination}-${i}`}
            className="flex items-center justify-between border-t border-border px-4 py-3 first:border-t-0"
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
