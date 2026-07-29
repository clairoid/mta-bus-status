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

  // The lines the user follows — drives every screen's route list. Add/remove
  // from the "Manage lines" picker (persisted, and synced across devices).
  myRoutes: string[];
  addRoute: (route: string) => void;
  removeRoute: (route: string) => void;

  // Which of myRoutes are currently toggled visible on the dashboard/map.
  mapRoutes: string[];
  setMapRoutes: (routes: string[]) => void;
  toggleMapRoute: (route: string) => void;

  fav: Record<string, boolean>;
  toggleFavorite: (stopId: string) => void;

  tracked: Record<string, boolean>;
  toggleTracked: (route: string) => void;

  // Notifications (persisted)
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

  // Master switch for service-alert push. Drives the `routes` filter on the
  // push subscription (see usePushNotifications). `sound`, `pushArrivals`,
  // `pushWeekly` and `notify` used to live here too but nothing consumed them.
  pushAlerts: boolean;
  setPushAlerts: (v: boolean) => void;

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

// Read at store-creation time, so it has to tolerate a non-browser environment
// (tests, and any future SSR) rather than throwing on `window.matchMedia`.
function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

// Single source of truth for which state keys are durable — used by both the
// localStorage persist (above) and the Supabase sync layer.
export const PERSISTED_KEYS = [
  "theme", "view", "heatmap", "myRoutes", "mapRoutes", "fav", "tracked",
  "readNotifs", "alertFilter", "savedViews", "routeAlerts", "tripFrom",
  "tripTo", "recentTrips", "pushAlerts", "a11y", "textSize",
] as const satisfies readonly (keyof AppState)[];

export type PersistedState = Pick<AppState, (typeof PERSISTED_KEYS)[number]>;

// Bumped whenever the shape of the durable slice changes incompatibly. Stored
// alongside the state so a newer client can recognise (and decline to be
// clobbered by) a blob written by an older one.
export const STATE_VERSION = 2;

// Snapshot the durable slice of the store (for pushing to Supabase).
export function snapshotPersisted(): PersistedState {
  const s = useAppStore.getState();
  return Object.fromEntries(PERSISTED_KEYS.map((k) => [k, s[k]])) as PersistedState;
}

const PERSISTED_KEY_SET = new Set<string>(PERSISTED_KEYS);

// Runtime type guards. The synced blob is opaque `jsonb` with no server-side
// schema, so a blob written by a different app version (or hand-edited) used to
// be spread into the store unchecked — enough to break the app on next load.
function sameShapeAsDefault(value: unknown, reference: unknown): boolean {
  if (Array.isArray(reference)) return Array.isArray(value);
  if (reference === null) return true;
  const t = typeof reference;
  if (t === "object") return typeof value === "object" && value !== null && !Array.isArray(value);
  return typeof value === t;
}

// Keep only known keys whose values match the shape of the store's defaults.
// Anything unrecognised or mistyped is dropped rather than trusted.
export function sanitizePersisted(raw: unknown): Partial<PersistedState> {
  if (typeof raw !== "object" || raw === null) return {};
  const defaults = useAppStore.getInitialState() as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!PERSISTED_KEY_SET.has(key)) continue;
    if (value === undefined) continue;
    if (!sameShapeAsDefault(value, defaults[key])) continue;
    out[key] = value;
  }
  return out as Partial<PersistedState>;
}

// Apply a durable slice back onto the store (hydrate from Supabase).
export function hydratePersisted(partial: Partial<PersistedState>) {
  useAppStore.setState(sanitizePersisted(partial) as Partial<AppState>);
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

      myRoutes: ["B6", "B8", "B15", "B44", "B41"],
      addRoute: (route) =>
        set((s) =>
          s.myRoutes.includes(route)
            ? s
            : { myRoutes: [...s.myRoutes, route], mapRoutes: [...s.mapRoutes, route] }
        ),
      removeRoute: (route) =>
        set((s) => ({
          myRoutes: s.myRoutes.filter((r) => r !== route),
          // Keep dependent selections consistent when a line is dropped.
          mapRoutes: s.mapRoutes.filter((r) => r !== route),
          tracked: Object.fromEntries(Object.entries(s.tracked).filter(([r]) => r !== route)),
          routeAlerts: Object.fromEntries(Object.entries(s.routeAlerts).filter(([r]) => r !== route)),
        })),

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

      pushAlerts: true,
      setPushAlerts: (pushAlerts) => set({ pushAlerts }),

      a11y: {
        highContrast: false,
        boldText: false,
        reduceMotion: prefersReducedMotion(),
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
