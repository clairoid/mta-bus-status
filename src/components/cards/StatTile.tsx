interface StatTileProps {
  value: string | number;
  label: string;
  valueColor?: string;
}

// README StatTile: big value + uppercase label. Profile, route stats.
export function StatTile({ value, label, valueColor }: StatTileProps) {
  return (
    <div>
      <div className="text-xl font-extrabold text-text" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.5px] text-dim">{label}</div>
    </div>
  );
}
