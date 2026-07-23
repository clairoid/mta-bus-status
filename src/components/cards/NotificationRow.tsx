import type { AppNotification } from "../../lib/data/types";
import { Icon } from "../ui/Icon";

interface NotificationRowProps {
  notification: AppNotification;
  read: boolean;
  onRead: () => void;
}

// README Notifications: icon, title, body, time, unread dot; per-item mark-read.
export function NotificationRow({ notification, read, onRead }: NotificationRowProps) {
  return (
    <button
      type="button"
      onClick={onRead}
      className={`flex w-full items-start gap-3 rounded-card border border-border p-4 text-left transition-colors active:bg-chip ${
        read ? "bg-card" : "bg-accent-soft"
      }`}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${notification.color}22`, color: notification.color }}
      >
        <Icon name={notification.icon} size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-bold text-text">{notification.title}</span>
          {!read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
          <span className="ml-auto shrink-0 text-[11px] text-dim">{notification.time}</span>
        </div>
        <div className="mt-0.5 text-xs text-dim">{notification.body}</div>
      </div>
    </button>
  );
}
