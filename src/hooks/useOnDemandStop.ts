import { useCallback, useState } from "react";
import { fetchArrivals } from "../lib/data/real/arrivals";
import { useAppStore } from "../store/useAppStore";
import type { StopArrivals } from "../lib/data/types";

// For stops not already in a page's loaded arrivals (map markers, nearby
// cards): fetch that one stop's live arrivals on demand, then open the
// shared drawer. Returns the accumulated stops to feed StopDrawerHost.
export function useOnDemandStop() {
  const setSelectedStop = useAppStore((s) => s.setSelectedStop);
  const [drawerStops, setDrawerStops] = useState<StopArrivals[]>([]);

  const openStop = useCallback(
    async (stopId: string, route: string, fallbackName?: string) => {
      const fallback: StopArrivals = { stopId, name: fallbackName ?? stopId, route, arrivals: [] };
      try {
        const result = await fetchArrivals([route], { [route]: [stopId] });
        const withData = result.find((s) => s.stopId === stopId) ?? fallback;
        setDrawerStops((prev) => [...prev.filter((s) => s.stopId !== stopId), withData]);
      } catch {
        setDrawerStops((prev) => [...prev.filter((s) => s.stopId !== stopId), fallback]);
      }
      setSelectedStop(stopId);
    },
    [setSelectedStop]
  );

  return { drawerStops, openStop };
}
