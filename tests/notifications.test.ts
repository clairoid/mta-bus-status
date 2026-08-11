// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { buildNotifications, relativeTime, alertIcon } from "../src/lib/data/notifications";
import type { Alert } from "../src/lib/data/types";

const alert = (id: string, routes: string[], effect = "DELAY", start: number | null = null): Alert => ({
  id,
  routes,
  header: `<p>${id} header</p>`,
  description: "",
  cause: "UNKNOWN_CAUSE",
  effect,
  activePeriods: [{ start, end: null }],
});

describe("relativeTime", () => {
  const now = Date.UTC(2026, 0, 2, 12, 0, 0);
  it("formats recent, hourly and daily spans", () => {
    expect(relativeTime(now / 1000 - 30, now)).toBe("now");
    expect(relativeTime(now / 1000 - 8 * 60, now)).toBe("8m");
    expect(relativeTime(now / 1000 - 3 * 3600, now)).toBe("3h");
    expect(relativeTime(now / 1000 - 2 * 86400, now)).toBe("2d");
  });

  it("falls back when the feed gives no start time", () => {
    expect(relativeTime(null, now)).toBe("active");
  });
});

describe("alertIcon", () => {
  it("maps known effects and falls back for unknown ones", () => {
    expect(alertIcon("NO_SERVICE")).toBe("alert");
    expect(alertIcon("STOP_MOVED")).toBe("pin");
    expect(alertIcon("SOMETHING_NEW")).toBe("bell");
  });
});

describe("buildNotifications", () => {
  it("only includes alerts on followed routes", () => {
    const out = buildNotifications([alert("a", ["B6"]), alert("b", ["M15"])], ["B6"]);
    expect(out.map((n) => n.id)).toEqual(["a"]);
  });

  it("returns nothing when the user follows no routes, rather than every alert in the city", () => {
    expect(buildNotifications([alert("a", ["B6"])], [])).toEqual([]);
  });

  it("matches case-insensitively in both directions", () => {
    expect(buildNotifications([alert("a", ["b6"])], ["B6"])).toHaveLength(1);
  });

  it("strips the HTML the MTA embeds in alert text", () => {
    const [n] = buildNotifications([alert("a", ["B6"])], ["B6"]);
    expect(n.body).toBe("a header");
  });

  it("titles with the followed route, not just the first affected one", () => {
    const [n] = buildNotifications([alert("a", ["M15", "B6"], "NO_SERVICE")], ["B6"]);
    expect(n.title).toBe("B6 · Suspended");
  });

  it("sorts newest first", () => {
    const now = Date.now();
    const out = buildNotifications(
      [alert("old", ["B6"], "DELAY", now / 1000 - 9000), alert("new", ["B6"], "DELAY", now / 1000 - 60)],
      ["B6"],
      now
    );
    expect(out.map((n) => n.id)).toEqual(["new", "old"]);
  });

  it("does not leak the internal sort key into the notification", () => {
    const [n] = buildNotifications([alert("a", ["B6"])], ["B6"]);
    expect(n).not.toHaveProperty("startedAt");
  });

  it("marks everything unread — read state is the store's job", () => {
    const out = buildNotifications([alert("a", ["B6"]), alert("b", ["B6"])], ["B6"]);
    expect(out.every((n) => n.unread)).toBe(true);
  });
});
