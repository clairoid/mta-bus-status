import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread && !readNotifs[String(n.id)]).length,
    [notifications, readNotifs]
  );

  // The nav scrolls once it outgrows the viewport — at 768px tall that's 7 of
  // 19 screens below the fold. Two problems followed from that: the active item
  // could sit off-screen (so nothing looked selected), and with the scrollbar
  // hidden the list looked complete. Scroll the active item into view, and fade
  // the bottom edge while there's more to reach.
  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  const measure = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setOverflowing(el.scrollHeight - el.clientHeight - el.scrollTop > 8);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, iconOnly]);

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
        ref={navRef}
        data-scroll
        data-overflow={overflowing}
        onScroll={measure}
        aria-label="Screens"
        className={`no-scrollbar scroll-fade-y flex-1 space-y-0.5 overflow-y-auto ${
          iconOnly ? "px-2.5" : "px-2"
        }`}
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
