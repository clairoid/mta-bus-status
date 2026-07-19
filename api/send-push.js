import webpush from "web-push";
import { cors } from "./lib.js";

// Sends a single Web Push message to a provided subscription. Used by the
// "Send test notification" button (client passes its own subscription) and
// reusable by any server-side trigger.
export default async function handler(req, res) {
  cors(req, res);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: "VAPID keys not configured" });
  }
  webpush.setVapidDetails(
    VAPID_SUBJECT || "https://mta-bus-status.vercel.app",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

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
