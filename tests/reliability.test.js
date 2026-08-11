import { describe, it, expect } from "vitest";
import { aggregateReliability, emptyEntry, EARLY_SECS, LATE_SECS } from "../api/reliability.js";

// Shape mirrors a decoded GTFS-RT FeedMessage entity.
const trip = (routeId, delay) => ({ tripUpdate: { trip: { routeId }, delay } });

describe("aggregateReliability", () => {
  it("scores against the MTA on-time window (>1 min early to <5 min late)", () => {
    const { byRoute } = aggregateReliability([
      trip("B6", 0), // on time
      trip("B6", LATE_SECS), // exactly 5 min late — still on time
      trip("B6", EARLY_SECS), // exactly 1 min early — still on time
      trip("B6", LATE_SECS + 1), // late
      trip("B6", EARLY_SECS - 1), // early
    ]);
    const b6 = byRoute.get("B6");
    expect(b6.total).toBe(5);
    expect(b6.onTime).toBe(3);
    expect(b6.late).toBe(1);
    expect(b6.early).toBe(1);
    expect(b6.pct).toBe(60);
  });

  it("uses the median, so one extreme outlier doesn't define the route", () => {
    // A single 47-minute bus shouldn't drag the headline number.
    const { byRoute } = aggregateReliability([
      trip("B6", 60),
      trip("B6", 60),
      trip("B6", 60),
      trip("B6", 2807),
    ]);
    expect(byRoute.get("B6").medianDelayMin).toBe(1);
  });

  it("reports negative medians for routes running early", () => {
    const { byRoute } = aggregateReliability([trip("B15", -180), trip("B15", -180)]);
    expect(byRoute.get("B15").medianDelayMin).toBe(-3);
  });

  it("upper-cases route ids so they match the app's convention", () => {
    const { byRoute } = aggregateReliability([trip("b6", 0)]);
    expect(byRoute.has("B6")).toBe(true);
  });

  it("skips trips with no routeId or no delay rather than counting them as on time", () => {
    // arrival.delay is dead in this feed (always 0); only trip-level delay is
    // real, so a missing one must not be read as a punctual trip.
    const { byRoute, citywide } = aggregateReliability([
      trip("B6", 0),
      { tripUpdate: { trip: {}, delay: 0 } },
      { tripUpdate: { trip: { routeId: "B6" } } },
      { tripUpdate: { trip: { routeId: "B6" }, delay: null } },
      {},
    ]);
    expect(byRoute.get("B6").total).toBe(1);
    expect(citywide.trips).toBe(1);
  });

  it("aggregates a citywide summary across every route", () => {
    const { citywide } = aggregateReliability([
      trip("B6", 0),
      trip("B8", 0),
      trip("Q44", LATE_SECS + 600),
    ]);
    expect(citywide.routes).toBe(3);
    expect(citywide.trips).toBe(3);
    expect(citywide.pct).toBe(67);
  });

  it("handles an empty or missing feed without throwing", () => {
    expect(aggregateReliability([]).citywide).toEqual({ routes: 0, trips: 0, pct: 0 });
    expect(aggregateReliability(undefined).byRoute.size).toBe(0);
  });
});

describe("emptyEntry", () => {
  it("distinguishes 'no trips running' from a genuine 0%", () => {
    const e = emptyEntry("B6");
    expect(e.total).toBe(0);
    expect(e.pct).toBe(0);
    // The UI keys off total === 0 to say "No trips running" instead of "0%".
  });
});
