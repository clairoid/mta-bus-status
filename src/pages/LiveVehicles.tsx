import { useMemo, useState } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { Chip } from "../components/ui/Chip";
import { ChipRail } from "../components/inputs/ChipRail";
import { LivePill } from "../components/ui/LivePill";
import { VehicleCard } from "../components/cards/VehicleCard";
import { StopCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useVehicles } from "../hooks/useVehicles";
import { useAppStore } from "../store/useAppStore";


// README Live Vehicles: active fleet cards + route filter chips + empty state.
export function LiveVehicles() {
  const myRoutes = useAppStore((s) => s.myRoutes);
  const { vehicles, loading } = useVehicles(myRoutes);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => (filter === "all" ? vehicles : vehicles.filter((v) => v.route === filter)),
    [vehicles, filter]
  );

  const chips = ["all", ...myRoutes];

  return (
    <PageShell title="Live Vehicles">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <LivePill count={vehicles.length} label="buses in service" />
        <ChipRail>
          {chips.map((c) => (
            <Chip
              key={c}
              label={c === "all" ? "All" : c}
              variant="solid"
              active={filter === c}
              onClick={() => setFilter(c)}
            />
          ))}
        </ChipRail>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2 min-[1080px]:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StopCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="bus"
          title="No buses on this route right now"
          subtitle="Try a different route filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2 min-[1080px]:grid-cols-3">
          {filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
