// Ported from the design handoff's data/mta.js. Most domains have graduated
// off this file — routes, stops, arrivals, vehicles, alerts and trip come
// from lib/data/real/*; crowding and notifications are derived from those
// live feeds; saved views and trip history live in the synced store.
//
// What remains needs infrastructure that doesn't exist yet: RELIABILITY
// needs time-series sampling, CALENDAR needs GTFS static. ROUTE_PATHS and
// SERVICE_CHANGES are still presentation fixtures.
import type {
  CalendarData,
  ReliabilityEntry,
  Route,
  RoutePath,
  ServiceChange,
} from "../types";

export const ROUTES: Record<string, Route> = {
  B6: { id: "B6", color: "#3b82f6", name: "Bay Ridge – Bergen Beach" },
  B8: { id: "B8", color: "#f59e0b", name: "Bay Ridge – Brownsville" },
  B15: { id: "B15", color: "#10b981", name: "Downtown – JFK Airport" },
  B44: { id: "B44", color: "#dc2626", name: "Williamsburg – Sheepshead Bay" },
  B41: { id: "B41", color: "#8b5cf6", name: "Downtown – Kings Plaza" },
};

export const RELIABILITY: ReliabilityEntry[] = [
  { route: "B6", pct: 91, onTime: 142, total: 156, avgDelay: "2m", trend: [78, 82, 85, 88, 86, 90, 91] },
  { route: "B8", pct: 64, onTime: 61, total: 95, avgDelay: "6m", trend: [70, 68, 66, 60, 63, 62, 64] },
  { route: "B15", pct: 83, onTime: 88, total: 106, avgDelay: "3m", trend: [80, 79, 84, 82, 85, 83, 83] },
];







export const CALENDAR: CalendarData = {
  month: "July 2026",
  weeks: [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, 31, null, null],
  ],
  today: 16,
  events: { 18: "alert", 24: "alert", 4: "holiday" },
  legend: [["#6366f1", "Today"], ["#eab308", "Service alert"], ["#ef4444", "Holiday schedule"]],
  upcoming: [
    { day: "Jul 18", label: "B8 weekend detour", type: "alert" },
    { day: "Jul 24", label: "B44-SBS suspended", type: "alert" },
    { day: "Jul 4", label: "Independence Day — holiday service", type: "holiday" },
  ],
};

// chronological feed shape kept for reference; the Service Changes screen
// is powered by the real /api/alerts adapter instead (see README nuance
// in the rewrite plan — same GTFS-RT feed as ALERTS, not a separate mock).
export const SERVICE_CHANGES: ServiceChange[] = [
  { id: "sc1", route: "B44", sev: "crit", tag: "Suspended", when: "This weekend", posted: "2h ago", title: "No B44-SBS service Sat–Sun", body: "Signal upgrades between Williamsburg and Sheepshead Bay. Local B44 runs on a modified schedule." },
  { id: "sc2", route: "B8", sev: "warn", tag: "Detour", when: "Active now", posted: "3h ago", title: "B8 detoured via Coney Island Ave", body: "Emergency roadwork on Ave U (E 13 St–Ocean Pkwy). Use temporary stops on Coney Island Ave. Delays 10–15 min." },
  { id: "sc3", route: "B15", sev: "info", tag: "Reroute", when: "Starts Jul 20", posted: "1d ago", title: "B15 new stop at Terminal 4", body: "Adds a dedicated JFK Terminal 4 curbside stop; the old Federal Circle stop closes." },
  { id: "sc4", route: "B6", sev: "ok", tag: "Restored", when: "Resolved", posted: "1d ago", title: "B6 delays on Kings Hwy cleared", body: "Normal service has resumed after earlier congestion." },
  { id: "sc5", route: "B41", sev: "info", tag: "Schedule", when: "Jul 4", posted: "3d ago", title: "Holiday schedule — Independence Day", body: "All routes operate on a Sunday schedule with reduced frequency." },
];

