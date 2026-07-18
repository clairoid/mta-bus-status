import { useEffect, useState } from "react";
import { fetchPolylines } from "../lib/data/real/polylines";
import { fetchStopsForRoute } from "../lib/data/real/stops";
import type { RouteStop } from "../lib/data/types";

export interface RouteGeometry {
  polylines: Record<string, [number, number][][]>;
  stops: Record<string, RouteStop[]>;
}

interface RouteData {
  polylines: [number, number][][];
  stops: RouteStop[];
}

// Module-level promise cache: one in-flight fetch per route, shared across
// hook instances and StrictMode's double-mount (both mounts await the same
// promise, so the live mount always receives the resolved data). Both
// endpoints are 1hr server-cached; geometry rarely changes.
const routeCache = new Map<string, Promise<RouteData>>();

function loadRoute(route: string): Promise<RouteData> {
  let cached = routeCache.get(route);
  if (!cached) {
    cached = Promise.allSettled([fetchPolylines(route), fetchStopsForRoute(route)]).then(
      ([poly, stops]) => ({
        polylines: poly.status === "fulfilled" ? poly.value.segments : [],
        stops: stops.status === "fulfilled" ? stops.value : [],
      })
    );
    routeCache.set(route, cached);
  }
  return cached;
}

export function useRouteGeometry(routes: string[]): RouteGeometry {
  const [geometry, setGeometry] = useState<RouteGeometry>({ polylines: {}, stops: {} });
  const routesKey = routes.join(",");

  useEffect(() => {
    let active = true;
    routesKey
      .split(",")
      .filter(Boolean)
      .forEach((route) => {
        loadRoute(route).then((data) => {
          if (!active) return;
          setGeometry((prev) => ({
            polylines: { ...prev.polylines, [route]: data.polylines },
            stops: { ...prev.stops, [route]: data.stops },
          }));
        });
      });
    return () => {
      active = false;
    };
  }, [routesKey]);

  return geometry;
}
