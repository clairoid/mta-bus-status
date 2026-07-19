import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { useAuth } from "../lib/supabase/auth-context";
import { useAppStore } from "../store/useAppStore";

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export interface PushState {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  busy: boolean;
  enable: () => Promise<{ error: string | null }>;
  disable: () => Promise<void>;
  sendTest: () => Promise<{ error: string | null }>;
}

// Web push: request permission, subscribe via PushManager with the VAPID key,
// persist the subscription (+ tracked routes) to Supabase for server sends.
// Requires a signed-in user (RLS keys subscriptions to the account).
export function usePushNotifications(): PushState {
  const { user } = useAuth();
  const tracked = useAppStore((s) => s.tracked);
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    !!VAPID_PUBLIC;

  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : "denied"
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, [supported]);

  const enable = useCallback(async () => {
    if (!supported) return { error: "Push isn't supported on this device/browser." };
    if (!supabase || !user) return { error: "Sign in to enable push notifications." };
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return { error: "Notification permission was not granted." };

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!),
        });
      }
      const json = sub.toJSON();
      const routes = Object.keys(tracked).filter((r) => tracked[r]);
      const { error } = await supabase.from("push_subscriptions").upsert(
        { endpoint: json.endpoint!, user_id: user.id, subscription: json, routes },
        { onConflict: "endpoint" }
      );
      if (error) return { error: error.message };
      setSubscribed(true);
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Failed to enable push." };
    } finally {
      setBusy(false);
    }
  }, [supported, user, tracked]);

  const disable = useCallback(async () => {
    if (!supported) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        if (supabase && user) await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, [supported, user]);

  const sendTest = useCallback(async () => {
    if (!supported) return { error: "Push isn't supported here." };
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return { error: "Enable notifications first." };
    const res = await fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        payload: { title: "MTA Bus Status", body: "Test notification — push is working ✅", url: "/alerts" },
      }),
    });
    if (!res.ok) return { error: `Send failed (${res.status})` };
    return { error: null };
  }, [supported]);

  return { supported, permission, subscribed, busy, enable, disable, sendTest };
}
