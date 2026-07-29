import { cors } from "./_lib.js";

// GET /api/health → cheap liveness + configuration check. Reports whether each
// integration has its credentials present, without ever echoing a value. Useful
// as an uptime-monitor target: `configured: false` is the signal that a missing
// env var has silently disabled push (which is exactly how the push feature
// could break without anyone noticing).
export default async function handler(req, res) {
  cors(req, res);
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();

  const mta = !!process.env.MTA_BUSTIME_KEY;
  const push = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
  const db = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const cron = !!process.env.CRON_SECRET;

  const configured = mta && push && db && cron;
  return res.status(configured ? 200 : 503).json({
    status: configured ? "ok" : "degraded",
    configured,
    services: { mta, push, db, cron },
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    time: new Date().toISOString(),
  });
}
