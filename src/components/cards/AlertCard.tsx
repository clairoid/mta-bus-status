import { RouteBadge } from "../ui/RouteBadge";
import { cleanText, effectLabel, effectSeverity, severityColors } from "../../lib/data/alertFormat";
import type { Alert } from "../../lib/data/types";

interface AlertCardProps {
  alert: Alert;
  expanded: boolean;
  onToggle: () => void;
}

// README Service Alerts: severity tag, route, title, body; expands on click.
export function AlertCard({ alert, expanded, onToggle }: AlertCardProps) {
  const sev = effectSeverity(alert.effect);
  const colors = severityColors(sev);
  const route = alert.routes[0] ?? "";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full self-start rounded-card border border-border bg-card p-[18px] text-left"
    >
      <div className="mb-2.5 flex items-center gap-1.5">
        {route && <RouteBadge routeId={route} size="sm" />}
        {alert.routes.length > 1 && (
          <span className="text-[10px] font-semibold text-dim">+{alert.routes.length - 1}</span>
        )}
        <span
          className="rounded-[6px] px-2 py-0.5 text-[10px] font-extrabold uppercase"
          style={{ backgroundColor: colors.fill, color: colors.text }}
        >
          {effectLabel(alert.effect)}
        </span>
        <span className="ml-auto text-dim">{expanded ? "⌃" : "⌄"}</span>
      </div>
      <div className="text-[15px] font-semibold leading-snug text-text">{cleanText(alert.header)}</div>
      {alert.description && (
        <div
          className="mt-2 overflow-hidden text-[13px] leading-relaxed text-dim transition-all"
          style={{ maxHeight: expanded ? 400 : 42 }}
        >
          {cleanText(alert.description)}
        </div>
      )}
    </button>
  );
}
