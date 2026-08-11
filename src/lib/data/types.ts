import type { IconName } from "../../components/ui/Icon";

// Core domain types for the MTA Bus Status data layer.
// Real-backed shapes mirror the existing api/*.js responses exactly;
// see API_MAPPING.md in the design handoff for the mock->real field mapping.

export type CrowdLevel = "empty" | "seats" | "standing" | "full";

export interface Route {
  id: string;
  color: string;
  name: string;
}

export interface Stop {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
  dist?: string;
  accessible?: boolean;
  fav?: boolean;
}

export interface Arrival {
  route: string;
  direction?: "Inbound" | "Outbound";
  destination: string;
  minutes: number | null;
  stopsAway: number | null;
  delay: number;
}

export interface StopArrivals {
  stopId: string;
  name: string;
  route: string;
  arrivals: Arrival[];
  error?: string;
}

export interface OnwardCall {
  stopId: string;
  name: string;
  distance: string | null;
  stopsAway: number | null;
  metersAway: number | null;
}

export interface NextStop {
  stopId: string;
  distance: string | null;
  stopsAway: number | null;
}

export interface Vehicle {
  id: string;
  route: string;
  direction?: "Inbound" | "Outbound";
  destination: string;
  lat: number;
  lon: number;
  bearing: number;
  progressRate?: string;
  progressStatus?: string | null;
  occupancy: string | null;
  destinationRef?: string | null;
  onwardCalls?: OnwardCall[];
  nextStop?: NextStop | null;
  recordedAt?: string | null;
  speed?: number | null;
  timestamp?: number | null;
}

export interface AlertActivePeriod {
  start: number | null;
  end: number | null;
}

export interface Alert {
  id: string;
  routes: string[];
  header: string;
  description: string;
  cause: string;
  effect: string;
  activePeriods: AlertActivePeriod[];
}

export interface TripStop extends Stop {
  walkMin: number;
}

export interface TripSuggestion {
  route: string;
  originStop: TripStop;
  destStop: TripStop;
  totalWalkMin: number;
  transferRequired: boolean;
  transferNote?: string;
}

export interface AccessibilityStop {
  id: string;
  name: string;
  wheelchairBoarding: string;
}

export interface AccessibilityInfo {
  route: string;
  wheelchairBoarding: string;
  stops: AccessibilityStop[];
}

export interface SubwayStation {
  name: string;
  lines: string[];
  lat: number;
  lon: number;
  distance: number;
}

export interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  direction: string | null;
  routeIds: string[];
}

export interface RoutePolylines {
  route: string;
  segments: [number, number][][];
}

export interface RoutePathStop {
  name: string;
  t: number;
  hub?: boolean;
  accessible?: boolean;
}

export interface RoutePath {
  dir: string;
  color: string;
  span: string;
  stops: RoutePathStop[];
  buses: number[];
}

// --- Mock-only domains (no real backend yet, see lib/data/adapters) ---

export interface ReliabilityEntry {
  route: string;
  pct: number;
  onTime: number;
  total: number;
  avgDelay: string;
  trend: number[];
}

export interface CrowdingRouteLevel {
  route: string;
  level: number;
  label: string;
  riders: string;
}

export interface CrowdingSegment {
  stop: string;
  level: number;
}

export interface CrowdingData {
  routes: CrowdingRouteLevel[];
  segments: CrowdingSegment[];
  /** Which route `segments` describes — the panel heading is dynamic now. */
  segmentRoute: string;
}

export interface CalendarData {
  month: string;
  weeks: (number | null)[][];
  today: number;
  events: Record<number, string>;
  legend: [string, string][];
  upcoming: { day: string; label: string; type: string }[];
}

export interface AppNotification {
  /** GTFS-RT alert entity id — string, since these come from the feed. */
  id: string;
  icon: IconName;
  color: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export interface SavedView {
  id: string;
  icon: IconName;
  name: string;
  routes: string[];
  meta: string;
}

// A trip the user actually planned. Only facts we have are stored: the old
// shape carried `group`/`time`/`dur`/`status` as frozen strings, which meant
// "Today" stayed "Today" forever and the on-time status was invented — the
// app never observes whether a ride happened. Grouping and clock time are
// derived from `at` at render; `walkMin` is what /api/trip actually returns.
export interface TripHistoryEntry {
  id: string;
  route: string;
  from: string;
  to: string;
  /** epoch ms when the trip was planned */
  at: number;
  walkMin: number;
}

export interface CommuteLeg {
  route: string;
  label: string;
  eta: number;
  note: string;
}

export interface Commute {
  from: string;
  to: string;
  walk: string;
  legs: CommuteLeg[];
}

export interface NearbyChip {
  route: string;
  eta: string;
  color: string;
}

export interface NearbyStop {
  id: string;
  name: string;
  dist: string;
  accessible: boolean;
  chips: NearbyChip[];
}

export interface ServiceChange {
  id: string;
  route: string;
  sev: "crit" | "warn" | "info" | "ok";
  tag: string;
  when: string;
  posted: string;
  title: string;
  body: string;
}
