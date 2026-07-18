import { useMemo } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { NotificationRow } from "../components/cards/NotificationRow";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useNotifications } from "../hooks/useNotifications";
import { useAppStore } from "../store/useAppStore";
import { useToast } from "../components/overlays/toast-context";

// README Notifications: inbox with unread highlight, per-item mark-read,
// "Mark all read" (toast). Local read state via the store's readNotifs.
export function Notifications() {
  const { notifications, loading } = useNotifications();
  const readNotifs = useAppStore((s) => s.readNotifs);
  const markNotifRead = useAppStore((s) => s.markNotifRead);
  const markAllNotifsRead = useAppStore((s) => s.markAllNotifsRead);
  const { showToast } = useToast();

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread && !readNotifs[String(n.id)]).length,
    [notifications, readNotifs]
  );

  const markAll = () => {
    markAllNotifsRead(notifications.map((n) => String(n.id)));
    showToast("All notifications marked read", "✓");
  };

  return (
    <PageShell title="Notifications">
      <div className="mx-auto max-w-[640px]">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-dim">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="rounded-control border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text2 hover:bg-chip"
            >
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications"
            subtitle="Arrival and service alerts for your tracked routes will show up here."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {notifications.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                read={!n.unread || !!readNotifs[String(n.id)]}
                onRead={() => markNotifRead(String(n.id))}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
