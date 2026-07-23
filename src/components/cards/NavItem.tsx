import { NavLink } from "react-router-dom";
import type { NavEntry } from "../../lib/nav";
import { Icon } from "../ui/Icon";

interface NavItemProps {
  entry: NavEntry;
  badge?: number;
  iconOnly?: boolean;
  onNavigate?: () => void;
}

// The rail is ~76px wide, so drop the qualifier the icon already conveys
// ("Live Arrivals" → "Arrivals") rather than truncating mid-word.
const RAIL_LABELS: Record<string, string> = {
  arrivals: "Arrivals",
  alerts: "Alerts",
  "saved-views": "Saved",
  "trip-planner": "Trip",
  departures: "Board",
  calendar: "Calendar",
  reliability: "Stats",
  vehicles: "Vehicles",
  changes: "Changes",
  "route-map": "Route map",
  accessibility: "Access",
  history: "History",
  crowding: "Crowding",
};

export function NavItem({ entry, badge, iconOnly, onNavigate }: NavItemProps) {
  return (
    <NavLink
      to={entry.path}
      end={entry.path === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex rounded-control font-medium transition-colors ${
          iconOnly
            ? "min-h-14 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] leading-tight"
            : "min-h-11 items-center gap-3 px-3 py-2.5 text-sm"
        } ${isActive ? "bg-accent-soft text-accent" : "text-text2 hover:bg-chip active:bg-chip"}`
      }
      title={entry.label}
    >
      <Icon name={entry.icon} size={19} className="shrink-0" />
      {/* The rail used to be nineteen unlabelled glyphs — and `title` never
          fires on touch, so an iPad user had no way to tell Live Arrivals
          from Trip History. Small labels beat a tooltip nobody can trigger. */}
      <span className={iconOnly ? "w-full truncate text-center" : "flex-1 truncate"}>
        {iconOnly ? (RAIL_LABELS[entry.id] ?? entry.label) : entry.label}
      </span>
      {!iconOnly && entry.shortcut && (
        <span className="rounded bg-chip px-1.5 py-0.5 text-[10px] font-semibold text-chip-text">
          {entry.shortcut}
        </span>
      )}
      {!!badge && (
        <span
          className={`rounded-full bg-red text-[10px] font-bold text-white ${
            iconOnly
              ? "absolute top-1 right-1.5 flex h-4 min-w-4 items-center justify-center px-1"
              : "px-1.5 py-0.5"
          }`}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}
