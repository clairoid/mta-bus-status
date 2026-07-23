import { useMemo, useState } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { Chip } from "../components/ui/Chip";
import { ChipRail } from "../components/inputs/ChipRail";
import { AlertCard } from "../components/cards/AlertCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useAlerts } from "../hooks/useAlerts";
import { causeLabel } from "../lib/data/alertFormat";
import { useAppStore } from "../store/useAppStore";

const CAUSE_FILTERS = ["All", "Construction", "Accident", "Weather"];

// README Service Alerts: cause filter chips (persisted) + 2-col AlertCard
// grid; each expands on click.
export function ServiceAlerts() {
  const { alerts, loading } = useAlerts();
  const alertFilter = useAppStore((s) => s.alertFilter);
  const setAlertFilter = useAppStore((s) => s.setAlertFilter);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (alertFilter === "All") return alerts;
    return alerts.filter((a) => causeLabel(a.cause) === alertFilter);
  }, [alerts, alertFilter]);

  return (
    <PageShell title="Service Alerts" liveCount={alerts.length}>
      <ChipRail className="mb-4">
        {CAUSE_FILTERS.map((c) => (
          <Chip
            key={c}
            label={c}
            variant="solid"
            active={alertFilter === c}
            onClick={() => setAlertFilter(c)}
          />
        ))}
      </ChipRail>

      {loading ? (
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="check"
          title={alertFilter === "All" ? "No active service alerts" : `No ${alertFilter.toLowerCase()} alerts`}
          subtitle="Alerts on your routes will appear here as they're posted."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              expanded={!!expanded[alert.id]}
              onToggle={() => setExpanded((e) => ({ ...e, [alert.id]: !e[alert.id] }))}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
