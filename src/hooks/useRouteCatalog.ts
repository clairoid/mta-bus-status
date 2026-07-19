import { useEffect, useState } from "react";

export interface CatalogRoute {
  id: string;
  name: string;
  agency: string;
}

// One shared in-flight fetch for the whole app (the catalog is ~386 routes and
// changes rarely; the endpoint is also server-cached for an hour).
let cached: Promise<CatalogRoute[]> | null = null;

export function loadRouteCatalog(): Promise<CatalogRoute[]> {
  if (!cached) {
    cached = fetch("/api/routes")
      .then((r) => (r.ok ? r.json() : { routes: [] }))
      .then((d: { routes?: CatalogRoute[] }) => d.routes ?? [])
      .catch(() => []);
  }
  return cached;
}

export function useRouteCatalog() {
  const [routes, setRoutes] = useState<CatalogRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadRouteCatalog().then((r) => {
      if (!active) return;
      setRoutes(r);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { routes, loading };
}

// Resolve a route's display name from the live MTA catalog, falling back to
// the bundled design names and finally the route id itself.
export function useRouteName(): (id: string) => string {
  const { routes } = useRouteCatalog();
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!routes.length) return;
    setMap(Object.fromEntries(routes.map((r) => [r.id, r.name])));
  }, [routes]);

  return (id: string) => map[id] || fallbackName(id) || id;
}

function fallbackName(id: string): string | undefined {
  return DESIGN_NAMES[id];
}

// The five routes the original design shipped with, so names render before
// the catalog resolves (and if the feed is unavailable).
const DESIGN_NAMES: Record<string, string> = {
  B6: "Bay Ridge – Bergen Beach",
  B8: "Bay Ridge – Brownsville",
  B15: "Downtown – JFK Airport",
  B44: "Williamsburg – Sheepshead Bay",
  B41: "Downtown – Kings Plaza",
};
