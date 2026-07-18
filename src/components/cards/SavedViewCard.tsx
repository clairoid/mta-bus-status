import { RouteBadge } from "../ui/RouteBadge";
import type { SavedView } from "../../lib/data/types";

interface SavedViewCardProps {
  view: SavedView;
  onRemove: () => void;
}

// README Saved Views: icon, name, route badges, meta, ✕ delete.
export function SavedViewCard({ view, onRemove }: SavedViewCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-border bg-card p-4">
      <span className="text-2xl">{view.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-text">{view.name}</div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {view.routes.map((r) => (
            <RouteBadge key={r} routeId={r} size="sm" />
          ))}
        </div>
        <div className="mt-2 text-[11px] text-dim">{view.meta}</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Delete ${view.name}`}
        className="text-dim hover:text-red"
      >
        ✕
      </button>
    </div>
  );
}
