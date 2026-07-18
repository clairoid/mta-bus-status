import { ROUTES } from "./mock/mta";

// Authoritative route colors come from the design's ROUTES map (B6/B8/B15/
// B44/B41). For any other MTA route the real feeds might surface, fall back
// to a stable hash into a fixed palette so colors stay consistent per route.
const FALLBACK_PALETTE = [
  "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f97316", "#06b6d4", "#84cc16", "#e11d48",
];

export function routeColor(route: string): string {
  const known = ROUTES[route.toUpperCase()];
  if (known) return known.color;
  let hash = 0;
  for (let i = 0; i < route.length; i++) hash = (hash * 31 + route.charCodeAt(i)) | 0;
  return FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
}

export function routeName(route: string): string | undefined {
  return ROUTES[route.toUpperCase()]?.name;
}
