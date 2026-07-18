import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { FeatureCollection } from "geojson";
import type { Vehicle } from "../../lib/data/types";
import type { RouteGeometry } from "../../hooks/useRouteGeometry";
import { routeColor } from "../../lib/data/routeColors";
import { busSvg, busSpeedColor, busPopupHtml } from "./mapHelpers";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

interface LiveMapProps {
  vehicles: Vehicle[];
  geometry: RouteGeometry;
  visibleRoutes: string[];
  heatmapEnabled: boolean;
  onOpenStop: (stopId: string, route: string) => void;
}

function removeLayerSafe(map: mapboxgl.Map, layerId: string, sourceId: string | null) {
  try {
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (sourceId && map.getSource(sourceId)) map.removeSource(sourceId);
  } catch {
    // layer/source already gone
  }
}

// Ported from legacy App.jsx BusMap: dark-v11 map with route polylines,
// diffed stop + bus markers (buses glide on the 1s vehicle poll), a bus
// density heatmap, and Find-me / Fit-all controls.
export function LiveMap({ vehicles, geometry, visibleRoutes, heatmapEnabled, onOpenStop }: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const popupRef = useRef<(mapboxgl.Popup & { _busId?: string }) | null>(null);
  const onOpenStopRef = useRef(onOpenStop);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    onOpenStopRef.current = onOpenStop;
  }, [onOpenStop]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    if (!mapboxgl.accessToken) {
      setMapError("Mapbox token missing (set VITE_MAPBOX_TOKEN)");
      return;
    }
    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-73.94, 40.65],
        zoom: 12.5,
        attributionControl: false,
      });
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
      mapRef.current = map;
      map.on("load", () => setMapReady(true));
      // Keep the canvas sized to its (flex-driven) container.
      const ro = new ResizeObserver(() => map.resize());
      ro.observe(containerRef.current);
      return () => {
        ro.disconnect();
        map.remove();
        mapRef.current = null;
        markersRef.current = {};
        setMapReady(false);
      };
    } catch (err) {
      setMapError(err instanceof Error ? err.message : "Map failed to load");
    }
  }, []);

  // Route polylines (glow + line per visible route)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    visibleRoutes.forEach((route) => {
      const sourceId = `route-${route}`;
      removeLayerSafe(map, `route-glow-${route}`, null);
      removeLayerSafe(map, `route-layer-${route}`, sourceId);
      const segments = geometry.polylines[route];
      if (!segments || segments.length === 0) return;
      map.addSource(sourceId, {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "MultiLineString", coordinates: segments } },
      });
      map.addLayer({
        id: `route-glow-${route}`,
        type: "line",
        source: sourceId,
        paint: { "line-color": routeColor(route), "line-width": 10, "line-opacity": 0.15, "line-blur": 6 },
      });
      map.addLayer({
        id: `route-layer-${route}`,
        type: "line",
        source: sourceId,
        paint: { "line-color": routeColor(route), "line-width": 3.5, "line-opacity": 0.85 },
      });
    });
  }, [geometry.polylines, visibleRoutes, mapReady]);

  // Heatmap of bus density
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (!heatmapEnabled) {
      removeLayerSafe(map, "bus-heatmap", "bus-heatmap-source");
      return;
    }
    const data: FeatureCollection = {
      type: "FeatureCollection",
      features: vehicles
        .filter((v) => v.lat && v.lon && visibleRoutes.includes(v.route))
        .map((v) => ({
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [v.lon, v.lat] },
        })),
    };
    const existing = map.getSource("bus-heatmap-source") as mapboxgl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(data);
      return;
    }
    map.addSource("bus-heatmap-source", { type: "geojson", data });
    map.addLayer({
      id: "bus-heatmap",
      type: "heatmap",
      source: "bus-heatmap-source",
      paint: {
        "heatmap-weight": 1,
        "heatmap-intensity": 0.7,
        "heatmap-radius": 30,
        "heatmap-color": [
          "interpolate", ["linear"], ["heatmap-density"],
          0, "rgba(0,0,0,0)",
          0.2, "rgba(99,102,241,0.3)",
          0.4, "rgba(99,102,241,0.5)",
          0.6, "rgba(236,72,153,0.5)",
          0.8, "rgba(239,68,68,0.6)",
          1, "rgba(239,68,68,0.8)",
        ],
      },
    });
  }, [heatmapEnabled, vehicles, visibleRoutes, mapReady]);

  // Stop markers (diffed; click opens the shared drawer)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const currentKeys = new Set<string>();
    visibleRoutes.forEach((route) => {
      const color = routeColor(route);
      (geometry.stops[route] ?? []).forEach((stop) => {
        if (stop.lat == null || stop.lon == null) return;
        const key = `stop-${route}-${stop.id}`;
        currentKeys.add(key);
        if (markersRef.current[key]) return;
        const el = document.createElement("div");
        el.style.cssText = `width:10px;height:10px;border-radius:50%;background:${color};border:1.5px solid rgba(255,255,255,0.8);cursor:pointer;opacity:0.75;`;
        el.addEventListener("mouseenter", () => (el.style.boxShadow = `0 0 0 3px ${color}80`));
        el.addEventListener("mouseleave", () => (el.style.boxShadow = "none"));
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onOpenStopRef.current(stop.id, route);
        });
        markersRef.current[key] = new mapboxgl.Marker(el).setLngLat([stop.lon, stop.lat]).addTo(map);
      });
    });
    Object.keys(markersRef.current).forEach((key) => {
      if (key.startsWith("stop-") && !currentKeys.has(key)) {
        markersRef.current[key].remove();
        delete markersRef.current[key];
      }
    });
  }, [geometry.stops, visibleRoutes, mapReady]);

  // Bus markers (diffed; glide to new position on each poll)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    vehicles.forEach((v) => {
      if (v.lat == null || v.lon == null || !visibleRoutes.includes(v.route)) return;
      const key = `bus-${v.id}`;
      const isDelayed = v.progressRate === "delayed";
      const color = busSpeedColor(v.speed, isDelayed) || routeColor(v.route);
      const bg = `url("${busSvg(color, v.bearing, isDelayed, v.occupancy)}")`;
      const existing = markersRef.current[key];
      if (existing) {
        existing.setLngLat([v.lon, v.lat]);
        const el = existing.getElement();
        if (el.style.backgroundImage !== bg) el.style.backgroundImage = bg;
        if (popupRef.current?._busId === v.id) popupRef.current.setLngLat([v.lon, v.lat]);
        return;
      }
      const el = document.createElement("div");
      el.style.cssText = "width:38px;height:38px;cursor:pointer;background-size:contain;background-repeat:no-repeat;transition:filter 0.2s;";
      el.style.backgroundImage = bg;
      el.addEventListener("mouseenter", () => (el.style.filter = `brightness(1.3) drop-shadow(0 0 6px ${color})`));
      el.addEventListener("mouseleave", () => (el.style.filter = "none"));
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        popupRef.current?.remove();
        const popup = new mapboxgl.Popup({ offset: 16 })
          .setLngLat([v.lon, v.lat])
          .setHTML(busPopupHtml(v, routeColor(v.route)))
          .addTo(map) as mapboxgl.Popup & { _busId?: string };
        popup._busId = v.id;
        popupRef.current = popup;
      });
      markersRef.current[key] = new mapboxgl.Marker(el).setLngLat([v.lon, v.lat]).addTo(map);
    });
    Object.keys(markersRef.current).forEach((key) => {
      if (!key.startsWith("bus-")) return;
      const id = key.slice(4);
      const v = vehicles.find((x) => String(x.id) === id);
      if (!v || !visibleRoutes.includes(v.route)) {
        markersRef.current[key].remove();
        delete markersRef.current[key];
      }
    });
  }, [vehicles, visibleRoutes, mapReady]);

  const fitAllBuses = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const visible = vehicles.filter((v) => v.lat && v.lon && visibleRoutes.includes(v.route));
    if (visible.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    visible.forEach((v) => bounds.extend([v.lon, v.lat]));
    map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
  }, [vehicles, visibleRoutes]);

  const goToUser = useCallback(() => {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1200 }),
      () => {},
      { enableHighAccuracy: false, timeout: 12000 }
    );
  }, []);

  if (mapError) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-[16px] bg-[#0d0e14] text-sm text-white/70">
        {mapError}
      </div>
    );
  }

  return (
    <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-[16px]">
      {/* Mapbox sets .mapboxgl-map{position:relative} on this node, so it
          must be a normal full-size block, not absolute inset-0. */}
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute bottom-4 left-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={goToUser}
          className="rounded-control bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/70"
        >
          📍 Find me
        </button>
        <button
          type="button"
          onClick={fitAllBuses}
          className="rounded-control bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/70"
        >
          🚌 Fit buses
        </button>
      </div>
    </div>
  );
}
