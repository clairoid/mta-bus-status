import { useMemo } from "react";
import { NAV_ENTRIES, SETTINGS_ENTRY } from "../../lib/nav";
import { NavItem } from "../cards/NavItem";
import { IconButton } from "../ui/IconButton";
import { useTheme } from "../../lib/theme/theme-context";
import { useNotifications } from "../../hooks/useNotifications";
import { useAppStore } from "../../store/useAppStore";

interface SidebarProps {
  iconOnly: boolean;
}

export function Sidebar({ iconOnly }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useNotifications();
  const readNotifs = useAppStore((s) => s.readNotifs);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread && !readNotifs[String(n.id)]).length,
    [notifications, readNotifs]
  );

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-border bg-sidebar ${
        iconOnly ? "w-[66px] items-center" : "w-[230px]"
      }`}
    >
      <div className={`flex items-center gap-2 px-4 py-5 ${iconOnly ? "px-0" : ""}`}>
        <span className="flex h-7 w-7 items-center justify-center rounded-control bg-accent text-xs font-extrabold text-white">
          M
        </span>
        {!iconOnly && <span className="text-sm font-bold text-text">Bus Status</span>}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 [scrollbar-width:none]">
        {NAV_ENTRIES.map((entry) => (
          <NavItem
            key={entry.id}
            entry={entry}
            iconOnly={iconOnly}
            badge={entry.id === "notifications" ? unreadCount : undefined}
          />
        ))}
      </nav>

      <div className="space-y-1 border-t border-border px-2 py-3">
        <NavItem entry={SETTINGS_ENTRY} iconOnly={iconOnly} />
        <div className={`flex items-center gap-2 px-1 pt-1 ${iconOnly ? "justify-center" : ""}`}>
          <IconButton
            icon={theme === "dark" ? "🌙" : "☀️"}
            label="Toggle theme"
            onClick={toggleTheme}
          />
        </div>
      </div>
    </aside>
  );
}
