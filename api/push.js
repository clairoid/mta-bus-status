import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { cors, fail } from "./_lib.js";

// One function, two jobs (Vercel Hobby caps functions at 12):
//   POST /api/push  → send a test push to the *caller's own* subscription
//   GET  /api/push  → scan: push not-yet-seen active alerts to tracked routes
// Dedup is per-device via push_subscriptions.notified_ids, so this is safe to
// run on any cadence (a frequent external scheduler won't re-notify).
const MAX_PER_RUN = 5; // guard against a feed glitch fanning out many alerts

// Fixed, server-controlled test payload. Previously the caller supplied both
// the subscription and the payload, which made this an open relay: anyone
// could have this server sign arbitrary notification content with our VAPID
// key and POST it to an arbitrary URL (an SSRF primitive too). Neither is
// caller-controlled any more.
const TEST_PAYLOAD = {
  title: "MTA Bus Status",
  body: "Test notification — push is working.",
  url: "/alerts",
  tag: "push-test",
};

// Which alerts should this device be notified about, and what the new
// notified-id set becomes. Extracted from the scan loop so the dedup rules —
// the subtlest logic in the codebase — are unit-testable.
//
// Rules: notify only currently-active alerts on the device's routes that it
// hasn't already seen (capped per run); the new notified set is the
// still-active alerts we already knew about plus the ones just delivered, so
// expired alerts drop out and can re-notify if they return.
export function selectFreshAlerts(alerts, routes, notifiedIds, max = MAX_PER_RUN) {
  const routeSet = new Set((routes || []).map((r) => String(r).toUpperCase()));
  const known = new Set(notifiedIds || []);
  const matching = (alerts || []).filter((a) =>
    (a.routes || []).some((r) => routeSet.has(String(r).toUpperCase()))
  );
  return {
    matching,
    fresh: matching.filter((a) => !known.has(a.id)).slice(0, max),
    known,
  };
}

export function nextNotifiedIds(matching, known, deliveredIds) {
  return matching.filter((a) => known.has(a.id) || deliveredIds.has(a.id)).map((a) => a.id);
}

export function notifiedIdsChanged(next, prev, known) {
  return next.length !== (prev || []).length || next.some((id) => !known.has(id));
}

function configureVapid() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT || "https://mta-bus-status.vercel.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return true;
}

function serviceClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

// Resolve the bearer token to a Supabase user, or null. Supabase validates the
// signature and expiry, so a forged token can't get through.
async function authenticate(db, req) {
  const header = req.headers?.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

async function sendTest(req, res) {
  if (!configureVapid()) return fail(res, 500, "Push is not configured");
  const db = serviceClient();
  if (!db) return fail(res, 500, "Push is not configured");

  const user = await authenticate(db, req);
  if (!user) return fail(res, 401, "Sign in to send a test notification");

  // Only ever send to a subscription this user actually owns. Nothing from the
  // request body is trusted.
  const { data: subs, error } = await db
    .from("push_subscriptions")
    .select("endpoint, subscription")
    .eq("user_id", user.id);
  if (error) {
    console.error("[push] subscription lookup failed:", error.message);
    return fail(res, 500, "Could not load your subscriptions");
  }
  if (!subs?.length) return fail(res, 404, "No push subscription registered for this account");

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub.subscription, JSON.stringify(TEST_PAYLOAD));
      sent++;
    } catch (err) {
      // Prune subscriptions the push service has retired.
      if (err.statusCode === 404 || err.statusCode === 410) {
        await db.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      } else {
        console.error("[push] test send failed:", err.statusCode || err.message);
      }
    }
  }
  if (sent === 0) return fail(res, 502, "Push service rejected the notification");
  return res.status(200).json({ ok: true, sent });
}

async function cronScan(req, res) {
  const secret = process.env.CRON_SECRET;
  // Fail closed. The previous `if (secret && ...)` meant that removing or
  // renaming CRON_SECRET would silently turn this into a public trigger for a
  // push fan-out to every subscriber.
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return fail(res, 401, "unauthorized");
  }
  const db = serviceClient();
  if (!db || !configureVapid()) {
    return res.status(200).json({ skipped: "push not fully configured" });
  }
  try {
    const { data: subs, error: subsErr } = await db
      .from("push_subscriptions")
      .select("endpoint, subscription, routes, notified_ids");
    if (subsErr) {
      console.error("[push] subscription query failed:", subsErr.message);
      return fail(res, 500, "Could not load subscriptions");
    }
    if (!subs?.length) return res.status(200).json({ sent: 0, note: "no subscriptions" });

    const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mta-bus-status.vercel.app";
    const { alerts = [] } = await (await fetch(`${host}/api/alerts`)).json();

    let sent = 0;
    await Promise.all(
      subs.map(async (sub) => {
        const routeSet = new Set((sub.routes || []).map((r) => r.toUpperCase()));
        const { matching, fresh, known } = selectFreshAlerts(alerts, sub.routes, sub.notified_ids);

        const deliveredIds = new Set();
        for (const alert of fresh) {
          const route = alert.routes.find((r) => routeSet.has(r.toUpperCase())) || alert.routes[0];
          try {
            await webpush.sendNotification(
              sub.subscription,
              JSON.stringify({ title: `${route} service alert`, body: alert.header, url: "/alerts", tag: alert.id })
            );
            deliveredIds.add(alert.id);
            sent++;
          } catch (err) {
            if (err.statusCode === 404 || err.statusCode === 410) {
              await db.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
              return; // subscription gone; nothing more to record
            }
            // transient failure → leave unrecorded so it retries next run
            console.error("[push] send failed:", err.statusCode || err.message);
          }
        }

        const next = nextNotifiedIds(matching, known, deliveredIds);
        if (notifiedIdsChanged(next, sub.notified_ids, known)) {
          await db.from("push_subscriptions").update({ notified_ids: next }).eq("endpoint", sub.endpoint);
        }
      })
    );
    return res.status(200).json({ subscriptions: subs.length, sent });
  } catch (err) {
    console.error("[push] scan failed:", err);
    return fail(res, 500, "Push scan failed");
  }
}

export default async function handler(req, res) {
  cors(req, res);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "POST") return sendTest(req, res);
  if (req.method === "GET") return cronScan(req, res);
  return fail(res, 405, "Method not allowed");
}
