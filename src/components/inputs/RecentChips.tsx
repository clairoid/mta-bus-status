interface RecentChipsProps {
  items: string[];
  onPick: (item: string) => void;
  onRemove: (item: string) => void;
}

// README Trip Planner: recent-search chips (removable, persisted, max 5).
export function RecentChips({ items, onPick, onRemove }: RecentChipsProps) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="flex items-center gap-1.5 rounded-pill border border-border bg-card px-3 py-1.5 text-xs text-text2"
        >
          <button type="button" onClick={() => onPick(item)} className="max-w-[180px] truncate hover:text-text">
            {item}
          </button>
          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item}`}
            className="text-dim hover:text-text"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}
