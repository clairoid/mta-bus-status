// Ported from the design handoff's data/mta.js. Domains that already have
// a real backend (routes, stops, arrivals, vehicles, alerts, trip, route
// paths) are NOT consumed from here in the app — see lib/data/real/*.
// Only the domains with no backend yet (see lib/data/adapters/) read from
// this module, per API_MAPPING.md's suggested mock->real swap boundary.
import type {
  CalendarData,
  Commute,
  CrowdingData,
  NearbyStop,
  AppNotification,
  ReliabilityEntry,
  Route,
  RoutePath,
  SavedView,
  ServiceChange,
  TripHistoryEntry,
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

export const NEARBY: NearbyStop[] = [
  { id: "n1", name: "Court St / Livingston", dist: "120m", accessible: true, chips: [{ route: "B6", eta: "2m", color: "#3b82f6" }, { route: "B8", eta: "6m", color: "#f59e0b" }] },
  { id: "n2", name: "Smith / 9 St", dist: "340m", accessible: false, chips: [{ route: "B8", eta: "8m", color: "#f59e0b" }] },
  { id: "n3", name: "Flatbush / Church", dist: "0.6km", accessible: true, chips: [{ route: "B15", eta: "3m", color: "#10b981" }] },
];

export const SAVED_VIEWS: SavedView[] = [
  { id: "v1", icon: "sun", name: "Morning commute", routes: ["B6", "B8"], meta: "2 stops · centered on Court St" },
  { id: "v2", icon: "star", name: "Weekend Brooklyn", routes: ["B6", "B15", "B44"], meta: "5 stops · centered on Prospect Park" },
];

export const COMMUTE: Commute = {
  from: "Home",
  to: "Work",
  walk: "0.4 mi · 8 min walk",
  legs: [
    { route: "B6", label: "Court St → Kings Hwy", eta: 132, note: "boarding" },
    { route: "B15", label: "Kings Hwy → Flatbush", eta: 660, note: "transfer" },
  ],
};

export const NOTIFICATIONS: AppNotification[] = [
  { id: 1, icon: "bus", color: "#3b82f6", title: "B6 arriving in 2 min", body: "5 Av / 42 St · Bay Ridge", time: "now", unread: true },
  { id: 2, icon: "alert", color: "#f59e0b", title: "B8 delay on your route", body: "Detoured via Coney Island Ave · +10 min", time: "8m", unread: true },
  { id: 3, icon: "bell", color: "#6366f1", title: "Your bus is 1 stop away", body: "B15 approaching Flatbush / Av N", time: "1h", unread: false },
  { id: 4, icon: "check", color: "#22c55e", title: "B6 back to normal service", body: "Delays on Kings Hwy have cleared", time: "3h", unread: false },
  { id: 5, icon: "calendar", color: "#9aa0aa", title: "Holiday schedule this Friday", body: "Reduced weekend service on all routes", time: "1d", unread: false },
];

export const CROWDING: CrowdingData = {
  routes: [
    { route: "B6", level: 0.85, label: "Heavy", riders: "82% full" },
    { route: "B8", level: 0.55, label: "Moderate", riders: "54% full" },
    { route: "B15", level: 0.28, label: "Light", riders: "27% full" },
  ],
  segments: [
    { stop: "Bay Ridge Av", level: 0.35 },
    { stop: "7 Av / 60 St", level: 0.62 },
    { stop: "Ft Hamilton", level: 0.88 },
    { stop: "Dahill Rd", level: 0.95 },
    { stop: "Kings Hwy", level: 0.7 },
    { stop: "Ave U", level: 0.44 },
    { stop: "Flatbush", level: 0.25 },
  ],
};

export const TRIP_HISTORY: TripHistoryEntry[] = [
  { id: "h1", group: "Today", route: "B6", from: "Court St", to: "Kings Hwy", time: "8:12 AM", dur: "22 min", status: "On time", statusColor: "#22c55e" },
  { id: "h2", group: "Today", route: "B15", from: "Flatbush", to: "JFK Airport", time: "7:04 AM", dur: "41 min", status: "+6 min", statusColor: "#eab308" },
  { id: "h3", group: "Yesterday", route: "B6", from: "Court St", to: "Kings Hwy", time: "6:38 PM", dur: "25 min", status: "On time", statusColor: "#22c55e" },
  { id: "h4", group: "Yesterday", route: "B8", from: "Ave U", to: "Red Hook", time: "8:20 AM", dur: "34 min", status: "+12 min", statusColor: "#ef4444" },
  { id: "h5", group: "This week", route: "B6", from: "Court St", to: "Kings Hwy", time: "Mon 8:10 AM", dur: "21 min", status: "On time", statusColor: "#22c55e" },
  { id: "h6", group: "This week", route: "B15", from: "Flatbush", to: "New Lots", time: "Mon 5:52 PM", dur: "29 min", status: "+3 min", statusColor: "#eab308" },
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
