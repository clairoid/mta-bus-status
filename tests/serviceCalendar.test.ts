import { describe, it, expect } from "vitest";
import { buildMonthGrid, upcomingExceptions, parseCompact, type ServiceException } from "../src/lib/data/serviceCalendar";

const exc = (date: string, effectiveType: ServiceException["effectiveType"] = "saturday"): ServiceException => ({
  date,
  naturalType: "weekday",
  effectiveType,
  label: "Saturday schedule",
  feeds: ["b"],
});

describe("parseCompact", () => {
  it("parses YYYYMMDD at local noon so DST can't shift the calendar day", () => {
    const d = parseCompact("20260703")!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(3);
  });

  it("rejects malformed input", () => {
    expect(parseCompact(null)).toBeNull();
    expect(parseCompact("2026-07")).toBeNull();
  });
});

describe("buildMonthGrid", () => {
  const today = new Date(2026, 6, 15, 12); // Wed 15 Jul 2026

  it("lays out a Sunday-first grid in whole weeks", () => {
    const weeks = buildMonthGrid(2026, 6, [], today);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    // 1 Jul 2026 is a Wednesday, so three leading blanks.
    expect(weeks[0].slice(0, 3).every((c) => c.day === null)).toBe(true);
    expect(weeks[0][3].day).toBe(1);
  });

  it("includes every day of the month exactly once", () => {
    const days = buildMonthGrid(2026, 6, [], today).flat().filter((c) => c.day !== null).map((c) => c.day);
    expect(days).toHaveLength(31);
    expect(new Set(days).size).toBe(31);
  });

  it("marks today", () => {
    const todayCells = buildMonthGrid(2026, 6, [], today).flat().filter((c) => c.isToday);
    expect(todayCells).toHaveLength(1);
    expect(todayCells[0].day).toBe(15);
  });

  it("marks only the day carrying a schedule change", () => {
    const cells = buildMonthGrid(2026, 6, [exc("2026-07-03")], today).flat();
    const flagged = cells.filter((c) => c.exception);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].day).toBe(3);
  });

  it("does not leak an exception into a neighbouring month", () => {
    const august = buildMonthGrid(2026, 7, [exc("2026-07-03")], today).flat();
    expect(august.some((c) => c.exception)).toBe(false);
  });

  it("handles February in a non-leap year", () => {
    const days = buildMonthGrid(2026, 1, [], today).flat().filter((c) => c.day !== null);
    expect(days).toHaveLength(28);
  });

  it("flags days outside the published feed window so they aren't shown as confirmed-normal", () => {
    // The bundled artifact covers mid-2026; a month far in the future is
    // entirely unpublished.
    const far = buildMonthGrid(2030, 0, [], today).flat().filter((c) => c.day !== null);
    expect(far.every((c) => !c.inFeedRange)).toBe(true);
  });
});

describe("upcomingExceptions", () => {
  const today = new Date(2026, 6, 15, 12);

  it("keeps only today and later, soonest first", () => {
    const out = upcomingExceptions(
      [exc("2026-08-01"), exc("2026-07-03"), exc("2026-07-15"), exc("2026-07-20")],
      today
    );
    // 2026-07-03 is in the past and drops out; the rest come back ascending.
    expect(out.map((e) => e.date)).toEqual(["2026-07-15", "2026-07-20", "2026-08-01"]);
  });

  it("includes today itself", () => {
    expect(upcomingExceptions([exc("2026-07-15")], today)).toHaveLength(1);
  });

  it("caps the list", () => {
    const many = Array.from({ length: 20 }, (_, i) => exc(`2026-08-${String(i + 1).padStart(2, "0")}`));
    expect(upcomingExceptions(many, today, 6)).toHaveLength(6);
  });

  it("returns nothing when the timetable has no changes ahead", () => {
    expect(upcomingExceptions([exc("2026-01-01")], today)).toEqual([]);
  });
});
