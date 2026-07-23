import { RouteBadge } from "../ui/RouteBadge";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import type { SavedView } from "../../lib/data/types";

interface SavedViewCardProps {
  view: SavedView;
  onRemove: () => void;
}

// README Saved Views: icon, name, route badges, meta, ✕ delete.
export function SavedViewCard({ view, onRemove }: SavedViewCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-border bg-card p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent">
        <Icon name={view.icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-text">{view.name}</div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {view.routes.map((r) => (
            <RouteBadge key={r} routeId={r} size="sm" />
          ))}
        </div>
        <div className="mt-2 text-[11px] text-dim">{view.meta}</div>
      </div>
      <IconButton icon="close" label={`Delete ${view.name}`} onClick={onRemove} bare />
    </div>
  );
}
