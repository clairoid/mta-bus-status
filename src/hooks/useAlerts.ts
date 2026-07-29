import { useCallback, useState } from "react";
import { fetchAlerts } from "../lib/data/real/alerts";
import { usePolling } from "./usePolling";
import type { Alert } from "../lib/data/types";

// /api/alerts is server- and CDN-cached 60s; poll on the same cadence as arrivals.
const POLL_MS = 30_000;

export function useAlerts(): { alerts: Alert[]; loading: boolean; error: boolean } {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await fetchAlerts();
      setAlerts(result);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(load, POLL_MS);

  return { alerts, loading, error };
}