// Kept for reference (route-map layout) until real GTFS shapes.txt-derived
// paths replace it per API_MAPPING.md; RouteMap page reads real stops for
// its stop list but this static `t`-position layout for the rail/buses.
export const ROUTE_PATHS: Record<string, RoutePath> = {
  B6: {
    dir: "Bay Ridge – Bergen Beach", color: "#3b82f6", span: "10.4 mi · ~46 min end to end",
    stops: [
      { name: "Bay Ridge Av / 4 Av", t: 0.02, hub: true },
      { name: "7 Av / 60 St", t: 0.16 },
      { name: "Ft Hamilton Pkwy", t: 0.30, accessible: true },
      { name: "Dahill Rd", t: 0.42 },
      { name: "Kings Hwy / Ocean Av", t: 0.56, hub: true, accessible: true },
      { name: "Ave U / E 15 St", t: 0.70 },
      { name: "Flatbush Av / Av N", t: 0.84, accessible: true },
      { name: "Bergen Beach – Loop", t: 0.98, hub: true },
    ],
    buses: [0.22, 0.61, 0.88],
  },
  B8: {
    dir: "Bay Ridge – Brownsville", color: "#f59e0b", span: "8.9 mi · ~41 min end to end",
    stops: [
      { name: "Bay Ridge / Shore Rd", t: 0.02, hub: true, accessible: true },
      { name: "86 St / 4 Av", t: 0.18 },
      { name: "Ft Hamilton Pkwy", t: 0.33 },
      { name: "Ave U / E 13 St", t: 0.48 },
      { name: "Coney Island Av", t: 0.62, accessible: true },
      { name: "Flatbush / Foster", t: 0.78 },
      { name: "Brownsville – Rockaway Av", t: 0.97, hub: true },
    ],
    buses: [0.30, 0.70],
  },
  B15: {
    dir: "Downtown – JFK Airport", color: "#10b981", span: "9.6 mi · ~52 min end to end",
    stops: [
      { name: "Jackie Robinson Pkwy", t: 0.02, hub: true },
      { name: "Fulton St / Utica Av", t: 0.16, accessible: true },
      { name: "Ralph Av / Av J", t: 0.32 },
      { name: "Flatbush Av / Av N", t: 0.47, accessible: true },
      { name: "New Lots Av", t: 0.63 },
      { name: "Federal Circle", t: 0.80 },
      { name: "JFK Terminal 4", t: 0.98, hub: true, accessible: true },
    ],
    buses: [0.24, 0.55, 0.85],
  },
  B44: {
    dir: "Williamsburg – Sheepshead Bay", color: "#dc2626", span: "9.2 mi · ~44 min end to end",
    stops: [
      { name: "Williamsburg Bridge Plaza", t: 0.02, hub: true, accessible: true },
      { name: "Nostrand / DeKalb", t: 0.18 },
      { name: "Nostrand / Fulton", t: 0.33, accessible: true },
      { name: "Nostrand / Av J", t: 0.50 },
      { name: "Kings Hwy", t: 0.66, hub: true },
      { name: "Av U / Nostrand", t: 0.82 },
      { name: "Sheepshead Bay Rd", t: 0.98, hub: true, accessible: true },
    ],
    buses: [0.40, 0.75],
  },
  B41: {
    dir: "Downtown – Kings Plaza", color: "#8b5cf6", span: "8.1 mi · ~39 min end to end",
    stops: [
      { name: "Cadman Plaza", t: 0.02, hub: true, accessible: true },
      { name: "Flatbush / Atlantic", t: 0.18, hub: true },
      { name: "Grand Army Plaza", t: 0.34, accessible: true },
      { name: "Flatbush / Church", t: 0.50 },
      { name: "Flatbush / Av H", t: 0.67 },
      { name: "Flatbush / Av U", t: 0.83, accessible: true },
      { name: "Kings Plaza", t: 0.98, hub: true },
    ],
    buses: [0.28, 0.62],
  },
};
