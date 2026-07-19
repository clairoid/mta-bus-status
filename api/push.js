import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { cors } from "./lib.js";

// One function, two jobs (Vercel Hobby caps functions at 12):
//   POST /api/push  → send a test push to a provided subscription
//   GET  /api/push  → cron scan: push newly-active alerts to tracked routes
const WINDOW_SEC = 26 * 60 * 60; // one day + slack (matches the daily cron)

function configureVapid() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT || "https://mta-bus-status.vercel.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return true;
}

async function sendTest(req, res) {
  if (!configureVapid()) return res.status(500).json({ error: "VAPID keys not configured" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { subscription, payload } = body;
    if (!subscription?.endpoint) return res.status(400).json({ error: "subscription required" });
    await webpush.sendNotification(subscription, JSON.stringify(payload || {}));
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.body || err.message });
  }
}

async function cronScan(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !configureVapid()) {
    return res.status(200).json({ skipped: "push not fully configured" });
  }
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  try {
    const { data: subs } = await db.from("push_subscriptions").select("endpoint, subscription, routes");
    if (!subs?.length) return res.status(200).json({ sent: 0, note: "no subscriptions" });

    const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mta-bus-status.vercel.app";
    const { alerts = [] } = await (await fetch(`${host}/api/alerts`)).json();
    const now = Math.floor(Date.now() / 1000);
    const fresh = alerts.filter((a) => a.activePeriods?.some((p) => p.start && now - p.start <= WINDOW_SEC && now >= p.start));

    let sent = 0;
    await Promise.all(
      subs.map(async (sub) => {
        const routeSet = new Set((sub.routes || []).map((r) => r.toUpperCase()));
        const match = fresh.find((a) => a.routes.some((r) => routeSet.has(r.toUpperCase())));
        if (!match) return;
        const route = match.routes.find((r) => routeSet.has(r.toUpperCase())) || match.routes[0];
        try {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify({ title: `${route} service alert`, body: match.header, url: "/alerts", tag: match.id })
          );
          sent++;
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      })
    );
    return res.status(200).json({ subscriptions: subs.length, fresh: fresh.length, sent });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export default async function handler(req, res) {
  cors(req, res);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "POST") return sendTest(req, res);
  return cronScan(req, res);
}
