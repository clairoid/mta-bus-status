import { RouteBadge } from "../ui/RouteBadge";
import { StatusPill } from "../ui/StatusPill";
import { CrowdDot } from "../ui/CrowdDot";
import { occupancyToCrowd } from "../../lib/data/format";
import type { Vehicle } from "../../lib/data/types";

// README Live Vehicles card: badge, bus # mono, StatusPill, destination,
// next stop, CrowdDot, and the nearest-stop distance/stops-away (the real
// SIRI feed carries no speed or per-stop ETA time, so we show progress).
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const delayed = /delay|noprogress|slowprogress|late/i.test(
    `${vehicle.progressRate ?? ""} ${vehicle.progressStatus ?? ""}`
  );
  const crowd = occupancyToCrowd(vehicle.occupancy);
  const nextStopName = vehicle.onwardCalls?.[0]?.name;
  const stopsAway = vehicle.nextStop?.stopsAway ?? vehicle.onwardCalls?.[0]?.stopsAway;
  const distance = vehicle.nextStop?.distance ?? vehicle.onwardCalls?.[0]?.distance;

  return (
    <div className="self-start rounded-card border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <RouteBadge routeId={vehicle.route} />
        <span className="font-mono text-xs text-dim">#{vehicle.id}</span>
        <span className="ml-auto">
          <StatusPill status={delayed ? "Delayed" : "In service"} />
        </span>
      </div>
      <div className="mb-0.5 truncate text-sm font-bold capitalize text-text">
        → {vehicle.destination.toLowerCase()}
      </div>
      <div className="mb-3 truncate text-xs capitalize text-text2">
        Next: {nextStopName ? nextStopName.toLowerCase() : "—"}
      </div>
      <div className="flex items-center gap-3.5 border-t border-border pt-3">
        {crowd ? <CrowdDot level={crowd} showLabel /> : <span className="text-xs text-dim">Crowd n/a</span>}
        {distance && <span className="text-xs text-dim">{distance}</span>}
        {stopsAway != null && (
          <span className="ml-auto text-sm font-extrabold text-text tabular-nums">
            {stopsAway}
            <span className="ml-0.5 text-[9px] text-dim">stops</span>
          </span>
        )}
      </div>
    </div>
  );
}
