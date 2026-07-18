import { useEffect, useRef, useState } from "react";
import { fetchVehicles } from "../lib/data/real/vehicles";
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!routesKey) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const load = async () => {
      try {
        const result = await fetchVehicles(routesKey.split(","));
        if (!mountedRef.current) return;
        setVehicles(result);
        setError(false);
      } catch {
        if (mountedRef.current) setError(true);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [routesKey]);

  return { vehicles, loading, error };
}
