import { useMemo } from "react";
import { StopDetailDrawer } from "./StopDetailDrawer";
import { useAppStore } from "../../store/useAppStore";
import type { StopArrivals } from "../../lib/data/types";

// Resolves the globally-selected stop against a page's loaded arrivals and
// renders the drawer. Every stop-list page mounts one with its own `stops`.
export function StopDrawerHost({ stops }: { stops: StopArrivals[] }) {
  const selectedStop = useAppStore((s) => s.selectedStop);
  const setSelectedStop = useAppStore((s) => s.setSelectedStop);

  const activeStop = useMemo(
    () => stops.find((s) => s.stopId === selectedStop) ?? null,
    [stops, selectedStop]
  );

  return <StopDetailDrawer stop={activeStop} onClose={() => setSelectedStop(null)} />;
}
