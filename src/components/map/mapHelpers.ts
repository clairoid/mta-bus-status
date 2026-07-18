import type { Vehicle } from "../../lib/data/types";

export function escHtml(s: string | number | null | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Ported from legacy App.jsx: speed→color (unused when the feed omits speed,
// then we fall back to the route color) and the inline bus SVG marker.
export function busSpeedColor(speed: number | null | undefined, isDelayed: boolean): string | null {
  if (isDelayed) return "#ef4444";
  if (speed == null || speed <= 0) return null;
  if (speed < 5) return "#ef4444";
  if (speed < 15) return "#f59e0b";
  return "#22c55e";
}

export function busSvg(color: string, bearing = 0, showDelayRing = false, occupancy: string | null = null): string {
  const ring = showDelayRing
    ? `<circle cx="19" cy="19" r="17" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 2" opacity="0.8"/>`
    : "";
  const occBadge =
    occupancy === "full"
      ? `<circle cx="32" cy="6" r="5" fill="#ef4444"/><text x="32" y="8.5" text-anchor="middle" font-size="7" fill="white" font-weight="bold">F</text>`
      : occupancy === "standingAvailable" || occupancy === "standingRoomOnly"
        ? `<circle cx="32" cy="6" r="5" fill="#f59e0b"/><text x="32" y="8.5" text-anchor="middle" font-size="7" fill="white" font-weight="bold">S</text>`
        : "";
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38"><g transform="rotate(${bearing}, 19, 19)">${ring}<circle cx="19" cy="19" r="16" fill="${color}" opacity="0.25"/><circle cx="19" cy="19" r="12" fill="${color}"/><rect x="10" y="7" width="18" height="24" rx="5" fill="${color}" stroke="white" stroke-width="2"/><rect x="13" y="10" width="12" height="9" rx="2" fill="white" opacity="0.9"/><circle cx="14" cy="25" r="2" fill="white"/><circle cx="24" cy="25" r="2" fill="white"/><polygon points="19,3 17,7 21,7" fill="white" opacity="0.8"/></g>${occBadge}</svg>`
  )}`;
}

const PROGRESS_LABELS: Record<string, string> = {
  "in progress": "Moving",
  normalProgress: "Moving",
  delayed: "Delayed",
  "stopped at stop": "At Stop",
  "stopped before stop": "At Stop",
  noProgress: "Stopped",
  unknown: "",
};

// Self-contained dark popup card (inline styles so it needs no ported CSS).
export function busPopupHtml(v: Vehicle, color: string): string {
  const isDelayed = v.progressRate === "delayed";
  const status = PROGRESS_LABELS[v.progressRate ?? ""] ?? v.progressRate ?? "";
  const stops = v.onwardCalls ?? [];
  const stopsHtml =
    stops.length > 0
      ? `<div style="margin-top:8px;border-top:1px solid #2a2a3e;padding-top:8px;">${stops
          .slice(0, 5)
          .map(
            (s, i) =>
              `<div style="display:flex;gap:6px;font-size:11px;color:${i === 0 ? "#e8e8f0" : "#8888a0"};padding:2px 0;"><span style="min-width:14px;color:#6366f1;">${i + 1}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(s.name)}</span><span>${escHtml(s.distance ?? (s.stopsAway != null ? `${s.stopsAway} stops` : "—"))}</span></div>`
          )
          .join("")}</div>`
      : "";
  const row = (label: string, val: string) =>
    `<div style="display:flex;justify-content:space-between;gap:12px;font-size:12px;padding:2px 0;"><span style="color:#8888a0;">${label}</span><span style="color:#e8e8f0;">${val}</span></div>`;
  return `<div style="min-width:200px;font-family:Inter,sans-serif;">
    <div style="display:flex;align-items:center;gap:8px;background:${color};padding:8px 10px;border-radius:8px 8px 0 0;">
      <span style="font-weight:800;color:#fff;font-size:13px;">${escHtml(v.route)}</span>
      <span style="color:rgba(255,255,255,0.85);font-size:11px;font-family:monospace;">#${escHtml(v.id)}</span>
      ${isDelayed ? `<span style="margin-left:auto;background:rgba(0,0,0,0.25);color:#fff;font-size:9px;font-weight:800;padding:2px 6px;border-radius:5px;">DELAYED</span>` : ""}
    </div>
    <div style="background:#141420;padding:10px;border-radius:0 0 8px 8px;">
      ${row("Direction", escHtml(v.direction))}
      ${row("Destination", escHtml(v.destination) || "—")}
      ${status ? row("Status", escHtml(status)) : ""}
      ${stopsHtml}
    </div>
  </div>`;
}
