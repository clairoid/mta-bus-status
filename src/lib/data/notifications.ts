import type { Alert, AppNotification } from "./types";
import { cleanText, effectLabel, effectSeverity, severityAccent } from "./alertFormat";
import type { IconName } from "../../components/ui/Icon";

// Notifications derived from the live GTFS-RT alert feed, scoped to the lines
// the user follows. No endpoint and no storage: /api/alerts is already fetched
// and CDN-cached, and read state lives in the store's `readNotifs`.

const EFFECT_ICONS: Record<string, IconName> = {
  NO_SERVICE: "alert",
  REDUCED_SERVICE: "alert",
  DELAY: "clock",
  DETOUR: "route",
  SIGNIFICANT_DETOUR: "route",
  MODIFIED_SERVICE: "megaphone",
  STOP_CLOSED: "pin",
  STOP_MOVED: "pin",
};

export function alertIcon(effect: string): IconName {
  return EFFECT_ICONS[effect] ?? "bell";
}

/** "now", "8m", "3h", "2d" — how long the alert has been in effect. */
export function relativeTime(startSecs: number | null, nowMs = Date.now()): string {
  if (!startSecs) return "active";
  const mins = Math.floor((nowMs - startSecs * 1000) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/**
 * Newest first, one notification per alert affecting a followed route.
 * `routes` is the user's followed lines; an empty list yields nothing rather
 * than every alert in the city.
 */
export function buildNotifications(
  alerts: Alert[],
  routes: string[],
  nowMs = Date.now()
): AppNotification[] {
  if (routes.length === 0) return [];
  const followed = new Set(routes.map((r) => r.toUpperCase()));

  return alerts
    .filter((a) => a.routes.some((r) => followed.has(r.toUpperCase())))
    .map((a) => {
      const route = a.routes.find((r) => followed.has(r.toUpperCase())) ?? a.routes[0] ?? "";
      const severity = effectSeverity(a.effect);
      const start = a.activePeriods[0]?.start ?? null;
      return {
        id: a.id,
        icon: alertIcon(a.effect),
        color: severityAccent(severity),
        title: `${route} · ${effectLabel(a.effect)}`,
        body: cleanText(a.header),
        time: relativeTime(start, nowMs),
        unread: true,
        startedAt: start,
      };
    })
    .sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))
    .map(({ startedAt: _startedAt, ...n }) => n);
}
