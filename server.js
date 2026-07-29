// Local/express server: a thin wrapper around the same serverless handlers
// Vercel runs, so dev and prod share one implementation.
import "./env.js";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import alerts from "./api/alerts.js";
import arrivals from "./api/arrivals.js";
import arrivalsForStop from "./api/arrivals/[stopId].js";
import vehicles from "./api/vehicles.js";
import trip from "./api/trip.js";
import stopsForRoute from "./api/stops/[route].js";
import polylinesForRoute from "./api/polylines/[route].js";
import routesCatalog from "./api/routes.js";
import health from "./api/health.js";
import push from "./api/push.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json({ limit: "64kb" }));

// The handlers are written for Vercel: route params arrive via req.query.
// Merge express params into query and pass a minimal req shim through.
const wrap = (handler) => (req, res) =>
  Promise.resolve(
    handler({ query: { ...req.query, ...req.params }, headers: req.headers, method: req.method, body: req.body }, res)
  ).catch((err) => {
    console.error(`${req.path} failed:`, err);
    if (!res.headersSent) res.status(500).json({ error: "Internal error" });
  });

app.get("/api/health", wrap(health));
app.get("/api/alerts", wrap(alerts));
app.get("/api/arrivals", wrap(arrivals));
app.get("/api/arrivals/:stopId", wrap(arrivalsForStop));
app.get("/api/vehicles", wrap(vehicles));
app.get("/api/trip", wrap(trip));
app.get("/api/stops/:route", wrap(stopsForRoute));
app.get("/api/polylines/:route", wrap(polylinesForRoute));
app.get("/api/routes", wrap(routesCatalog));
// Push was previously Vercel-only, so its auth path couldn't be exercised locally.
app.all("/api/push", wrap(push));

// --- Serve static build ---
app.use(express.static(join(__dirname, "dist")));
app.get("/{*splat}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Bus status server running on http://localhost:${PORT}`);
});
