import { Icon } from "../ui/Icon";

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
          className="flex min-h-9 items-center rounded-pill border border-border bg-card pl-3.5 text-xs text-text2"
        >
          <button
            type="button"
            onClick={() => onPick(item)}
            className="max-w-[180px] truncate py-2 hover:text-text active:text-text"
          >
            {item}
          </button>
          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item}`}
            className="flex h-9 w-9 items-center justify-center rounded-pill text-dim hover:text-text active:text-text"
          >
            <Icon name="close" size={13} />
          </button>
        </span>
      ))}
    </div>
  );
}
