import type { AppNotification } from "../types";
import { NOTIFICATIONS } from "../mock/mta";

export interface NotificationsSource {
  getNotifications(): Promise<AppNotification[]>;
}

// Read/unread state lives in the app store's `readNotifs` set, not here —
// this adapter only supplies the notification list itself.
export const mockNotificationsSource: NotificationsSource = {
  getNotifications: async () => NOTIFICATIONS,
};

// Swap in later: app backend (push subscriptions) + Alerts for tracked routes.
