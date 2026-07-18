import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/chrome/PageShell";
import { RouteStatCard } from "../components/cards/RouteStatCard";
import { useVehicles } from "../hooks/useVehicles";
import { useReliability } from "../hooks/useReliability";
import { useAppStore } from "../store/useAppStore";
import { useToast } from "../components/overlays/toast-context";
import { ROUTES } from "../lib/data/mock/mta";

const ALL_ROUTES = Object.keys(ROUTES);

// README Routes: 2-col route cards with Track pill + buses/on-time/avg-delay.
export function Routes() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { vehicles } = useVehicles(ALL_ROUTES);
  const { reliability } = useReliability();
  const tracked = useAppStore((s) => s.tracked);
  const toggleTracked = useAppStore((s) => s.toggleTracked);
  const setRouteMapId = useAppStore((s) => s.setRouteMapId);

  const busCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of vehicles) counts[v.route] = (counts[v.route] ?? 0) + 1;
    return counts;
  }, [vehicles]);

  const relByRoute = useMemo(() => {
    const map: Record<string, (typeof reliability)[number]> = {};
    for (const r of reliability) map[r.route] = r;
    return map;
  }, [reliability]);

  const openMap = (routeId: string) => {
    setRouteMapId(routeId);
    navigate("/route-map");
  };

  const toggleTrack = (routeId: string) => {
    const willTrack = !tracked[routeId];
    toggleTracked(routeId);
    showToast(
      willTrack ? `${routeId} added to tracked routes` : `${routeId} removed`,
      willTrack ? "📍" : "✓"
    );
  };

  return (
    <PageShell title="Routes">
      <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2">
        {ALL_ROUTES.map((routeId) => (
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
    </PageShell>
  );
}
