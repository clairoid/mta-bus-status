import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// README responsive breakpoints: 1080 (hide right rail, grids->2col),
// 860 (icon-rail sidebar, grids->1col), 560 (bottom tab bar, full-screen shell).
// The 1080 tier is expressed in CSS (`min-[1080px]:`) rather than JS — there
// was a `hideRightRail` value here that nothing ever consumed.
export function useBreakpoints() {
  return {
    iconRailSidebar: useMediaQuery("(max-width: 860px)"),
    mobile: useMediaQuery("(max-width: 560px)"),
  };
}
