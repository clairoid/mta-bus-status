import type { Alert } from "./types";

export type Severity = "crit" | "warn" | "info" | "ok";

// GTFS-RT effect enum -> short label + severity, per API_MAPPING (effect->severity).
const EFFECT_LABELS: Record<string, string> = {
  NO_SERVICE: "Suspended",
  REDUCED_SERVICE: "Reduced",
  SIGNIFICANT_DETOUR: "Detour",
  DETOUR: "Detour",
  MODIFIED_SERVICE: "Modified",
  DELAY: "Delays",
  STOP_CLOSED: "Stop Closed",
  STOP_MOVED: "Stop Moved",
};

export function effectLabel(effect: string): string {
  return EFFECT_LABELS[effect] || effect.replace(/_/g, " ").replace(/UNKNOWN.*/, "Alert") || "Alert";
}

export function effectSeverity(effect: string): Severity {
  if (effect === "NO_SERVICE") return "crit";
  if (effect === "DELAY" || effect === "REDUCED_SERVICE") return "warn";
  if (effect.includes("DETOUR") || effect === "MODIFIED_SERVICE" || effect.startsWith("STOP_")) return "info";
  return "info";
}

const SEVERITY_COLORS: Record<Severity, { fill: string; text: string }> = {
  crit: { fill: "rgba(239,68,68,0.14)", text: "#ef4444" },
  warn: { fill: "rgba(234,179,8,0.16)", text: "var(--yellow)" },
  info: { fill: "rgba(99,102,241,0.14)", text: "var(--accent)" },
  ok: { fill: "rgba(34,197,94,0.14)", text: "#22c55e" },
};

export function severityColors(sev: Severity) {
  return SEVERITY_COLORS[sev];
}

// Prefer the GTFS cause for the cause-filter chips (README Alerts page).
const CAUSE_LABELS: Record<string, string> = {
  CONSTRUCTION: "Construction",
  MAINTENANCE: "Construction",
  ACCIDENT: "Accident",
  WEATHER: "Weather",
};

export function causeLabel(cause: string): string {
  return CAUSE_LABELS[cause] || "Other";
}

export function primaryRoute(alert: Alert): string {
  return alert.routes[0] ?? "";
}
