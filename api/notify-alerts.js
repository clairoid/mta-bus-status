import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Scheduled (Vercel Cron): find newly-active service alerts on the routes each
// push subscription tracks and send a Web Push. Stateless de-dup: only alerts
// whose active period STARTED within the last window are pushed. No-ops
// cleanly until the service role key + VAPID keys are configured.
const WINDOW_SEC = 75 * 60; // slightly over the hourly cron cadence

export default async function handler(req, res) {
  // Optional shared-secret guard (Vercel Cron sends this header when set).
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(200).json({ skipped: "push not fully configured" });
  }
  webpush.setVapidDetails(VAPID_SUBJECT || "https://mta-bus-status.vercel.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const { data: subs } = await db.from("push_subscriptions").select("endpoint, subscription, routes");
    if (!subs?.length) return res.status(200).json({ sent: 0, note: "no subscriptions" });

    const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mta-bus-status.vercel.app";
    const alertsRes = await fetch(`${host}/api/alerts`);
    const { alerts = [] } = await alertsRes.json();
    const now = Math.floor(Date.now() / 1000);

    const isNew = (a) =>
      a.activePeriods?.some((p) => p.start && now - p.start <= WINDOW_SEC && now >= p.start) ?? false;
    const freshAlerts = alerts.filter(isNew);

    let sent = 0;
    await Promise.all(
      subs.map(async (sub) => {
        const routeSet = new Set((sub.routes || []).map((r) => r.toUpperCase()));
        const match = freshAlerts.find((a) => a.routes.some((r) => routeSet.has(r.toUpperCase())));
        if (!match) return;
        const route = match.routes.find((r) => routeSet.has(r.toUpperCase())) || match.routes[0];
        try {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify({ title: `${route} service alert`, body: match.header, url: "/alerts", tag: match.id })
          );
          sent++;
        } catch (err) {
          // Prune expired/invalid subscriptions.
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      })
    );

    return res.status(200).json({ subscriptions: subs.length, freshAlerts: freshAlerts.length, sent });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
