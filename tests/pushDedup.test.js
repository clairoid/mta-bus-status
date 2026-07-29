import { describe, it, expect } from "vitest";
import { selectFreshAlerts, nextNotifiedIds, notifiedIdsChanged } from "../api/push.js";

const alert = (id, ...routes) => ({ id, routes, header: `${id} header` });

describe("selectFreshAlerts", () => {
  it("matches alerts on the device's routes only", () => {
    const alerts = [alert("a1", "B6"), alert("a2", "M15")];
    const { matching } = selectFreshAlerts(alerts, ["B6"], []);
    expect(matching.map((a) => a.id)).toEqual(["a1"]);
  });

  it("matches case-insensitively in both directions", () => {
    const { matching } = selectFreshAlerts([alert("a1", "b6")], ["B6"], []);
    expect(matching).toHaveLength(1);
  });

  it("matches an alert affecting several routes if any is followed", () => {
    const { matching } = selectFreshAlerts([alert("a1", "M15", "B6")], ["B6"], []);
    expect(matching).toHaveLength(1);
  });

  it("excludes already-notified alerts — the core dedup rule", () => {
    const alerts = [alert("a1", "B6"), alert("a2", "B6")];
    const { fresh } = selectFreshAlerts(alerts, ["B6"], ["a1"]);
    expect(fresh.map((a) => a.id)).toEqual(["a2"]);
  });

  it("caps how many go out in one run", () => {
    const alerts = Array.from({ length: 20 }, (_, i) => alert(`a${i}`, "B6"));
    expect(selectFreshAlerts(alerts, ["B6"], [], 5).fresh).toHaveLength(5);
  });

  it("handles empty/missing inputs without throwing", () => {
    expect(selectFreshAlerts(undefined, undefined, undefined).fresh).toEqual([]);
    expect(selectFreshAlerts([], [], []).matching).toEqual([]);
  });
});

describe("nextNotifiedIds", () => {
  it("keeps still-active known alerts and adds newly delivered ones", () => {
    const matching = [alert("a1", "B6"), alert("a2", "B6")];
    const next = nextNotifiedIds(matching, new Set(["a1"]), new Set(["a2"]));
    expect(next.sort()).toEqual(["a1", "a2"]);
  });

  it("drops expired alerts so they can re-notify if they return", () => {
    // a1 was notified before but is no longer active, so it isn't in `matching`.
    const next = nextNotifiedIds([alert("a2", "B6")], new Set(["a1"]), new Set(["a2"]));
    expect(next).toEqual(["a2"]);
  });

  it("does not record an alert that failed to send", () => {
    // a2 matched and was fresh, but delivery threw — so it stays unrecorded
    // and will be retried on the next run.
    const next = nextNotifiedIds([alert("a2", "B6")], new Set(), new Set());
    expect(next).toEqual([]);
  });
});

describe("notifiedIdsChanged", () => {
  it("is false when nothing moved (avoids a pointless write)", () => {
    expect(notifiedIdsChanged(["a1"], ["a1"], new Set(["a1"]))).toBe(false);
  });

  it("is true when an alert expired out of the set", () => {
    expect(notifiedIdsChanged([], ["a1"], new Set(["a1"]))).toBe(true);
  });

  it("is true when a new alert was delivered", () => {
    expect(notifiedIdsChanged(["a1", "a2"], ["a1"], new Set(["a1"]))).toBe(true);
  });

  it("treats a missing previous value as empty", () => {
    expect(notifiedIdsChanged([], undefined, new Set())).toBe(false);
  });
});
