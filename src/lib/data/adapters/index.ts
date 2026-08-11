import { mockCalendarSource } from "./calendar";

// Single point of truth for which implementation backs each domain that has no
// real backend yet. Only one is left: Service Calendar needs GTFS *static*
// (calendar.txt / calendar_dates.txt) — the realtime alert feed carries no
// future-dated entries to build a calendar from (verified: 0 of 77 alerts had
// a future activePeriod).
//
// Everything else now runs on live data: crowding and notifications are
// derived from the SIRI/GTFS-RT feeds, reliability comes from GTFS-RT
// tripUpdates, and saved views / trip history live in the synced store.
export const dataSources = {
  calendar: mockCalendarSource,
};
