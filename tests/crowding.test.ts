import { describe, it, expect } from "vitest";
import { buildCrowding, buildRouteLevels, buildRouteSegments, routeCrowdLevel, crowdLevelLabel } from "../src/lib/data/crowding";
import type { Vehicle } from "../src/lib/data/types";

const bus = (route: string, occupancy: string | null, extra: Partial<Vehicle> = {}): Vehicle => ({
  id: `${route}-${Math.random().toString(36).slice(2, 7)}`,
  route,
  destination: "Somewhere",
  lat: 40.6,
  lon: -73.9,
  bearing: 0,
  occupancy,
  ...extra,
});

describe("routeCrowdLevel", () => {
  it("ignores buses that report no occupancy rather than counting them as empty", () => {
    // The feed leaves Occupancy null on many buses; treating that as "empty"
    // would understate crowding on exactly the busiest routes.
    const { level, reporting } = routeCrowdLevel([bus("B6", null), bus("B6", "full")]);
    expect(reporting).toBe(1);
    expect(level).toBeGreaterThan(0.9);
  });

  it("returns zero reporting when nothing has occupancy", () => {
    expect(routeCrowdLevel([bus("B6", null), bus("B6", null)])).toEqual({ level: 0, reporting: 0 });
  });

  it("averages across reporting buses", () => {
    const { level } = routeCrowdLevel([bus("B6", "empty"), bus("B6", "full")]);
    expect(level).toBeCloseTo((0.1 + 0.95) / 2, 5);
  });

  it("maps the real SIRI enum values seen in the feed", () => {
    expect(routeCrowdLevel([bus("B6", "seatsAvailable")]).level).toBeCloseTo(0.35, 5);
    expect(routeCrowdLevel([bus("B6", "standingRoomOnly")]).level).toBeCloseTo(0.7, 5);
    expect(routeCrowdLevel([bus("B6", "manySeatsAvailable")]).level).toBeCloseTo(0.1, 5);
  });
});

describe("crowdLevelLabel", () => {
  it("matches the documented colour thresholds", () => {
    expect(crowdLevelLabel(0.8)).toBe("Heavy");
    expect(crowdLevelLabel(0.5)).toBe("Moderate");
    expect(crowdLevelLabel(0.2)).toBe("Light");
  });
});

describe("buildRouteLevels", () => {
  it("keeps the caller's route order even when a route has no buses", () => {
    const levels = buildRouteLevels([bus("B8", "full")], ["B6", "B8", "B15"]);
    expect(levels.map((l) => l.route)).toEqual(["B6", "B8", "B15"]);
  });

  it("says 'No data' rather than showing an empty bar as if it meant empty", () => {
    const [entry] = buildRouteLevels([bus("B6", null)], ["B6"]);
    expect(entry.label).toBe("No data");
    expect(entry.riders).toContain("no occupancy data");
  });

  it("reports how many buses are actually reporting", () => {
    const [entry] = buildRouteLevels([bus("B6", "full"), bus("B6", null), bus("B6", "empty")], ["B6"]);
    expect(entry.riders).toBe("2 of 3 buses reporting");
  });

  it("handles a route with no service at all", () => {
    const [entry] = buildRouteLevels([], ["B6"]);
    expect(entry.riders).toBe("No buses in service");
    expect(entry.level).toBe(0);
  });
});

describe("buildRouteSegments", () => {
  it("orders buses by how close they are to their next stop", () => {
    const segs = buildRouteSegments(
      [
        bus("B6", "full", { onwardCalls: [{ stopId: "3", name: "Far", stopsAway: 9 }] }),
        bus("B6", "empty", { onwardCalls: [{ stopId: "1", name: "Near", stopsAway: 1 }] }),
      ],
      "B6"
    );
    expect(segs.map((s) => s.stop)).toEqual(["Near", "Far"]);
  });

  it("excludes buses with no occupancy and other routes", () => {
    const segs = buildRouteSegments(
      [
        bus("B6", null, { onwardCalls: [{ stopId: "1", name: "NoData", stopsAway: 1 }] }),
        bus("B8", "full", { onwardCalls: [{ stopId: "2", name: "OtherRoute", stopsAway: 1 }] }),
      ],
      "B6"
    );
    expect(segs).toEqual([]);
  });

  it("caps how many bars are drawn", () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      bus("B6", "seatsAvailable", { onwardCalls: [{ stopId: String(i), name: `S${i}`, stopsAway: i }] })
    );
    expect(buildRouteSegments(many, "B6")).toHaveLength(8);
  });
});

describe("buildCrowding", () => {
  it("picks a segment route that actually has reporting buses", () => {
    const data = buildCrowding(
      [bus("B8", "full", { onwardCalls: [{ stopId: "1", name: "Stop", stopsAway: 1 }] })],
      ["B6", "B8"]
    );
    expect(data.segmentRoute).toBe("B8");
    expect(data.segments).toHaveLength(1);
  });

  it("degrades to empty rather than throwing with no data", () => {
    const data = buildCrowding([], []);
    expect(data).toEqual({ routes: [], segments: [], segmentRoute: "" });
  });
});
