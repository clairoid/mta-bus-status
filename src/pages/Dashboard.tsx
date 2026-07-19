import { useMemo } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { Chip } from "../components/ui/Chip";
import { Overline } from "../components/ui/Overline";
import { StopCard } from "../components/cards/StopCard";
import { StopDrawerHost } from "../components/overlays/StopDrawerHost";
import { StopCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { RouteBadge } from "../components/ui/RouteBadge";
import { CountdownTime } from "../components/ui/CountdownTime";
import { LiveMapLazy } from "../components/map/LiveMapLazy";
import { useArrivals, minutesToSecs } from "../hooks/useArrivals";
import { useAlerts } from "../hooks/useAlerts";
import { useVehicles } from "../hooks/useVehicles";
import { useRouteGeometry } from "../hooks/useRouteGeometry";
import { useOnDemandStop } from "../hooks/useOnDemandStop";
import { useAppStore } from "../store/useAppStore";
import { ROUTES } from "../lib/data/mock/mta";
import { routeColor } from "../lib/data/routeColors";
import { cleanText, effectLabel, effectSeverity, severityColors } from "../lib/data/alertFormat";
import { flattenDepartures } from "../lib/data/departures";
import type { Alert } from "../lib/data/types";
import type { Departure } from "../components/cards/DepartureRow";

const AVAILABLE_ROUTES = Object.keys(ROUTES);

export function Dashboard() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const mapRoutes = useAppStore((s) => s.mapRoutes);
  const toggleMapRoute = useAppStore((s) => s.toggleMapRoute);
  const setSelectedStop = useAppStore((s) => s.setSelectedStop);
  const heatmap = useAppStore((s) => s.heatmap);
  const toggleHeatmap = useAppStore((s) => s.toggleHeatmap);

  const { stops, loading, refresh } = useArrivals(mapRoutes);
  const { alerts } = useAlerts();

  // Only fetch vehicles + route geometry while the map view is active.
  const mapActive = view === "map";
  const { vehicles } = useVehicles(mapActive ? mapRoutes : []);
  const geometry = useRouteGeometry(mapActive ? mapRoutes : []);
  const { drawerStops, openStop } = useOnDemandStop();

  const flat = useMemo(() => flattenDepartures(stops), [stops]);
  const hero = flat[0];
  const departures = flat.slice(0, 5);
  const liveCount = flat.length;

  const routeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of flat) counts[a.route] = (counts[a.route] ?? 0) + 1;
    return counts;
  }, [flat]);

  const dashAlerts = useMemo(
    () => alerts.filter((al) => al.routes.some((r) => mapRoutes.includes(r))).slice(0, 2),
    [alerts, mapRoutes]
  );

  return (
    <PageShell title="Dashboard" liveCount={liveCount} onRefresh={refresh}>
      <div className="flex h-full min-h-0 gap-0">
        {/* left: toolbar + map/list */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mb-4 flex items-center gap-2.5">
            <SegmentedControl
              options={[
                { value: "map", label: "Map" },
                { value: "list", label: "List" },
              ]}
              value={view}
              onChange={setView}
            />
            <div className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
              {AVAILABLE_ROUTES.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  dotColor={routeColor(r)}
                  count={routeCounts[r] ?? 0}
                  active={mapRoutes.includes(r)}
                  onClick={() => toggleMapRoute(r)}
                />
              ))}
            </div>
            {view === "map" && (
              <button
                type="button"
                onClick={toggleHeatmap}
                className={`shrink-0 rounded-control px-3 py-1.5 text-xs font-bold transition-colors ${
                  heatmap ? "bg-accent-soft text-accent" : "bg-card text-text2 hover:bg-chip"
                }`}
              >
                🔥 Heatmap
              </button>
            )}
          </div>

          {view === "map" ? (
            <LiveMapLazy
              vehicles={vehicles}
              geometry={geometry}
              visibleRoutes={mapRoutes}
              heatmapEnabled={heatmap}
              onOpenStop={openStop}
            />
          ) : loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <StopCardSkeleton key={i} />
              ))}
            </div>
          ) : stops.length === 0 ? (
            <EmptyState
              icon="🚏"
              title="No stops for this filter"
              subtitle="Pick a route chip above to see live arrivals."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stops.map((stop) => (
                <StopCard key={stop.stopId} stop={stop} onOpen={setSelectedStop} />
              ))}
            </div>
          )}
        </div>

        {/* right rail — hidden <1080px */}
        <aside className="ml-5 hidden w-[352px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-border pl-5 min-[1080px]:flex">
          <HeroCard hero={hero} />
          <div>
            <Overline>Departure Board</Overline>
            <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-card">
              {departures.length === 0 ? (
                <div className="px-3.5 py-3 text-xs text-dim">No departures</div>
              ) : (
                departures.map((dp, i) => (
                  <div
                    key={`${dp.stopId}-${dp.route}-${i}`}
                    className="grid grid-cols-[42px_1fr_48px] items-center gap-2 border-t border-border px-3.5 py-2.5 first:border-t-0"
                  >
                    <span
                      className="rounded-[5px] py-0.5 text-center text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: routeColor(dp.route) }}
                    >
                      {dp.route}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-text">{dp.stopName}</div>
                      <div className="truncate text-[10px] capitalize text-dim">
                        {dp.destination.toLowerCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <CountdownTime seconds={minutesToSecs(dp.minutes)} size="md" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <Overline>Service Alerts</Overline>
            <div className="mt-2.5 space-y-2.5">
              {dashAlerts.length === 0 ? (
                <div className="rounded-card border border-border bg-card px-3.5 py-3 text-xs text-dim">
                  No active alerts on your routes
                </div>
              ) : (
                dashAlerts.map((al) => <DashAlertCard key={al.id} alert={al} />)
              )}
            </div>
          </div>
        </aside>
      </div>
      <StopDrawerHost stops={[...stops, ...drawerStops]} />
    </PageShell>
  );
}

function HeroCard({ hero }: { hero: Departure | undefined }) {
  return (
    <div>
      <Overline>Next arrival</Overline>
      <div
        className="mt-2.5 rounded-card p-[18px]"
        style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
      >
        {hero ? (
          <>
            <div className="mb-2.5 flex items-center gap-2">
              <span className="rounded-[6px] bg-white/20 px-2.5 py-0.5 text-xs font-extrabold text-white">
                {hero.route}
              </span>
              <span className="truncate text-xs font-semibold capitalize text-white/90">
                {hero.destination.toLowerCase()} · {hero.stopName}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="tabular-nums text-[46px] font-extrabold leading-none tracking-[-1px] text-white">
                {hero.minutes ?? "—"}
              </span>
              <span className="text-[15px] font-bold text-white/85">min</span>
            </div>
          </>
        ) : (
          <div className="py-2 text-sm font-semibold text-white/85">No arrivals right now</div>
        )}
      </div>
    </div>
  );
}

function DashAlertCard({ alert }: { alert: Alert }) {
  const sev = effectSeverity(alert.effect);
  const colors = severityColors(sev);
  const route = alert.routes[0] ?? "";
  return (
    <div className="rounded-card border border-border bg-card p-3.5">
      <div className="mb-2 flex items-center gap-1.5">
        {route && <RouteBadge routeId={route} size="sm" />}
        <span
          className="rounded-[6px] px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
          style={{ backgroundColor: colors.fill, color: colors.text }}
        >
          {effectLabel(alert.effect)}
        </span>
      </div>
      <div className="line-clamp-2 text-xs leading-relaxed text-text2">{cleanText(alert.header)}</div>
    </div>
  );
}
