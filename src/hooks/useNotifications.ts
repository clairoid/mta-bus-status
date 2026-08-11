import { useMemo } from "react";
import { useAlerts } from "./useAlerts";
import { useAppStore } from "../store/useAppStore";
import { buildNotifications } from "../lib/data/notifications";
import { useTick } from "./tick-context";
import type { AppNotification } from "../lib/data/types";

// Real notifications: live service alerts for the lines the user follows.
// Read/unread state lives in the app store's readNotifs set, applied by the
// consumer. Costs no extra endpoint — /api/alerts is already polled.
export function useNotifications(): { notifications: AppNotification[]; loading: boolean } {
  const { alerts, loading } = useAlerts();
  const myRoutes = useAppStore((s) => s.myRoutes);
  // Re-derive once a minute off the shared tick so the relative "8m" labels
  // stay honest, without each row running its own timer.
  const minute = Math.floor(useTick() / 60);

  const notifications = useMemo(
    () => buildNotifications(alerts, myRoutes),
    // `minute` is deliberately a dependency: it's what refreshes the relative
    // timestamps. It isn't read inside the callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [alerts, myRoutes, minute]
  );

  return { notifications, loading };
}
