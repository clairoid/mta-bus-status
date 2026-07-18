import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "../lib/theme/theme-context";
import type { SavedView } from "../lib/data/types";
import { SAVED_VIEWS } from "../lib/data/mock/mta";

export interface AccessibilitySettings {
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  largeTap: boolean;
  accRoute: boolean;
}

export type TextSize = 0.9 | 1 | 1.15 | 1.3;

interface AppState {
  // Theme + view (persisted)
  theme: Theme;
  setTheme: (theme: Theme) => void;
  view: "map" | "list";
  setView: (view: "map" | "list") => void;
  heatmap: boolean;
  toggleHeatmap: () => void;

  // Route/stop filters (persisted)
  mapRoutes: string[];
  setMapRoutes: (routes: string[]) => void;
  toggleMapRoute: (route: string) => void;

  fav: Record<string, boolean>;
  toggleFavorite: (stopId: string) => void;

  tracked: Record<string, boolean>;
  toggleTracked: (route: string) => void;

  // Notifications (persisted)
  notify: boolean;
  setNotify: (v: boolean) => void;
  readNotifs: Record<string, boolean>;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: (ids: string[]) => void;

  // Alerts / vehicles (alertFilter persisted, vehFilter not)
  alertFilter: string;
  setAlertFilter: (cause: string) => void;
  vehFilter: string[];
  setVehFilter: (routes: string[]) => void;

  // Transient UI (not persisted)
  routeMapId: string | null;
  setRouteMapId: (id: string | null) => void;
  selectedStop: string | null;
  setSelectedStop: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  paletteOpen: boolean;
  paletteQuery: string;
  setPalette: (open: boolean, query?: string) => void;
  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;

  // Saved views / route alerts / trip planner (persisted)
  savedViews: SavedView[];
  addSavedView: (view: SavedView) => void;
  removeSavedView: (id: string) => void;
  routeAlerts: Record<string, boolean>;
  toggleRouteAlert: (route: string) => void;
  tripFrom: string;
  tripTo: string;
  setTrip: (from: string, to: string) => void;
  recentTrips: string[];
  addRecentTrip: (label: string) => void;
  removeRecentTrip: (label: string) => void;
  acField: "from" | "to" | null;
  setAcField: (field: "from" | "to" | null) => void;

  // Notification preferences (persisted)
  sound: boolean;
  setSound: (v: boolean) => void;
  pushArrivals: boolean;
  setPushArrivals: (v: boolean) => void;
  pushAlerts: boolean;
  setPushAlerts: (v: boolean) => void;
  pushWeekly: boolean;
  setPushWeekly: (v: boolean) => void;

  // Accessibility (persisted)
  a11y: AccessibilitySettings;
  setA11y: (patch: Partial<AccessibilitySettings>) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;

  // Connectivity (not persisted)
  offline: boolean;
  setOffline: (v: boolean) => void;
  dataError: boolean;
  setDataError: (v: boolean) => void;
}

const MAX_RECENT_TRIPS = 5;

// Single source of truth for which state keys are durable — used by both the
// localStorage persist (above) and the Supabase sync layer.
export const PERSISTED_KEYS = [
  "theme", "view", "heatmap", "mapRoutes", "fav", "tracked", "notify",
  "readNotifs", "alertFilter", "savedViews", "routeAlerts", "tripFrom",
  "tripTo", "recentTrips", "sound", "pushArrivals", "pushAlerts",
  "pushWeekly", "a11y", "textSize",
] as const satisfies readonly (keyof AppState)[];

export type PersistedState = Pick<AppState, (typeof PERSISTED_KEYS)[number]>;

// Snapshot the durable slice of the store (for pushing to Supabase).
export function snapshotPersisted(): PersistedState {
  const s = useAppStore.getState();
  return Object.fromEntries(PERSISTED_KEYS.map((k) => [k, s[k]])) as PersistedState;
}

