import type { StopArrivals } from "../../lib/data/types";
import { minutesToSecs } from "../../hooks/useArrivals";
import { RouteBadge } from "../ui/RouteBadge";
import { CountdownTime } from "../ui/CountdownTime";
import { Icon } from "../ui/Icon";
import { Overline } from "../ui/Overline";
import { Sheet } from "./Sheet";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "./toast-context";

interface StopDetailDrawerProps {
  stop: StopArrivals | null;
  onClose: () => void;
}

// README stop detail drawer: right-side drawer, full-width bottom sheet on
// mobile. That mobile half was never built — it rendered as an opaque
// full-screen takeover that buried the tab bar, ignored the notch, and left
// ~700px of dead space under a single arrival row. Sheet handles all of that
// now (drag handle, flick-to-dismiss, Back to close, safe areas).
export function StopDetailDrawer({ stop, onClose }: StopDetailDrawerProps) {
  const isFav = useAppStore((s) => (stop ? !!s.fav[stop.stopId] : false));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const { showToast } = useToast();

  const count = stop?.arrivals.length ?? 0;

  return (
    <Sheet
      open={!!stop}
      onClose={onClose}
      desktop="drawer"
      title={stop?.name}
      subtitle={stop ? <span className="font-mono">{stop.stopId}</span> : undefined}
    >
      {stop && (
        <>
          <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
            <span className="text-xs text-dim">
              {count} approaching
            </span>
            <button
              type="button"
              onClick={() => {
                toggleFavorite(stop.stopId);
                showToast(
                  isFav ? "Removed from favorites" : "Added to favorites",
                  isFav ? "star" : "star"
                );
              }}
              aria-pressed={isFav}
              className="-mr-2 flex min-h-11 items-center gap-1.5 rounded-control px-2 text-sm font-semibold transition-colors active:bg-chip"
              style={{ color: isFav ? "var(--yellow)" : "var(--text2)" }}
            >
              <Icon name="star" size={16} filled={isFav} />
              {isFav ? "Favorited" : "Favorite"}
            </button>
          </div>

          <div className="p-5">
            <Overline>Upcoming arrivals</Overline>
            <div className="mt-3 space-y-2">
              {count === 0 ? (
                <p className="text-sm text-dim">No upcoming arrivals right now.</p>
              ) : (
                stop.arrivals.map((a, i) => (
                  <div
                    key={`${a.route}-${a.destination}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-control border border-border px-3 py-3"
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
        </>
      )}
    </Sheet>
  );
}
