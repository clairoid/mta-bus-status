interface ChipProps {
  label: string;
  active?: boolean;
  dotColor?: string;
  count?: number | string;
  onClick?: () => void;
}

// Pill filter chip; route chips carry a color dot. README filters/route pickers.
export function Chip({ label, active, dotColor, count, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-border bg-card text-text2 hover:bg-chip"
      }`}
    >
      {dotColor && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
      )}
      {label}
      {count !== undefined && <span className="text-dim">{count}</span>}
    </button>
  );
}
