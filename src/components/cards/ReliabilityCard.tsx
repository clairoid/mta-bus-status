import { RouteBadge } from "../ui/RouteBadge";
import { TrendBars } from "./TrendBars";
import { routeColor } from "../../lib/data/routeColors";
import type { ReliabilityEntry } from "../../lib/data/types";

function onTimeColor(pct: number): string {
  if (pct >= 85) return "#22c55e";
  if (pct >= 70) return "var(--yellow)";
  return "#ef4444";
}

// README Reliability card: on-time % (color by threshold), 7-day trend bars,
// on-time count + avg delay.
export function ReliabilityCard({ entry }: { entry: ReliabilityEntry }) {
  const color = onTimeColor(entry.pct);

  return (
    <div className="rounded-card border border-border bg-card p-[18px]">
      <div className="mb-3 flex items-center justify-between">
        <RouteBadge routeId={entry.route} size="lg" />
        <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>
          {entry.pct}%
        </span>
      </div>
      <TrendBars values={entry.trend} color={routeColor(entry.route)} />
      <div className="mt-3 flex items-center justify-between text-[11px] text-dim">
        <span>
          {entry.onTime}/{entry.total} on time
        </span>
        <span>avg delay {entry.avgDelay}</span>
      </div>
    </div>
  );
}
