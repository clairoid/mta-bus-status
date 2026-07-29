// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { cleanText, effectLabel, effectSeverity, causeLabel } from "../src/lib/data/alertFormat";

describe("cleanText", () => {
  it("strips the HTML the MTA embeds in alert text", () => {
    expect(cleanText("<p>Delays on the B6</p>")).toBe("Delays on the B6");
  });

  it("decodes entities", () => {
    expect(cleanText("Bay Ridge &amp; 95 St")).toBe("Bay Ridge & 95 St");
  });

  it("removes the zero-width joiners the feed is full of", () => {
    expect(cleanText("B6‌ detour")).toBe("B6 detour");
  });

  it("collapses whitespace", () => {
    expect(cleanText("<p>a</p>\n\n  <p>b</p>")).toBe("a b");
  });

  it("returns empty for empty input", () => {
    expect(cleanText("")).toBe("");
  });

  it("does not execute or emit markup — output is inert text", () => {
    // Decoding happens in a detached <textarea> (RCDATA), so no element can be
    // created regardless of input. Guard against a future refactor to innerHTML
    // on a normal element.
    const out = cleanText('<img src=x onerror="alert(1)">hello');
    expect(out).not.toContain("<img");
    expect(out).toContain("hello");
    expect(document.querySelector("img")).toBeNull();
  });
});

describe("effectSeverity", () => {
  it("treats a suspension as critical", () => {
    expect(effectSeverity("NO_SERVICE")).toBe("crit");
  });

  it("treats delays and reduced service as warnings", () => {
    expect(effectSeverity("DELAY")).toBe("warn");
    expect(effectSeverity("REDUCED_SERVICE")).toBe("warn");
  });

  it("treats detours and stop changes as informational", () => {
    for (const e of ["DETOUR", "SIGNIFICANT_DETOUR", "MODIFIED_SERVICE", "STOP_CLOSED", "STOP_MOVED"]) {
      expect(effectSeverity(e)).toBe("info");
    }
  });

  it("defaults unknown effects to info rather than throwing", () => {
    expect(effectSeverity("SOMETHING_NEW")).toBe("info");
  });
});

describe("effectLabel", () => {
  it("maps known effects to short labels", () => {
    expect(effectLabel("NO_SERVICE")).toBe("Suspended");
    expect(effectLabel("STOP_MOVED")).toBe("Stop Moved");
  });

  it("humanises unmapped effects", () => {
    expect(effectLabel("POLICE_ACTIVITY")).toBe("POLICE ACTIVITY");
  });

  it("collapses UNKNOWN_* to a generic label", () => {
    expect(effectLabel("UNKNOWN_9")).toBe("Alert");
  });
});

describe("causeLabel", () => {
  it("groups maintenance under construction for the filter chips", () => {
    expect(causeLabel("MAINTENANCE")).toBe("Construction");
    expect(causeLabel("CONSTRUCTION")).toBe("Construction");
  });

  it("falls back to Other", () => {
    expect(causeLabel("STRIKE")).toBe("Other");
  });
});
