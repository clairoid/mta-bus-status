import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/chrome/PageShell";
import { RouteStatCard } from "../components/cards/RouteStatCard";
import { RoutePicker } from "../components/overlays/RoutePicker";
import { EmptyState } from "../components/ui/EmptyState";
import { useVehicles } from "../hooks/useVehicles";
import { useReliability } from "../hooks/useReliability";
import { useAppStore } from "../store/useAppStore";
import { useToast } from "../components/overlays/toast-context";
import type { ReliabilityEntry } from "../lib/data/types";

// README Routes: 2-col route cards with Track pill + buses/on-time/avg-delay.
// The card list is the user's followed lines (myRoutes), managed via the picker.
export function Routes() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const myRoutes = useAppStore((s) => s.myRoutes);
  const { vehicles } = useVehicles(myRoutes);
  const { data: reliabilityData } = useReliability();
  const tracked = useAppStore((s) => s.tracked);
  const toggleTracked = useAppStore((s) => s.toggleTracked);
  const setRouteMapId = useAppStore((s) => s.setRouteMapId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const busCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of vehicles) counts[v.route] = (counts[v.route] ?? 0) + 1;
    return counts;
  }, [vehicles]);

  const relByRoute = useMemo(() => {
    const map: Record<string, ReliabilityEntry> = {};
    for (const r of reliabilityData?.routes ?? []) map[r.route] = r;
    return map;
  }, [reliabilityData]);

  const openMap = (routeId: string) => {
    setRouteMapId(routeId);
    navigate("/route-map");
  };

  const toggleTrack = (routeId: string) => {
    const willTrack = !tracked[routeId];
    toggleTracked(routeId);
    showToast(
      willTrack ? `${routeId} added to tracked routes` : `${routeId} removed`,
      willTrack ? "pin" : "check"
    );
  };

  return (
    <PageShell title="Routes">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex min-h-11 items-center gap-1.5 rounded-control bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-95"
        >
          + Manage lines
        </button>
        <span className="text-xs text-dim">{myRoutes.length} lines followed</span>
      </div>

      {myRoutes.length === 0 ? (
        <EmptyState
          icon="bus"
          title="No lines yet"
          subtitle="Add MTA bus lines to follow their arrivals, alerts and vehicles."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2">
          {myRoutes.map((routeId) => (
            <RouteStatCard
              key={routeId}
              routeId={routeId}
              buses={busCounts[routeId] ?? 0}
              reliability={relByRoute[routeId]}
              tracked={!!tracked[routeId]}
              onToggleTrack={() => toggleTrack(routeId)}
              onOpenMap={() => openMap(routeId)}
            />
          ))}
        </div>
      )}

      <RoutePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </PageShell>
  );
}
