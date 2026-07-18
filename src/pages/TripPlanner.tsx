import { useCallback, useState } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { AutocompleteInput } from "../components/inputs/AutocompleteInput";
import { RecentChips } from "../components/inputs/RecentChips";
import { TripOptionCard } from "../components/cards/TripOptionCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { fetchTrip } from "../lib/data/real/trip";
import { geocodePlaces, type GeoPlace } from "../lib/data/geocode";
import { useAppStore } from "../store/useAppStore";
import { ROUTES } from "../lib/data/mock/mta";
import type { TripSuggestion } from "../lib/data/types";

// Saved Home/Work places (README Trip Planner autocomplete quick-picks).
const SAVED_PLACES = [
  { label: "Home", sublabel: "Court St, Brooklyn", icon: "🏠", lat: 40.6901, lon: -73.9915 },
  { label: "Work", sublabel: "Kings Hwy, Brooklyn", icon: "💼", lat: 40.6035, lon: -73.9573 },
];

const TRIP_ROUTES = Object.keys(ROUTES);

export function TripPlanner() {
  const tripFrom = useAppStore((s) => s.tripFrom);
  const tripTo = useAppStore((s) => s.tripTo);
  const setTrip = useAppStore((s) => s.setTrip);
  const recentTrips = useAppStore((s) => s.recentTrips);
  const addRecentTrip = useAppStore((s) => s.addRecentTrip);
  const removeRecentTrip = useAppStore((s) => s.removeRecentTrip);

  const [fromCoords, setFromCoords] = useState<GeoPlace | null>(null);
  const [toCoords, setToCoords] = useState<GeoPlace | null>(null);
  const [suggestions, setSuggestions] = useState<TripSuggestion[] | null>(null);
  const [loading, setLoading] = useState(false);

  const plan = useCallback(
    async (from: GeoPlace, to: GeoPlace) => {
      setLoading(true);
      setSuggestions(null);
      try {
        const result = await fetchTrip(from.lat, from.lon, to.lat, to.lon, TRIP_ROUTES);
        setSuggestions(result.suggestions);
        addRecentTrip(`${from.label} → ${to.label}`);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [addRecentTrip]
  );

  const pickFrom = (place: GeoPlace) => {
    setFromCoords(place);
    setTrip(place.label, tripTo);
    if (toCoords) plan(place, toCoords);
  };
  const pickTo = (place: GeoPlace) => {
    setToCoords(place);
    setTrip(tripFrom, place.label);
    if (fromCoords) plan(fromCoords, place);
  };

  const swap = () => {
    setTrip(tripTo, tripFrom);
    setFromCoords(toCoords);
    setToCoords(fromCoords);
    if (fromCoords && toCoords) plan(toCoords, fromCoords);
  };

  // Recent chip: re-geocode both halves and re-plan.
  const runRecent = async (label: string) => {
    const [from, to] = label.split(" → ");
    if (!from || !to) return;
    setTrip(from, to);
    setLoading(true);
    const [fromResults, toResults] = await Promise.all([geocodePlaces(from, 1), geocodePlaces(to, 1)]);
    const f = SAVED_PLACES.find((p) => p.label === from) ?? fromResults[0];
    const t = SAVED_PLACES.find((p) => p.label === to) ?? toResults[0];
    if (f && t) {
      setFromCoords(f);
      setToCoords(t);
      plan(f, t);
    } else {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Trip Planner">
      <div className="mx-auto max-w-[640px] space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <AutocompleteInput
              value={tripFrom}
              placeholder="From — address, place, or saved"
              savedPlaces={SAVED_PLACES}
              onChange={(t) => setTrip(t, tripTo)}
              onPick={pickFrom}
            />
            <AutocompleteInput
              value={tripTo}
              placeholder="To — address, place, or saved"
              savedPlaces={SAVED_PLACES}
              onChange={(t) => setTrip(tripFrom, t)}
              onPick={pickTo}
            />
          </div>
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-border bg-card text-text2 hover:bg-chip"
          >
            ⇅
          </button>
        </div>

        <RecentChips items={recentTrips} onPick={runRecent} onRemove={removeRecentTrip} />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : suggestions === null ? (
          <EmptyState
            icon="🧭"
            title="Plan a trip"
            subtitle="Pick a From and To (or a saved place) to see the best B-line options."
          />
        ) : suggestions.length === 0 ? (
          <EmptyState
            icon="🚏"
            title="No direct options found"
            subtitle="These points may not share a nearby B6/B8/B15/B44/B41 route."
          />
        ) : (
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((option, i) => (
              <TripOptionCard key={`${option.route}-${i}`} option={option} rank={i} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
