import type { TripHistoryEntry } from "./types";

// Grouping and clock time are derived at render from the stored timestamp, so
// "Today" stops being "Today" tomorrow — the old mock froze these as strings.

export function dayGroup(at: number, nowMs = Date.now()): string {
  const startOfDay = (ms: number) => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = Math.round((startOfDay(nowMs) - startOfDay(at)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function clockTime(at: number): string {
  return new Date(at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** Newest first, bucketed by day for the section headings. */
export function groupTrips(
  entries: TripHistoryEntry[],
  nowMs = Date.now()
): { group: string; trips: TripHistoryEntry[] }[] {
  const out: { group: string; trips: TripHistoryEntry[] }[] = [];
  for (const entry of [...entries].sort((a, b) => b.at - a.at)) {
    const group = dayGroup(entry.at, nowMs);
    const last = out[out.length - 1];
    if (last && last.group === group) last.trips.push(entry);
    else out.push({ group, trips: [entry] });
  }
  return out;
}
