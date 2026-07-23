import { useMemo } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { LivePill } from "../components/ui/LivePill";
import { Overline } from "../components/ui/Overline";
import { Icon } from "../components/ui/Icon";
import { StopDrawerHost } from "../components/overlays/StopDrawerHost";
import { useVehicles } from "../hooks/useVehicles";
import { useRouteGeometry } from "../hooks/useRouteGeometry";
import { useOnDemandStop } from "../hooks/useOnDemandStop";
import { useTick } from "../hooks/tick-context";
import { useAppStore } from "../store/useAppStore";
import { ROUTE_PATHS } from "../lib/data/mock/mta";
import { routeColor } from "../lib/data/routeColors";

// Rail padding: stops/buses map t∈[0,1] into 38px..(height-38px).
const RAIL_INSET = 38;
const DRIFT_PER_TICK = 0.004;

export function RouteMapPage() {
  const myRoutes = useAppStore((s) => s.myRoutes);
  const routeMapId = useAppStore((s) => s.routeMapId) ?? myRoutes[0] ?? "B6";
  const setRouteMapId = useAppStore((s) => s.setRouteMapId);
  const elapsed = useTick();

  const path = ROUTE_PATHS[routeMapId];
  const color = routeColor(routeMapId);

  const { vehicles } = useVehicles([routeMapId]);
  const geometry = useRouteGeometry([routeMapId]);
  const realStops = geometry.stops[routeMapId] ?? [];
  const { drawerStops, openStop } = useOnDemandStop();

  // Buses drift along the line off the shared tick (glide via CSS transition).
  const busPositions = useMemo(
    () => path.buses.map((base) => ((base + elapsed * DRIFT_PER_TICK) % 1)),
    [path.buses, elapsed]
  );

  return (
    <PageShell title="Route Map">
      {/* route picker */}
      <div className="no-scrollbar scroll-fade-x mb-5 flex gap-2 overflow-x-auto py-0.5">
        {myRoutes.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setRouteMapId(id)}
            aria-pressed={id === routeMapId}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-pill border px-4 text-[13px] font-bold transition-colors active:scale-95 ${
              id === routeMapId ? "border-accent bg-accent-soft text-accent" : "border-border bg-card text-text2"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: routeColor(id) }} />
            {id}
          </button>
        ))}
      </div>

      {/* header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span
          className="rounded-[7px] px-3 py-1 text-[15px] font-extrabold text-white"
          style={{ backgroundColor: color }}
        >
          {routeMapId}
        </span>
        <div>
          <div className="text-[15px] font-bold text-text">{path.dir}</div>
          <div className="text-xs text-dim">{path.span}</div>
        </div>
        <span className="ml-auto">
          <LivePill count={vehicles.length} label="buses live" />
        </span>
      </div>

      <div className="flex flex-col gap-5 min-[860px]:flex-row min-[860px]:items-stretch">
        {/* vertical rail (mock ROUTE_PATHS layout + drifting buses) */}
        <div
          className="relative min-h-[520px] w-full shrink-0 overflow-hidden rounded-[16px] border border-border bg-[#0d0e14] min-[860px]:w-[280px]"
        >
          <div
            className="absolute left-1/2 w-1 -translate-x-1/2 rounded"
            style={{ top: RAIL_INSET, bottom: RAIL_INSET, backgroundColor: color, opacity: 0.35 }}
          />
          {path.stops.map((stop) => (
            <div
              key={stop.name}
              className="absolute left-0 right-0 flex items-center gap-2.5 px-4"
              style={{ top: `calc(${RAIL_INSET}px + ${stop.t} * (100% - ${RAIL_INSET * 2}px))`, transform: "translateY(-50%)" }}
            >
              <span
                className="w-1/2 pr-3.5 text-right text-[11px] text-white/85"
                style={{ fontWeight: stop.hub ? 700 : 400 }}
              >
                {stop.name}
              </span>
              <span
                className="shrink-0 rounded-full border-2 border-[#0d0e14]"
                style={{
                  width: stop.hub ? 14 : 10,
                  height: stop.hub ? 14 : 10,
                  backgroundColor: color,
                  boxShadow: `0 0 0 2px ${color}`,
                }}
              />
              {stop.accessible && <Icon name="accessibility" size={12} className="text-text2" title="Accessible" />}
            </div>
          ))}
          {busPositions.map((t, i) => (
            <div
              key={i}
              className="absolute left-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border-2 border-white text-white shadow-lg [transition:top_1s_linear]"
              style={{ top: `calc(${RAIL_INSET}px + ${t} * (100% - ${RAIL_INSET * 2}px))`, backgroundColor: color }}
            >
              <Icon name="bus" size={13} strokeWidth={2.2} />
            </div>
          ))}
        </div>

        {/* real stop list (clickable → drawer with live arrivals) */}
        <div className="min-w-0 flex-1">
          <Overline>Stops · {realStops.length || path.stops.length}</Overline>
          <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-card">
            {realStops.length > 0
              ? realStops.map((stop) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => openStop(stop.id, routeMapId, stop.name)}
                    className="flex min-h-12 w-full items-center gap-3 border-t border-border px-4 py-3 text-left transition-colors first:border-t-0 hover:bg-chip active:bg-chip"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="flex-1 truncate text-[13px] font-medium capitalize text-text">
                      {stop.name.toLowerCase()}
                    </span>
                    <Icon name="chevronRight" size={15} className="shrink-0 text-dim" />
                  </button>
                ))
              : path.stops.map((stop) => (
                  <div
                    key={stop.name}
                    className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="flex-1 text-[13px] font-medium text-text">{stop.name}</span>
                    {stop.hub && (
                      <span className="rounded-full bg-chip-soft px-2 py-0.5 text-[10px] font-bold text-accent">
                        HUB
                      </span>
                    )}
                    {stop.accessible && <Icon name="accessibility" size={13} className="text-text2" title="Accessible" />}
                  </div>
                ))}
          </div>
        </div>
      </div>

      <StopDrawerHost stops={drawerStops} />
    </PageShell>
  );
}
