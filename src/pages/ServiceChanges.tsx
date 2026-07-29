import { PageShell } from "../components/chrome/PageShell";
import { ServiceChangeCard } from "../components/cards/ServiceChangeCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useAlerts } from "../hooks/useAlerts";
import { effectSeverity } from "../lib/data/alertFormat";
import type { Severity } from "../lib/data/alertFormat";

// Sort most-severe first so critical changes lead the feed.
const SEVERITY_RANK: Record<Severity, number> = { crit: 0, warn: 1, info: 2, ok: 3 };

// README Service Changes: chronological feed, severity-coded left border.
// Powered by the real /api/alerts feed (same source as Service Alerts,
// presented as a change feed) per the rewrite plan.
export function ServiceChanges() {
  const { alerts, loading } = useAlerts();

  const changes = [...alerts].sort(
    (a, b) => SEVERITY_RANK[effectSeverity(a.effect)] - SEVERITY_RANK[effectSeverity(b.effect)]
  );

  return (
    <PageShell title="Service Changes" liveCount={alerts.length}>
      {loading ? (
        <div className="mx-auto flex max-w-[760px] flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : changes.length === 0 ? (
        <EmptyState
          icon="megaphone"
          title="No service changes"
          subtitle="Planned and active service changes on your routes will appear here."
        />
      ) : (
        <div className="mx-auto flex max-w-[760px] flex-col gap-3">
          {changes.map((change) => (
            <ServiceChangeCard key={change.id} change={change} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
