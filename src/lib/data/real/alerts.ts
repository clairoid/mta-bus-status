import { getJSON } from "./client";
import type { Alert } from "../types";

// GET /api/alerts -> { alerts: Alert[] } (GTFS-RT Service Alerts, 60s server cache)
export async function fetchAlerts(): Promise<Alert[]> {
  const data = await getJSON<{ alerts: Alert[] }>("/api/alerts");
  return data.alerts;
}
