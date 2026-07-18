import { useEffect, useState } from "react";
import { dataSources } from "../lib/data/adapters";
import type { ReliabilityEntry } from "../lib/data/types";

// Mock-backed for now (no reliability analytics backend yet).
export function useReliability(): { reliability: ReliabilityEntry[]; loading: boolean } {
  const [reliability, setReliability] = useState<ReliabilityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dataSources.reliability.getReliability().then((r) => {
      if (!active) return;
      setReliability(r);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { reliability, loading };
}
