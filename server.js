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
import vehiclePositions from "./api/vehicle-positions.js";
import trip from "./api/trip.js";
import subwayStations from "./api/subway-stations.js";
import accessibility from "./api/accessibility.js";
import stopsForRoute from "./api/stops/[route].js";
import polylinesForRoute from "./api/polylines/[route].js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3005;

// The handlers are written for Vercel: route params arrive via req.query.
// Merge express params into query and pass a minimal req shim through.
const wrap = (handler) => (req, res) =>
  Promise.resolve(handler({ query: { ...req.query, ...req.params }, headers: req.headers }, res))
    .catch((err) => {
      console.error(`${req.path} failed:`, err);
      if (!res.headersSent) res.status(500).json({ error: "Internal error" });
    });

app.get("/api/alerts", wrap(alerts));
app.get("/api/arrivals", wrap(arrivals));
app.get("/api/arrivals/:stopId", wrap(arrivalsForStop));
app.get("/api/vehicles", wrap(vehicles));
app.get("/api/vehicle-positions", wrap(vehiclePositions));
app.get("/api/trip", wrap(trip));
app.get("/api/subway-stations", wrap(subwayStations));
app.get("/api/accessibility", wrap(accessibility));
app.get("/api/stops/:route", wrap(stopsForRoute));
app.get("/api/polylines/:route", wrap(polylinesForRoute));

// --- Serve static build ---
app.use(express.static(join(__dirname, "dist")));
app.get("/{*splat}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Bus status server running on http://localhost:${PORT}`);
});
