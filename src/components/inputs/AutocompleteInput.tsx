import { useEffect, useRef, useState } from "react";
import { geocodePlaces, type GeoPlace } from "../../lib/data/geocode";

interface SavedPlace {
  label: string;
  sublabel: string;
  icon: string;
  lat: number;
  lon: number;
}

interface AutocompleteInputProps {
  value: string;
  placeholder: string;
  savedPlaces?: SavedPlace[];
  onPick: (place: GeoPlace) => void;
  onChange: (text: string) => void;
}

// README Trip Planner From/To: input + absolute suggestion dropdown mixing
// saved places (Home/Work) and live-filtered geocoding results.
export function AutocompleteInput({
  value,
  placeholder,
  savedPlaces = [],
  onPick,
  onChange,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GeoPlace[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding as the user types.
  useEffect(() => {
    if (value.trim().length < 3) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      setResults(await geocodePlaces(value));
    }, 250);
    return () => clearTimeout(id);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (place: GeoPlace) => {
    onChange(place.label);
    onPick(place);
    setOpen(false);
  };

  const showSaved = value.trim().length < 3;

  return (
    <div ref={boxRef} className="relative flex-1">
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        className="w-full rounded-control border border-border bg-card px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-dim focus-visible:border-accent"
      />
      {open && (showSaved ? savedPlaces.length > 0 : results.length > 0) && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-card border border-border bg-card shadow-popover">
          {showSaved
            ? savedPlaces.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => pick(p)}
                  className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-chip"
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-text">{p.label}</span>
                    <span className="block truncate text-[11px] text-dim">{p.sublabel}</span>
                  </span>
                </button>
              ))
            : results.map((r) => (
                <button
                  key={`${r.label}-${r.lat}`}
                  type="button"
                  onClick={() => pick(r)}
                  className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-chip"
                >
                  <span className="text-dim">📍</span>
                  <span className="truncate text-[13px] text-text">{r.label}</span>
                </button>
              ))}
        </div>
      )}
    </div>
  );
}
