import { useEffect, useRef, useState } from "react";
import { fetchAlerts } from "../lib/data/real/alerts";
import type { Alert } from "../lib/data/types";

// /api/alerts is server-cached 60s; poll on the same cadence as arrivals.
const POLL_MS = 30_000;

export function useAlerts(): { alerts: Alert[]; loading: boolean; error: boolean } {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const load = async () => {
      try {
        const result = await fetchAlerts();
        if (!mountedRef.current) return;
        setAlerts(result);
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
  }, []);

  return { alerts, loading, error };
}
