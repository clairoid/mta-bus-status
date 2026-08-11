import { PageShell } from "../components/chrome/PageShell";
import { ReliabilityCard } from "../components/cards/ReliabilityCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useReliability } from "../hooks/useReliability";

// Reliability: live schedule adherence per followed route, from the GTFS-RT
// tripUpdates feed. A snapshot of trips in service right now — not a
// historical average, and the copy says so rather than implying otherwise.
export function Reliability() {
  const { data, loading, error } = useReliability();

  if (loading) {
    return (
      <PageShell title="Reliability">
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2 min-[1080px]:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell title="Reliability">
        <EmptyState
          icon="chart"
          title="Couldn't load schedule adherence"
          subtitle="The MTA's trip feed didn't respond. It'll retry automatically."
        />
      </PageShell>
    );
  }

  const running = data.routes.reduce((n, r) => n + r.total, 0);

  return (
    <PageShell title="Reliability">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-xs text-dim">
          {running} trip{running === 1 ? "" : "s"} in service on your lines
        </span>
        {data.citywide.trips > 0 && (
          <span className="text-xs text-dim">
            · citywide right now{" "}
            <span className="font-semibold text-text2">{data.citywide.pct}% on time</span> across{" "}
            {data.citywide.trips} trips on {data.citywide.routes} routes
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2 min-[1080px]:grid-cols-3">
        {data.routes.map((entry) => (
          <ReliabilityCard key={entry.route} entry={entry} />
        ))}
      </div>

      <p className="mt-5 max-w-[640px] text-[11px] leading-relaxed text-dim">
        On time means a trip is running no more than 1 minute early and no more than 5 minutes
        late, measured against its schedule. This is a live snapshot of trips currently in
        service, so on quiet routes it can be based on only a handful of trips.
      </p>
    </PageShell>
  );
}
