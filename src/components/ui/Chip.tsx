interface ChipProps {
  label: string;
  active?: boolean;
  dotColor?: string;
  count?: number | string;
  onClick?: () => void;
  variant?: "outline" | "solid";
}

// Pill chip. "outline" (default) is the dashboard route chip with a color
// dot + soft-accent active state; "solid" is the single-select filter chip
// (All/route) that fills solid indigo when active, per the README.
export function Chip({ label, active, dotColor, count, onClick, variant = "outline" }: ChipProps) {
  const activeClasses =
    variant === "solid"
      ? "border-accent bg-accent text-white"
      : "border-accent bg-accent-soft text-accent";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-bold transition-colors ${
        active ? activeClasses : "border-border bg-card text-text2 hover:bg-chip"
      }`}
    >
      {dotColor && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
      )}
      {label}
      {count !== undefined && (
        <span className={active && variant === "solid" ? "text-white/80" : "text-dim"}>{count}</span>
      )}
    </button>
  );
}
