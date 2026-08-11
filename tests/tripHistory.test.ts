import { describe, it, expect } from "vitest";
import { dayGroup, groupTrips, clockTime } from "../src/lib/data/tripHistory";
import type { TripHistoryEntry } from "../src/lib/data/types";

const trip = (id: string, at: number): TripHistoryEntry => ({
  id,
  route: "B6",
  from: "Court St",
  to: "Kings Hwy",
  at,
  walkMin: 8,
});

// Local noon, so day-boundary maths isn't at the mercy of the runner's timezone.
const noon = new Date(2026, 0, 15, 12, 0, 0).getTime();
const DAY = 86_400_000;

describe("dayGroup", () => {
  it("labels the current and previous day", () => {
    expect(dayGroup(noon, noon)).toBe("Today");
    expect(dayGroup(noon - DAY, noon)).toBe("Yesterday");
  });

  it("groups by calendar day, not elapsed hours", () => {
    // 11pm yesterday is only ~13h before noon today, but it's still Yesterday.
    const lateYesterday = new Date(2026, 0, 14, 23, 0, 0).getTime();
    expect(dayGroup(lateYesterday, noon)).toBe("Yesterday");
    // 1am today is Today even though it's ~11h earlier.
    const earlyToday = new Date(2026, 0, 15, 1, 0, 0).getTime();
    expect(dayGroup(earlyToday, noon)).toBe("Today");
  });

  it("counts days within the last week", () => {
    expect(dayGroup(noon - 3 * DAY, noon)).toBe("3 days ago");
  });

  it("falls back to a date beyond a week", () => {
    expect(dayGroup(noon - 30 * DAY, noon)).toMatch(/\w+ \d+/);
  });

  it("treats a future timestamp as Today rather than a negative day count", () => {
    expect(dayGroup(noon + DAY, noon)).toBe("Today");
  });
});

describe("groupTrips", () => {
  it("buckets by day, newest first", () => {
    const groups = groupTrips(
      [trip("a", noon - DAY), trip("b", noon), trip("c", noon - 1000)],
      noon
    );
    expect(groups.map((g) => g.group)).toEqual(["Today", "Yesterday"]);
    expect(groups[0].trips.map((t) => t.id)).toEqual(["b", "c"]);
  });

  it("does not mutate the input array's order", () => {
    const input = [trip("a", noon - DAY), trip("b", noon)];
    const snapshot = input.map((t) => t.id);
    groupTrips(input, noon);
    expect(input.map((t) => t.id)).toEqual(snapshot);
  });

  it("returns nothing for an empty history", () => {
    expect(groupTrips([], noon)).toEqual([]);
  });
});

describe("clockTime", () => {
  it("renders a wall-clock time", () => {
    expect(clockTime(new Date(2026, 0, 15, 8, 5).getTime())).toMatch(/8[:.]05/);
  });
});
