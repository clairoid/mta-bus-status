import { getJSON } from "./client";
import type { AccessibilityInfo } from "../types";

// GET /api/accessibility -> AccessibilityInfo (1hr server cache per route)
export async function fetchAccessibility(route: string): Promise<AccessibilityInfo> {
  return getJSON<AccessibilityInfo>("/api/accessibility", { route });
}
