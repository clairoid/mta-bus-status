import protobuf from "gtfs-realtime-bindings";
import polyline from "@mapbox/polyline";

export const API_KEY = process.env.MTA_BUSTIME_KEY || "";
export const SIRI_BASE = "https://bustime-classic.mta.info/api";

export const FAVORITES = [
  { stopId: "300833", name: "AVENUE D/NOSTRAND AV", route: "B8" },
  { stopId: "308313", name: "ROCKAWAY AV/HEGEMAN AV", route: "B8" },
  { stopId: "301128", name: "E 98 ST/CHURCH AV", route: "B15" },
  { stopId: "301034", name: "FOUNTAIN AV/LINDEN BLVD", route: "B15" },
  { stopId: "300590", name: "Cozine Av/Ashford St", route: "B6" },
  { stopId: "300541", name: "Glenwood RD/Nostrand Av", route: "B6" },
];

export const DEFAULT_ROUTES = ["B6", "B8", "B15"];

// Same-origin in production, so these only matter for local dev and any future
// second origin. VERCEL_URL covers preview deployments automatically. (The old
// list pointed at mta.spis.dev, which no longer resolves, and omitted the
// actual production origin.)
const ALLOWED_ORIGINS = [
  "https://mta-bus-status.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

export function cors(req, res) {
  const origin = req?.headers?.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

// Uniform error response. Handlers previously echoed raw upstream `err.message`
// to the client, which could disclose internal hostnames and URLs.
export function fail(res, status, message) {
  return res.status(status).json({ error: message });
}

// Let the Vercel CDN absorb repeat traffic. Without this every poll from every
// open tab invoked a function (Vercel's default is `max-age=0, must-revalidate`),
// so upstream load scaled with open tabs rather than with users.
export function cacheFor(res, seconds, swr = seconds * 10) {
  res.setHeader("Cache-Control", `public, s-maxage=${seconds}, stale-while-revalidate=${swr}`);
}

// Bus routes are 1-4 letters + 1-3 digits, optionally -SBS: B6, M15-SBS, BXM1, Q44-SBS.
const ROUTE_RE = /^[A-Z]{1,4}\d{1,3}(-SBS)?$/;

export const MAX_ROUTES = 8;

export function isValidRoute(route) {
  return typeof route === "string" && ROUTE_RE.test(route.toUpperCase());
}

// Parse `?routes=A,B,C` into a validated, de-duplicated, length-capped list.
// Every handler fanned out one upstream call per entry with no cap, so one
// request carrying a few hundred routes could exhaust the shared MTA key quota
// and take the app down for everyone.
export function parseRoutes(routesParam, fallback = DEFAULT_ROUTES) {
  if (!routesParam || typeof routesParam !== "string") return [...fallback];
  const seen = new Set();
  for (const raw of routesParam.split(",")) {
    const route = raw.trim().toUpperCase();
    if (!route || !ROUTE_RE.test(route)) continue;
    seen.add(route);
    if (seen.size >= MAX_ROUTES) break;
  }
  return seen.size ? [...seen] : [...fallback];
}

// Express routes (BM*, BxM*) use MTABC_ prefix, local/SBS use MTA NYCT_
// SBS routes use + suffix in MTA API (e.g. B44-SBS -> MTA NYCT_B44+).
// The -SBS check must run first: Bronx SBS routes (BX12-SBS) are NYCT +
// routes, not MTABC.
export function routeApiId(route) {
  const r = route.toUpperCase();
  if (r.endsWith("-SBS")) return `MTA NYCT_${r.replace(/-SBS$/, "")}+`;
  if (r.startsWith("BM") || r.startsWith("BX")) return `MTABC_${r}`;
  return `MTA NYCT_${r}`;
}

// Drop the agency prefix the MTA feeds put on every id.
export function stripAgency(id = "") {
  return String(id).replace("MTA NYCT_", "").replace("MTABC_", "").replace("MTA_", "");
}

// SIRI uses a trailing + for SBS routes (B44+); the app uses -SBS (B44-SBS).
// `originalRoute` re-applies the suffix when the feed omits it. Was duplicated
// verbatim in api/arrivals.js and api/vehicles.js.
export function stripRoutePrefix(s, originalRoute) {
  let clean = stripAgency(s);
  if (clean.endsWith("+")) clean = `${clean.slice(0, -1)}-SBS`;
  if (originalRoute && originalRoute.toUpperCase().endsWith("-SBS") && !clean.toUpperCase().endsWith("-SBS")) {
    clean += "-SBS";
  }
  return clean;
}

export async function fetchJSON(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchBuffer(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Node 18+ global fetch has no .buffer(); arrayBuffer() is the portable form.
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

export { protobuf, polyline };
