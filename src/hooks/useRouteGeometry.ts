import { useEffect, useRef, useState } from "react";
import { fetchPolylines } from "../lib/data/real/polylines";
import { fetchStopsForRoute } from "../lib/data/real/stops";
import type { RouteStop } from "../lib/data/types";

export interface RouteGeometry {
  polylines: Record<string, [number, number][][]>;
  stops: Record<string, RouteStop[]>;
}

// Fetches route polylines + stops for the given routes once each and caches
// them (both endpoints are 1hr server-cached; geometry rarely changes).
export function useRouteGeometry(routes: string[]): RouteGeometry {
  const [geometry, setGeometry] = useState<RouteGeometry>({ polylines: {}, stops: {} });
  const loadedRef = useRef<Set<string>>(new Set());
  const routesKey = routes.join(",");

  useEffect(() => {
    let active = true;
    const toLoad = routesKey.split(",").filter((r) => r && !loadedRef.current.has(r));
    if (toLoad.length === 0) return;

    toLoad.forEach((route) => {
      loadedRef.current.add(route);
      Promise.allSettled([fetchPolylines(route), fetchStopsForRoute(route)]).then(
        ([polyResult, stopsResult]) => {
          if (!active) return;
          setGeometry((prev) => ({
            polylines: {
              ...prev.polylines,
              [route]: polyResult.status === "fulfilled" ? polyResult.value.segments : [],
            },
            stops: {
              ...prev.stops,
              [route]: stopsResult.status === "fulfilled" ? stopsResult.value : [],
            },
          }));
        }
      );
    });

    return () => {
      active = false;
    };
  }, [routesKey]);

  return geometry;
}
