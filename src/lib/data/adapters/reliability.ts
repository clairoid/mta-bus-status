import type { ReliabilityEntry } from "../types";
import { RELIABILITY } from "../mock/mta";

export interface ReliabilitySource {
  getReliability(): Promise<ReliabilityEntry[]>;
}

export const mockReliabilitySource: ReliabilitySource = {
  getReliability: async () => RELIABILITY,
};

// Swap in later: derived analytics job over historical GTFS-RT (not a live feed).
