import { useCallback, useState } from "react";
import { fetchArrivals } from "../lib/data/real/arrivals";
import { usePolling } from "./usePolling";
import type { StopArrivals } from "../lib/data/types";
import { useAppStore } from "../store/useAppStore";

// README/API_MAPPING: poll arrivals every 20-30s; the 1s UI tick interpolates
// between fetches by decrementing. The real endpoint returns `minutes`, so the
// countdown base is minutes*60, re-synced on each poll.
const POLL_MS = 30_000;

export interface ArrivalsState {
  stops: StopArrivals[];
  loading: boolean;
  error: boolean;
  updatedAt: number | null;
  refresh: () => void;
}

export function useArrivals(routes: string[]): ArrivalsState {
  const [stops, setStops] = useState<StopArrivals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const setDataError = useAppStore((s) => s.setDataError);
  const routesKey = routes.join(",");

  const load = useCallback(async () => {
    if (!routesKey) {
      setStops([]);
      setLoading(false);
      return;
    }
    try {
      const result = await fetchArrivals(routesKey.split(","));
      setStops(result);
      setError(false);
      setDataError(false);
      setUpdatedAt(Date.now());
    } catch {
      setError(true);
      setDataError(true);
    } finally {
      setLoading(false);
    }
  }, [routesKey, setDataError]);

  // usePolling pauses in a hidden tab and catches up on return.
  usePolling(load, POLL_MS);

  return { stops, loading, error, updatedAt, refresh: load };
}

// Real arrivals carry `minutes`; the countdown components want seconds.
export function minutesToSecs(minutes: number | null): number | null {
  return minutes === null ? null : minutes * 60;
}
