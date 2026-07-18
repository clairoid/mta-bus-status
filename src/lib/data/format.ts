export function fmtSecs(secs: number): { big: string; small: string } {
  if (secs <= 30) return { big: "Now", small: "" };
  return { big: String(Math.max(1, Math.ceil(secs / 60))), small: "min" };
}

export function mmss(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = String(Math.max(0, secs % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

const CROWD_LABELS: Record<string, string> = {
  empty: "Empty",
  seats: "Seats",
  standing: "Standing",
  full: "Full",
};

export function crowdLabel(c: string): string {
  return CROWD_LABELS[c] || c;
}

const CROWD_COLORS: Record<string, string> = {
  empty: "#22c55e",
  seats: "#22c55e",
  standing: "#f59e0b",
  full: "#ef4444",
};

export function crowdColor(c: string): string {
  return CROWD_COLORS[c] || "#9aa0aa";
}

// Normalize SIRI Occupancy enum values to our empty/seats/standing/full keys.
export function occupancyToCrowd(occupancy: string | null | undefined): string | null {
  if (!occupancy) return null;
  const o = occupancy.toLowerCase();
  if (o.includes("full")) return "full";
  if (o.includes("standing")) return "standing";
  if (o.includes("fewseats") || o === "seatsavailable") return "seats";
  if (o.includes("manyseats") || o.includes("empty")) return "empty";
  return "seats";
}

// README "Countdown time color logic": <=120s green, <=420s yellow, else text
export function timeColor(remainingSecs: number, textColor: string): string {
  if (remainingSecs <= 120) return "#22c55e";
  if (remainingSecs <= 420) return "var(--yellow)";
  return textColor;
}

// README "Crowding level color": >=0.75 red, >=0.45 amber, else green
export function crowdLevelColor(level: number): string {
  if (level >= 0.75) return "#ef4444";
  if (level >= 0.45) return "#f59e0b";
  return "#22c55e";
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
