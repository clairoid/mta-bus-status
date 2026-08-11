import { useCallback, useState } from "react";
import { fetchReliability } from "../lib/data/real/reliability";
import { usePolling } from "./usePolling";
import { useAppStore } from "../store/useAppStore";
import type { ReliabilityData } from "../lib/data/types";

// The feed is CDN-cached 30s server-side; match that rather than hammering it.
const POLL_MS = 60_000;

export function useReliability(): { data: ReliabilityData | null; loading: boolean; error: boolean } {
  const myRoutes = useAppStore((s) => s.myRoutes);
  const [data, setData] = useState<ReliabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const routesKey = myRoutes.join(",");

  const load = useCallback(async () => {
    if (!routesKey) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      const result = await fetchReliability(routesKey.split(","));
      setData(result);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [routesKey]);

  usePolling(load, POLL_MS);

  return { data, loading, error };
}
