import { mockCrowdingSource } from "./crowding";
import { mockReliabilitySource } from "./reliability";
import { mockCalendarSource } from "./calendar";
import { mockNotificationsSource } from "./notifications";
import { mockUserDataSource } from "./userData";

// Single point of truth for which implementation backs each mock-only
// domain. Swapping any one to a real backend later touches only this
// file (and its new adapter file), never the pages/components.
export const dataSources = {
  crowding: mockCrowdingSource,
  reliability: mockReliabilitySource,
  calendar: mockCalendarSource,
  notifications: mockNotificationsSource,
  userData: mockUserDataSource,
};
