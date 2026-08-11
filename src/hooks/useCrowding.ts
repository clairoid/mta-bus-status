import { useMemo } from "react";
import { useVehicles } from "./useVehicles";
import { useAppStore } from "../store/useAppStore";
import { buildCrowding } from "../lib/data/crowding";
import type { CrowdingData } from "../lib/data/types";

// Real crowding, derived from the SIRI Occupancy field on /api/vehicles.
// Costs no extra endpoint: the vehicle feed already carries occupancy and the
// client already polls it, so this is pure client-side aggregation.
export function useCrowding(): { crowding: CrowdingData | null; loading: boolean; routes: string[] } {
  const mapRoutes = useAppStore((s) => s.mapRoutes);
  const { vehicles, loading } = useVehicles(mapRoutes);

  const crowding = useMemo(
    () => (loading ? null : buildCrowding(vehicles, mapRoutes)),
    [vehicles, mapRoutes, loading]
  );

  return { crowding, loading, routes: mapRoutes };
}
