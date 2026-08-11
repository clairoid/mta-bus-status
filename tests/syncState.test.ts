// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { sanitizePersisted, PERSISTED_KEYS, STATE_VERSION } from "../src/store/useAppStore";

// The synced blob is opaque jsonb with no server-side schema, so a payload from
// a different app version (or a hand-edited row) reaches the store directly.
// These guard the boundary that protects user data from corruption.
describe("sanitizePersisted", () => {
  it("keeps known keys with correctly-shaped values", () => {
    const out = sanitizePersisted({ theme: "light", myRoutes: ["B6"], textSize: 1.15 });
    expect(out).toEqual({ theme: "light", myRoutes: ["B6"], textSize: 1.15 });
  });

  it("drops unknown keys, including the version marker", () => {
    const out = sanitizePersisted({ theme: "light", __v: STATE_VERSION, injected: "x" });
    expect(out).toEqual({ theme: "light" });
  });

  it("drops keys that were removed from the store", () => {
    // These were persisted by older builds but no longer exist.
    const out = sanitizePersisted({ sound: true, pushArrivals: true, pushWeekly: true, notify: false });
    expect(out).toEqual({});
  });

  it("drops values of the wrong type instead of trusting them", () => {
    expect(sanitizePersisted({ myRoutes: "B6" })).toEqual({});
    expect(sanitizePersisted({ theme: 123 })).toEqual({});
    expect(sanitizePersisted({ fav: ["not-an-object"] })).toEqual({});
    expect(sanitizePersisted({ textSize: "big" })).toEqual({});
  });

  it("returns empty for non-object input", () => {
    for (const bad of [null, undefined, "str", 42, true]) {
      expect(sanitizePersisted(bad)).toEqual({});
    }
  });

  it("accepts a full round-trip of every persisted key", () => {
    const full = Object.fromEntries(
      PERSISTED_KEYS.map((k) => [k, ({
        theme: "dark", view: "map", heatmap: true, myRoutes: [], mapRoutes: [],
        fav: {}, tracked: {}, readNotifs: {}, alertFilter: "All", savedViews: [],
        routeAlerts: {}, tripFrom: "", tripTo: "", recentTrips: [], tripHistory: [],
        pushAlerts: true, a11y: {}, textSize: 1,
      } as Record<string, unknown>)[k]])
    );
    expect(Object.keys(sanitizePersisted(full)).sort()).toEqual([...PERSISTED_KEYS].sort());
  });
});
