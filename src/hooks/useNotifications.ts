import { useEffect, useState } from "react";
import { dataSources } from "../lib/data/adapters";
import type { AppNotification } from "../lib/data/types";

// Mock-backed for now (dataSources.notifications); read/unread state lives
// in the app store's readNotifs set, applied by the consumer.
export function useNotifications(): { notifications: AppNotification[]; loading: boolean } {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dataSources.notifications.getNotifications().then((n) => {
      if (!active) return;
      setNotifications(n);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { notifications, loading };
}
