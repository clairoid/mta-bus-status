import { describe, it, expect } from "vitest";
import { routeApiId, stripRoutePrefix, stripAgency, parseRoutes, isValidRoute, MAX_ROUTES, DEFAULT_ROUTES } from "../api/_lib.js";

// These encode the fiddliest domain rules in the codebase — the SBS `+` vs
// `-SBS` mismatch and the MTABC/NYCT agency split. Getting the ordering wrong
// here caused real production bugs before, hence the explicit coverage.
describe("routeApiId", () => {
  it("maps local routes to the NYCT namespace", () => {
    expect(routeApiId("B6")).toBe("MTA NYCT_B6");
    expect(routeApiId("M15")).toBe("MTA NYCT_M15");
  });

  it("maps express routes to MTABC", () => {
    expect(routeApiId("BM5")).toBe("MTABC_BM5");
    expect(routeApiId("BXM1")).toBe("MTABC_BXM1");
  });

  it("converts the -SBS suffix to the SIRI + form", () => {
    expect(routeApiId("B44-SBS")).toBe("MTA NYCT_B44+");
    expect(routeApiId("M15-SBS")).toBe("MTA NYCT_M15+");
  });

  it("treats Bronx SBS as NYCT, not MTABC — the -SBS check must win", () => {
    // BX12-SBS starts with "BX", so an MTABC-first implementation returns
    // MTABC_BX12-SBS, which the MTA API rejects.
    expect(routeApiId("BX12-SBS")).toBe("MTA NYCT_BX12+");
  });

  it("is case-insensitive", () => {
    expect(routeApiId("b44-sbs")).toBe("MTA NYCT_B44+");
  });
});

describe("stripAgency", () => {
  it("removes every agency prefix the feeds use", () => {
    expect(stripAgency("MTA NYCT_B6")).toBe("B6");
    expect(stripAgency("MTABC_BM5")).toBe("BM5");
    expect(stripAgency("MTA_300590")).toBe("300590");
  });

  it("tolerates empty and non-string input", () => {
    expect(stripAgency("")).toBe("");
    expect(stripAgency()).toBe("");
  });
});

describe("stripRoutePrefix", () => {
  it("converts the SIRI + suffix back to -SBS", () => {
    expect(stripRoutePrefix("MTA NYCT_B44+")).toBe("B44-SBS");
  });

  it("re-applies -SBS when the feed omits it", () => {
    // SIRI sometimes returns the bare route on an SBS query.
    expect(stripRoutePrefix("MTA NYCT_B44", "B44-SBS")).toBe("B44-SBS");
  });

  it("does not double-apply the suffix", () => {
    expect(stripRoutePrefix("MTA NYCT_B44+", "B44-SBS")).toBe("B44-SBS");
  });

  it("leaves plain routes alone", () => {
    expect(stripRoutePrefix("MTA NYCT_B6", "B6")).toBe("B6");
  });
});

describe("isValidRoute", () => {
  it("accepts real route shapes", () => {
    for (const r of ["B6", "M15", "Q44-SBS", "BXM1", "S79"]) {
      expect(isValidRoute(r)).toBe(true);
    }
  });

  it("rejects junk and injection-shaped input", () => {
    for (const r of ["", "../etc", "B6;DROP", "MTA NYCT_B6", "B", "12345", "B6-XYZ", null, undefined, 42]) {
      expect(isValidRoute(r)).toBe(false);
    }
  });
});

describe("parseRoutes", () => {
  it("parses, upper-cases and trims", () => {
    expect(parseRoutes("b6, m15 ,Q44-SBS")).toEqual(["B6", "M15", "Q44-SBS"]);
  });

  it("de-duplicates", () => {
    expect(parseRoutes("B6,B6,b6")).toEqual(["B6"]);
  });

  it("drops invalid entries rather than forwarding them upstream", () => {
    expect(parseRoutes("B6,../../etc,M15")).toEqual(["B6", "M15"]);
  });

  it("caps the list — this is the amplification guard", () => {
    const many = Array.from({ length: 200 }, (_, i) => `B${i + 1}`).join(",");
    expect(parseRoutes(many)).toHaveLength(MAX_ROUTES);
  });

  it("falls back to defaults when absent or fully invalid", () => {
    expect(parseRoutes(undefined)).toEqual(DEFAULT_ROUTES);
    expect(parseRoutes("")).toEqual(DEFAULT_ROUTES);
    expect(parseRoutes("!!!,???")).toEqual(DEFAULT_ROUTES);
  });

  it("honours an explicit empty fallback", () => {
    expect(parseRoutes("", [])).toEqual([]);
  });
});
