import { RouteBadge } from "../ui/RouteBadge";
import {
  activePeriodLabel,
  cleanText,
  effectLabel,
  effectSeverity,
  severityAccent,
  severityColors,
} from "../../lib/data/alertFormat";
import type { Alert } from "../../lib/data/types";

// README Service Changes: severity left-border, route badge, tag, timing,
// title, body. Powered by the same real /api/alerts feed as Service Alerts.
export function ServiceChangeCard({ change }: { change: Alert }) {
  const sev = effectSeverity(change.effect);
  const accent = severityAccent(sev);
  const colors = severityColors(sev);
  const route = change.routes[0] ?? "";

  return (
    <div
      className="rounded-[12px] border border-border bg-card px-[18px] py-4"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2.5">
        {route && <RouteBadge routeId={route} />}
        <span
          className="rounded-pill px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide"
          style={{ backgroundColor: colors.fill, color: colors.text }}
        >
          {effectLabel(change.effect)}
        </span>
        <span className="text-xs font-bold text-text2">{activePeriodLabel(change)}</span>
      </div>
      <div className="mb-1 text-[15px] font-bold text-text">{cleanText(change.header)}</div>
      {change.description && (
        <div className="text-[13px] leading-relaxed text-dim">{cleanText(change.description)}</div>
      )}
    </div>
  );
}
