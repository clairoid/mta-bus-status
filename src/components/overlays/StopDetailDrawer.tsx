import type { StopArrivals } from "../../lib/data/types";
import { minutesToSecs } from "../../hooks/useArrivals";
import { RouteBadge } from "../ui/RouteBadge";
import { CountdownTime } from "../ui/CountdownTime";
import { Overline } from "../ui/Overline";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "./toast-context";

interface StopDetailDrawerProps {
  stop: StopArrivals | null;
  onClose: () => void;
}

// README stop detail drawer: right-side drawer (full-width bottom sheet on
// mobile). The live mini-map (approaching-bus markers by ETA) lands in the
// map phase; this ships the stop header, ★ favorite, and arrival list.
export function StopDetailDrawer({ stop, onClose }: StopDetailDrawerProps) {
  const isFav = useAppStore((s) => (stop ? !!s.fav[stop.stopId] : false));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const { showToast } = useToast();

  if (!stop) return null;

  const count = stop.arrivals.length;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50 [animation:fadeIn_0.3s]" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-[400px] flex-col border-l border-border bg-card shadow-drawer [animation:overlayUp_0.35s]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h2 className="text-base font-bold text-text">{stop.name}</h2>
            <div className="mt-0.5 font-mono text-[11px] text-dim">{stop.stopId}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-dim hover:text-text">
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-xs text-dim">
            {count} approaching{count !== 1 ? "" : ""}
          </span>
          <button
            type="button"
            onClick={() => {
              toggleFavorite(stop.stopId);
              showToast(isFav ? "Removed from favorites" : "Added to favorites", isFav ? "☆" : "★");
            }}
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: isFav ? "var(--yellow)" : "var(--text2)" }}
          >
            {isFav ? "★ Favorited" : "☆ Favorite"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <Overline>Upcoming arrivals</Overline>
          <div className="mt-3 space-y-2">
            {count === 0 ? (
              <p className="text-sm text-dim">No upcoming arrivals right now.</p>
            ) : (
              stop.arrivals.map((a, i) => (
                <div
                  key={`${a.route}-${a.destination}-${i}`}
                  className="flex items-center justify-between rounded-control border border-border px-3 py-2.5"
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
        </div>
      </div>
    </div>
  );
}
