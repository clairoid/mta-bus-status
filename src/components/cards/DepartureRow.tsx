import { CountdownTime } from "../ui/CountdownTime";
import { routeColor } from "../../lib/data/routeColors";
import { minutesToSecs } from "../../hooks/useArrivals";

export interface Departure {
  stopId: string;
  route: string;
  stopName: string;
  destination: string;
  minutes: number | null;
}

interface DepartureRowProps {
  departure: Departure;
  onOpen: (stopId: string) => void;
}

// README Departure Board row: Route / Stop / Destination(hide-mobile) / Time.
export function DepartureRow({ departure, onOpen }: DepartureRowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(departure.stopId)}
      className="grid min-h-14 w-full grid-cols-[60px_1fr_70px] items-center gap-2.5 border-t border-border px-4 py-3 text-left transition-colors active:bg-chip sm:px-[18px] min-[720px]:grid-cols-[60px_1fr_1fr_70px]"
    >
      <span
        className="rounded-[5px] py-0.5 text-center text-[11px] font-extrabold text-white"
        style={{ backgroundColor: routeColor(departure.route) }}
      >
        {departure.route}
      </span>
      <span className="truncate text-[13px] font-semibold capitalize text-text">
        {departure.stopName.toLowerCase()}
      </span>
      <span className="hidden truncate text-[13px] capitalize text-dim min-[720px]:block">
        {departure.destination.toLowerCase()}
      </span>
      <span className="text-right">
        <CountdownTime seconds={minutesToSecs(departure.minutes)} />
      </span>
    </button>
  );
}
