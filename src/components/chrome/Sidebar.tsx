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
        iconOnly ? "w-[78px] items-center" : "w-[230px]"
      }`}
    >
      <div className={`flex items-center gap-2 px-4 py-5 ${iconOnly ? "px-0" : ""}`}>
        <span className="flex h-7 w-7 items-center justify-center rounded-control bg-accent text-xs font-extrabold text-white">
          M
        </span>
        {!iconOnly && <span className="text-sm font-bold text-text">Bus Status</span>}
      </div>

      <nav
        data-scroll
        className={`no-scrollbar flex-1 space-y-0.5 overflow-y-auto ${iconOnly ? "px-2.5" : "px-2"}`}
      >
        {NAV_ENTRIES.map((entry) => (
          <NavItem
            key={entry.id}
            entry={entry}
            iconOnly={iconOnly}
            badge={entry.id === "notifications" ? unreadCount : undefined}
          />
        ))}
      </nav>

      <div className={`space-y-1 border-t border-border py-3 ${iconOnly ? "px-2.5" : "px-2"}`}>
        <NavItem entry={SETTINGS_ENTRY} iconOnly={iconOnly} />
        <div className={`flex items-center gap-2 pt-1 ${iconOnly ? "justify-center" : "px-1"}`}>
          <IconButton
            icon={theme === "dark" ? "moon" : "sun"}
            label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            onClick={toggleTheme}
          />
        </div>
      </div>
    </aside>
  );
}
