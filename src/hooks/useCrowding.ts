import { useEffect, useState } from "react";
import { dataSources } from "../lib/data/adapters";
import type { CrowdingData } from "../lib/data/types";

// Mock-backed for now (SIRI Occupancy aggregation is a later swap).
export function useCrowding(): { crowding: CrowdingData | null; loading: boolean } {
  const [crowding, setCrowding] = useState<CrowdingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dataSources.crowding.getCrowding().then((c) => {
      if (!active) return;
      setCrowding(c);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { crowding, loading };
}
