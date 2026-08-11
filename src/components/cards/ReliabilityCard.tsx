import { RouteBadge } from "../ui/RouteBadge";
import { DelaySplitBar } from "./DelaySplitBar";
import type { ReliabilityEntry } from "../../lib/data/types";

function onTimeColor(pct: number): string {
  if (pct >= 85) return "#22c55e";
  if (pct >= 70) return "var(--yellow)";
  return "#ef4444";
}

function delayLabel(min: number): string {
  if (min === 0) return "on schedule";
  return min < 0 ? `${Math.abs(min)} min early` : `${min} min late`;
}

// Live schedule adherence for one route: on-time share of the trips currently
// running, the early/on-time/late split, and the median deviation.
export function ReliabilityCard({ entry }: { entry: ReliabilityEntry }) {
  const noService = entry.total === 0;
  const color = onTimeColor(entry.pct);

  return (
    <div className="rounded-card border border-border bg-card p-[18px]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <RouteBadge routeId={entry.route} size="lg" />
        {noService ? (
          <span className="text-xs font-semibold text-dim">No trips running</span>
        ) : (
          <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>
            {entry.pct}%
          </span>
        )}
      </div>

      {noService ? (
        <p className="text-[11px] leading-relaxed text-dim">
          Nothing scheduled in service right now, so there's no adherence to measure.
        </p>
      ) : (
        <>
          <DelaySplitBar early={entry.early} onTime={entry.onTime} late={entry.late} />
          <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-dim">
            {/* Trip count sits next to the percentage on purpose: overnight a
                route may only have 2-3 trips, and "0%" off 2 trips shouldn't
                read like a verdict on the line. */}
            <span>
              {entry.onTime}/{entry.total} trip{entry.total === 1 ? "" : "s"} on time
            </span>
            <span>median {delayLabel(entry.medianDelayMin)}</span>
          </div>
        </>
      )}
    </div>
  );
}
