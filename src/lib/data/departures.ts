import type { StopArrivals } from "./types";
import type { Departure } from "../../components/cards/DepartureRow";

// Flatten per-stop arrivals into a single departure list sorted soonest-first.
// Shared by the Dashboard right-rail mini board and the full Departure Board.
export function flattenDepartures(stops: StopArrivals[]): Departure[] {
  const flat: Departure[] = [];
  for (const stop of stops) {
    for (const a of stop.arrivals) {
      flat.push({
        stopId: stop.stopId,
        route: a.route,
        stopName: stop.name,
        destination: a.destination,
        minutes: a.minutes,
      });
    }
  }
  return flat.sort((a, b) => (a.minutes ?? Infinity) - (b.minutes ?? Infinity));
}
