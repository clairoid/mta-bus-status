interface DelaySplitBarProps {
  early: number;
  onTime: number;
  late: number;
}

const SEGMENTS = [
  { key: "early", color: "#60a5fa", label: "early" },
  { key: "onTime", color: "#22c55e", label: "on time" },
  { key: "late", color: "#ef4444", label: "late" },
] as const;

// Replaces the old 7-day TrendBars. That trend was mock-only — the app has
// nowhere to store history — whereas this is the actual composition of the
// trips running right now, which is what the live feed can honestly support.
export function DelaySplitBar({ early, onTime, late }: DelaySplitBarProps) {
  const total = early + onTime + late;
  if (total === 0) {
    return <div className="h-2.5 w-full rounded-full bg-chip" aria-hidden />;
  }
  const counts = { early, onTime, late };

  return (
    <>
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-chip"
        role="img"
        aria-label={`${early} early, ${onTime} on time, ${late} late`}
      >
        {SEGMENTS.map(({ key, color }) =>
          counts[key] > 0 ? (
            <div key={key} style={{ width: `${(counts[key] / total) * 100}%`, backgroundColor: color }} />
          ) : null
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {SEGMENTS.map(({ key, color, label }) => (
          <span key={key} className="flex items-center gap-1 text-[10px] text-dim">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            {counts[key]} {label}
          </span>
        ))}
      </div>
    </>
  );
}
