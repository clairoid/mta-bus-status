interface TrendBarsProps {
  values: number[];
  color: string;
}

// README Reliability: 7-day trend bars. Plain computed-height divs.
export function TrendBars({ values, color }: TrendBarsProps) {
  const max = Math.max(...values, 100);
  return (
    <div className="flex h-12 items-end gap-1.5">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.4 + (i / values.length) * 0.6 }}
        />
      ))}
    </div>
  );
}
