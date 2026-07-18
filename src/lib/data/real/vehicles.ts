import { getJSON } from "./client";
import type { Vehicle } from "../types";

// GET /api/vehicles -> { vehicles: Vehicle[] } (rich SIRI VehicleMonitoring shape)
export async function fetchVehicles(routes: string[]): Promise<Vehicle[]> {
  const data = await getJSON<{ vehicles: Vehicle[] }>("/api/vehicles", {
    routes: routes.join(","),
  });
  return data.vehicles;
}

// GET /api/vehicle-positions -> lighter GTFS-RT positions, used for map markers
export interface VehiclePosition {
  id: string;
  route: string;
  lat: number;
  lon: number;
  bearing: number;
  speed: number | null;
  timestamp: number;
  occupancy: string | null;
}

export async function fetchVehiclePositions(routes: string[]): Promise<VehiclePosition[]> {
  const data = await getJSON<{ vehicles: VehiclePosition[]; count: number; routes: string[] }>(
    "/api/vehicle-positions",
    { routes: routes.join(",") }
  );
  return data.vehicles;
}
