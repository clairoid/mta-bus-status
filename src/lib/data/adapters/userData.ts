import type { Commute, NearbyStop, SavedView, TripHistoryEntry } from "../types";
import { COMMUTE, NEARBY, SAVED_VIEWS, TRIP_HISTORY } from "../mock/mta";

export interface UserDataSource {
  getSavedViews(): Promise<SavedView[]>;
  getTripHistory(): Promise<TripHistoryEntry[]>;
  getCommute(): Promise<Commute>;
  getNearby(): Promise<NearbyStop[]>;
}

// Mutations (add/remove saved view, replay trip, etc.) are handled by the
// app store, which persists user-created records to localStorage; this
// adapter only supplies the seed/default data shown before the user acts.
export const mockUserDataSource: UserDataSource = {
  getSavedViews: async () => SAVED_VIEWS,
  getTripHistory: async () => TRIP_HISTORY,
  getCommute: async () => COMMUTE,
  getNearby: async () => NEARBY,
};

// Swap in later: app backend / on-device storage; NEARBY becomes a real
// geolocation-radius query against /api/stops per API_MAPPING.md.