// Apply a durable slice back onto the store (hydrate from Supabase).
export function hydratePersisted(partial: Partial<PersistedState>) {
  useAppStore.setState(partial as Partial<AppState>);
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      view: "list",
      setView: (view) => set({ view }),
      heatmap: false,
      toggleHeatmap: () => set((s) => ({ heatmap: !s.heatmap })),

      mapRoutes: ["B6", "B8", "B15"],
      setMapRoutes: (mapRoutes) => set({ mapRoutes }),
      toggleMapRoute: (route) =>
        set((s) => ({
          mapRoutes: s.mapRoutes.includes(route)
            ? s.mapRoutes.filter((r) => r !== route)
            : [...s.mapRoutes, route],
        })),

      fav: {},
      toggleFavorite: (stopId) =>
        set((s) => ({ fav: { ...s.fav, [stopId]: !s.fav[stopId] } })),

      tracked: {},
      toggleTracked: (route) =>
        set((s) => ({ tracked: { ...s.tracked, [route]: !s.tracked[route] } })),

      notify: true,
      setNotify: (notify) => set({ notify }),
      readNotifs: {},
      markNotifRead: (id) =>
        set((s) => ({ readNotifs: { ...s.readNotifs, [id]: true } })),
      markAllNotifsRead: (ids) =>
        set((s) => ({
          readNotifs: { ...s.readNotifs, ...Object.fromEntries(ids.map((id) => [id, true])) },
        })),

      alertFilter: "All",
      setAlertFilter: (alertFilter) => set({ alertFilter }),
      vehFilter: [],
      setVehFilter: (vehFilter) => set({ vehFilter }),

      routeMapId: null,
      setRouteMapId: (routeMapId) => set({ routeMapId }),
      selectedStop: null,
      setSelectedStop: (selectedStop) => set({ selectedStop }),
      searchQuery: "",
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      paletteOpen: false,
      paletteQuery: "",
      setPalette: (paletteOpen, paletteQuery = "") => set({ paletteOpen, paletteQuery }),
      helpOpen: false,
      setHelpOpen: (helpOpen) => set({ helpOpen }),

      savedViews: SAVED_VIEWS,
      addSavedView: (view) => set((s) => ({ savedViews: [view, ...s.savedViews] })),
      removeSavedView: (id) =>
        set((s) => ({ savedViews: s.savedViews.filter((v) => v.id !== id) })),
      routeAlerts: {},
      toggleRouteAlert: (route) =>
        set((s) => ({ routeAlerts: { ...s.routeAlerts, [route]: !s.routeAlerts[route] } })),
      tripFrom: "",
      tripTo: "",
      setTrip: (tripFrom, tripTo) => set({ tripFrom, tripTo }),
      recentTrips: [],
      addRecentTrip: (label) =>
        set((s) => ({
          recentTrips: [label, ...s.recentTrips.filter((t) => t !== label)].slice(0, MAX_RECENT_TRIPS),
        })),
      removeRecentTrip: (label) =>
        set((s) => ({ recentTrips: s.recentTrips.filter((t) => t !== label) })),
      acField: null,
      setAcField: (acField) => set({ acField }),

      sound: false,
      setSound: (sound) => set({ sound }),
      pushArrivals: false,
      setPushArrivals: (pushArrivals) => set({ pushArrivals }),
      pushAlerts: true,
      setPushAlerts: (pushAlerts) => set({ pushAlerts }),
      pushWeekly: false,
      setPushWeekly: (pushWeekly) => set({ pushWeekly }),

      a11y: {
        highContrast: false,
        boldText: false,
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        largeTap: false,
        accRoute: false,
      },
      setA11y: (patch) => set((s) => ({ a11y: { ...s.a11y, ...patch } })),
      textSize: 1,
      setTextSize: (textSize) => set({ textSize }),

      offline: !navigator.onLine,
      setOffline: (offline) => set({ offline }),
      dataError: false,
      setDataError: (dataError) => set({ dataError }),
    }),
    {
      name: "mta-bus-status-store",
      partialize: (s) =>
        Object.fromEntries(PERSISTED_KEYS.map((k) => [k, s[k]])) as Partial<AppState>,
    }
  )
);
