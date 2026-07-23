import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet } from "../overlays/Sheet";
import { Icon } from "../ui/Icon";
import { Overline } from "../ui/Overline";
import { MORE_GROUPS, SETTINGS_ENTRY, type NavEntry } from "../../lib/nav";
import { useTheme } from "../../lib/theme/theme-context";
import { useNotifications } from "../../hooks/useNotifications";
import { useAppStore } from "../../store/useAppStore";

// The mobile counterpart to the desktop sidebar. Before this, MOBILE_TABS was
// the only navigation below 560px, which stranded 15 of the 20 screens —
// Settings included, so a phone user couldn't even change theme or enable push.
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useNotifications();
  const readNotifs = useAppStore((s) => s.readNotifs);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread && !readNotifs[String(n.id)]).length,
    [notifications, readNotifs]
  );

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const badgeFor = (entry: NavEntry) =>
    entry.id === "notifications" && unreadCount > 0 ? unreadCount : undefined;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="All screens"
      mobileHeight="full"
      desktop="drawer"
    >
      <div className="px-4 pt-4 pb-6">
        {MORE_GROUPS.map((group) => (
          <section key={group.title} className="mb-5">
            <Overline>{group.title}</Overline>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {group.entries.map((entry) => {
                const badge = badgeFor(entry);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => go(entry.path)}
                    className="relative flex min-h-[64px] flex-col items-start gap-2 rounded-card border border-border bg-shell p-3 text-left transition-colors active:bg-chip"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-control bg-accent-soft text-accent">
                      <Icon name={entry.icon} size={17} />
                    </span>
                    <span className="text-[13px] font-semibold text-text">{entry.label}</span>
                    {badge && (
                      <span className="absolute top-2.5 right-2.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red px-1.5 text-[10px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="overflow-hidden rounded-card border border-border">
          <button
            type="button"
            onClick={() => go(SETTINGS_ENTRY.path)}
            className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-chip"
          >
            <Icon name={SETTINGS_ENTRY.icon} size={18} className="shrink-0 text-text2" />
            <span className="flex-1 text-sm font-semibold text-text">{SETTINGS_ENTRY.label}</span>
            <Icon name="chevronRight" size={16} className="shrink-0 text-dim" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex min-h-12 w-full items-center gap-3 border-t border-border px-4 py-3 text-left transition-colors active:bg-chip"
          >
            <Icon name={theme === "dark" ? "moon" : "sun"} size={18} className="shrink-0 text-text2" />
            <span className="flex-1 text-sm font-semibold text-text">
              {theme === "dark" ? "Dark" : "Light"} appearance
            </span>
            <span className="text-xs font-semibold text-dim">Tap to switch</span>
          </button>
        </div>
      </div>
    </Sheet>
  );
}
