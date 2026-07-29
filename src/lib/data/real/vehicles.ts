import { getJSON } from "./client";
import type { Vehicle } from "../types";

// GET /api/vehicles -> { vehicles: Vehicle[] } (rich SIRI VehicleMonitoring shape)
export async function fetchVehicles(routes: string[]): Promise<Vehicle[]> {
  const data = await getJSON<{ vehicles: Vehicle[] }>("/api/vehicles", {
    routes: routes.join(","),
  });
  return data.vehicles;
}
