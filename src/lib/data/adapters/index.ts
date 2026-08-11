import { mockReliabilitySource } from "./reliability";
import { mockCalendarSource } from "./calendar";

// Single point of truth for which implementation backs each domain that has
// no real backend yet. Swapping one touches only this file (and its new
// adapter file), never the pages/components.
//
// Crowding, notifications, saved views and trip history have graduated off
// mocks — they're derived from the live feeds or the synced store directly.
// What's left needs infrastructure the app doesn't have:
//   reliability → time-series sampling of Expected vs Aimed arrival times
//   calendar    → GTFS static (calendar.txt); the realtime alert feed
//                 carries no future-dated entries to build a calendar from
export const dataSources = {
  reliability: mockReliabilitySource,
  calendar: mockCalendarSource,
};
