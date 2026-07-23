import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/chrome/PageShell";
import { RouteBadge } from "../components/ui/RouteBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { Icon } from "../components/ui/Icon";
import { dataSources } from "../lib/data/adapters";
import { useAppStore } from "../store/useAppStore";
import type { TripHistoryEntry } from "../lib/data/types";

// README Trip History: 2-col past-ride cards (route, from→to, status,
// day/time/duration, "↻ Replay" → opens Trip Planner prefilled).
export function TripHistory() {
  const navigate = useNavigate();
  const setTrip = useAppStore((s) => s.setTrip);
  const [history, setHistory] = useState<TripHistoryEntry[] | null>(null);

  useEffect(() => {
    let active = true;
    dataSources.userData.getTripHistory().then((h) => active && setHistory(h));
    return () => {
      active = false;
    };
  }, []);

  const replay = (entry: TripHistoryEntry) => {
    setTrip(entry.from, entry.to);
    navigate("/trip-planner");
  };

  if (history === null) return <PageShell title="Trip History">{null}</PageShell>;

  return (
    <PageShell title="Trip History">
      {history.length === 0 ? (
        <EmptyState icon="history" title="No trips yet" subtitle="Your past rides will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2">
          {history.map((entry) => (
            <div key={entry.id} className="rounded-card border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2.5">
                <RouteBadge routeId={entry.route} />
                <span className="text-[11px] uppercase tracking-wide text-dim">{entry.group}</span>
                <span className="ml-auto text-xs font-bold" style={{ color: entry.statusColor }}>
                  {entry.status}
                </span>
              </div>
              <div className="text-sm font-semibold text-text">
                {entry.from} → {entry.to}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-dim">
                <span>{entry.time}</span>
                <span>·</span>
                <span>{entry.dur}</span>
              </div>
              <button
                type="button"
                onClick={() => replay(entry)}
                className="mt-3 flex min-h-9 items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-xs font-semibold text-text2 transition-colors hover:bg-chip active:bg-chip"
              >
                <Icon name="refresh" size={13} />
                Replay
              </button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
