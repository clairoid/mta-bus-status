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
// Which routes this device wants alerts for. `routeAlerts` (Settings → Route
// alerts) is the single source of truth; `pushAlerts` is the master switch.
// Previously this read `tracked` (set by a different control on the Routes
// page), so the Settings toggles the user actually saw had no effect at all.
function alertRoutesFrom(routeAlerts: Record<string, boolean>, enabled: boolean): string[] {
  if (!enabled) return [];
  return Object.keys(routeAlerts).filter((r) => routeAlerts[r]).sort();
}

export function usePushNotifications(): PushState {
  const { user } = useAuth();
  const routeAlerts = useAppStore((s) => s.routeAlerts);
  const pushAlerts = useAppStore((s) => s.pushAlerts);
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
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          endpoint: json.endpoint!,
          user_id: user.id,
          subscription: json,
          routes: alertRoutesFrom(routeAlerts, pushAlerts),
        },
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
  }, [supported, user, routeAlerts, pushAlerts]);

  // Keep the server-side route filter in step with the user's choices. Without
  // this the subscription kept whatever routes were selected at subscribe time,
  // so later changes in Settings silently never took effect.
  useEffect(() => {
    if (!supabase || !user || !subscribed) return;
    const routes = alertRoutesFrom(routeAlerts, pushAlerts);
    let cancelled = false;
    const id = setTimeout(async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (cancelled || !sub) return;
      await supabase!.from("push_subscriptions").update({ routes }).eq("endpoint", sub.endpoint);
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [user, subscribed, routeAlerts, pushAlerts]);

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

  // The server resolves the subscription from the DB using this token and uses
  // a fixed payload — neither is sent from here any more. Previously both were
  // caller-supplied, which made /api/push an open relay.
  const sendTest = useCallback(async () => {
    if (!supported) return { error: "Push isn't supported here." };
    if (!supabase) return { error: "Push is not configured." };
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return { error: "Sign in to send a test notification." };

    const res = await fetch("/api/push", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { error: body?.error ?? `Send failed (${res.status})` };
    }
    return { error: null };
  }, [supported]);

  return { supported, permission, subscribed, busy, enable, disable, sendTest };
}
