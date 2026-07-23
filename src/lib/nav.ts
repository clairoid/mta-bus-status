import type { IconName } from "../components/ui/Icon";

export interface NavEntry {
  id: string;
  label: string;
  path: string;
  icon: IconName;
  shortcut?: string;
}

// README "Screens / Views (Web app — 20 pages)", in sidebar order.
export const NAV_ENTRIES: NavEntry[] = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: "home", shortcut: "1" },
  { id: "arrivals", label: "Live Arrivals", path: "/arrivals", icon: "clock", shortcut: "2" },
  { id: "alerts", label: "Service Alerts", path: "/alerts", icon: "alert", shortcut: "3" },
  { id: "routes", label: "Routes", path: "/routes", icon: "route", shortcut: "4" },
  { id: "favorites", label: "Favorites", path: "/favorites", icon: "star", shortcut: "5" },
  { id: "nearby", label: "Nearby", path: "/nearby", icon: "pin", shortcut: "6" },
  { id: "saved-views", label: "Saved Views", path: "/saved-views", icon: "bookmark", shortcut: "7" },
  { id: "crowding", label: "Live Crowding", path: "/crowding", icon: "users", shortcut: "8" },
  { id: "trip-planner", label: "Trip Planner", path: "/trip-planner", icon: "compass", shortcut: "9" },
  { id: "departures", label: "Departure Board", path: "/departures", icon: "list" },
  { id: "calendar", label: "Service Calendar", path: "/calendar", icon: "calendar" },
  { id: "reliability", label: "Reliability", path: "/reliability", icon: "chart" },
  { id: "vehicles", label: "Live Vehicles", path: "/vehicles", icon: "bus" },
  { id: "changes", label: "Service Changes", path: "/changes", icon: "megaphone" },
  { id: "route-map", label: "Route Map", path: "/route-map", icon: "map" },
  { id: "accessibility", label: "Accessibility", path: "/accessibility", icon: "accessibility" },
  { id: "notifications", label: "Notifications", path: "/notifications", icon: "bell" },
  { id: "history", label: "Trip History", path: "/history", icon: "history" },
  { id: "profile", label: "Profile", path: "/profile", icon: "user" },
];

export const SETTINGS_ENTRY: NavEntry = {
  id: "settings",
  label: "Settings",
  path: "/settings",
  icon: "settings",
};

// The four pages that earn a permanent slot on a phone. Everything else lives
// behind "More" — the tab bar used to be the *only* mobile nav, which left 15
// of the 20 pages (Settings among them) unreachable below 560px.
export const MOBILE_TABS: NavEntry[] = [
  { id: "dashboard", label: "Map", path: "/", icon: "map" },
  { id: "arrivals", label: "Arrivals", path: "/arrivals", icon: "clock" },
  { id: "routes", label: "Routes", path: "/routes", icon: "route" },
  { id: "alerts", label: "Alerts", path: "/alerts", icon: "alert" },
];

const TAB_IDS = new Set(MOBILE_TABS.map((t) => t.id));

// Grouped for the "More" sheet so sixteen links don't read as one
// undifferentiated list. Anything already on the tab bar is filtered out.
const MORE_SECTIONS: { title: string; ids: string[] }[] = [
  { title: "Live", ids: ["vehicles", "crowding", "departures", "nearby"] },
  { title: "Plan", ids: ["trip-planner", "route-map", "calendar", "changes"] },
  { title: "Yours", ids: ["favorites", "saved-views", "history", "notifications", "profile"] },
  { title: "Insights", ids: ["reliability", "accessibility"] },
];

export const MORE_GROUPS = MORE_SECTIONS.map((section) => ({
  title: section.title,
  entries: section.ids
    .map((id) => NAV_ENTRIES.find((e) => e.id === id))
    .filter((e): e is NavEntry => !!e && !TAB_IDS.has(e.id)),
})).filter((g) => g.entries.length > 0);
