export interface NavEntry {
  id: string;
  label: string;
  path: string;
  icon: string;
  shortcut?: string;
}

// README "Screens / Views (Web app — 20 pages)", in sidebar order.
export const NAV_ENTRIES: NavEntry[] = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: "🏠", shortcut: "1" },
  { id: "arrivals", label: "Live Arrivals", path: "/arrivals", icon: "🕐", shortcut: "2" },
  { id: "alerts", label: "Service Alerts", path: "/alerts", icon: "⚠️", shortcut: "3" },
  { id: "routes", label: "Routes", path: "/routes", icon: "🛣️", shortcut: "4" },
  { id: "favorites", label: "Favorites", path: "/favorites", icon: "⭐", shortcut: "5" },
  { id: "nearby", label: "Nearby", path: "/nearby", icon: "📍", shortcut: "6" },
  { id: "saved-views", label: "Saved Views", path: "/saved-views", icon: "🔖", shortcut: "7" },
  { id: "crowding", label: "Live Crowding", path: "/crowding", icon: "👥", shortcut: "8" },
  { id: "trip-planner", label: "Trip Planner", path: "/trip-planner", icon: "🧭", shortcut: "9" },
  { id: "departures", label: "Departure Board", path: "/departures", icon: "📋" },
  { id: "calendar", label: "Service Calendar", path: "/calendar", icon: "📅" },
  { id: "reliability", label: "Reliability", path: "/reliability", icon: "📊" },
  { id: "vehicles", label: "Live Vehicles", path: "/vehicles", icon: "🚌" },
  { id: "changes", label: "Service Changes", path: "/changes", icon: "📢" },
  { id: "route-map", label: "Route Map", path: "/route-map", icon: "🗺️" },
  { id: "accessibility", label: "Accessibility", path: "/accessibility", icon: "♿" },
  { id: "notifications", label: "Notifications", path: "/notifications", icon: "🔔" },
  { id: "history", label: "Trip History", path: "/history", icon: "🕘" },
  { id: "profile", label: "Profile", path: "/profile", icon: "👤" },
];

export const SETTINGS_ENTRY: NavEntry = { id: "settings", label: "Settings", path: "/settings", icon: "⚙️" };

// README mobile bottom tab bar: Map / Arrivals / Routes / Alerts / You
export const MOBILE_TABS: NavEntry[] = [
  { id: "dashboard", label: "Map", path: "/", icon: "🗺️" },
  { id: "arrivals", label: "Arrivals", path: "/arrivals", icon: "🕐" },
  { id: "routes", label: "Routes", path: "/routes", icon: "🛣️" },
  { id: "alerts", label: "Alerts", path: "/alerts", icon: "⚠️" },
  { id: "profile", label: "You", path: "/profile", icon: "👤" },
];
