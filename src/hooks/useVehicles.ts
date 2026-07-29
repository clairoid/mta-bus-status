import { useCallback, useState } from "react";
import { fetchVehicles } from "../lib/data/real/vehicles";
import { usePolling } from "./usePolling";
import type { Vehicle } from "../lib/data/types";

// README/audit: vehicles poll faster than arrivals (~15s).
const POLL_MS = 15_000;

export interface VehiclesState {
  vehicles: Vehicle[];
  loading: boolean;
  error: boolean;
}

export function useVehicles(routes: string[]): VehiclesState {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const routesKey = routes.join(",");

  const load = useCallback(async () => {
    if (!routesKey) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    try {
      const result = await fetchVehicles(routesKey.split(","));
      setVehicles(result);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [routesKey]);

  // usePolling pauses in a hidden tab and catches up on return.
  usePolling(load, POLL_MS);

  return { vehicles, loading, error };
}
