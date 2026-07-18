import { NavLink } from "react-router-dom";
import type { NavEntry } from "../../lib/nav";

interface NavItemProps {
  entry: NavEntry;
  badge?: number;
  iconOnly?: boolean;
}

export function NavItem({ entry, badge, iconOnly }: NavItemProps) {
  return (
    <NavLink
      to={entry.path}
      end={entry.path === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? "bg-accent-soft text-accent" : "text-text2 hover:bg-chip"
        }`
      }
      title={iconOnly ? entry.label : undefined}
    >
      <span className="text-base leading-none">{entry.icon}</span>
      {!iconOnly && <span className="flex-1 truncate">{entry.label}</span>}
      {!iconOnly && entry.shortcut && (
        <span className="rounded bg-chip px-1.5 py-0.5 text-[10px] font-semibold text-chip-text">
          {entry.shortcut}
        </span>
      )}
      {!!badge && (
        <span className="rounded-full bg-red px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
