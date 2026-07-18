import type { CrowdingData } from "../types";
import { CROWDING } from "../mock/mta";

export interface CrowdingSource {
  getCrowding(): Promise<CrowdingData>;
}

export const mockCrowdingSource: CrowdingSource = {
  getCrowding: async () => CROWDING,
};

// Swap in later per API_MAPPING.md: SIRI Occupancy aggregated by route + stop segment.
// export const realCrowdingSource: CrowdingSource = { getCrowding: () => getJSON('/api/crowding') };
