import { RouteBadge } from "../ui/RouteBadge";
import { Icon } from "../ui/Icon";
import type { TripSuggestion } from "../../lib/data/types";

interface TripOptionCardProps {
  option: TripSuggestion;
  rank: number;
  /** Choosing an option records it in Trip History. */
  onSelect?: (option: TripSuggestion) => void;
}

// README Trip Planner option: route badge, tag, total (walking) minutes,
// leg breakdown. The real /api/trip provides walk times + route (no ride
// ETA), so the total shown is walking minutes.
export function TripOptionCard({ option, rank, onSelect }: TripOptionCardProps) {
  const tag = option.transferRequired ? "Transfer" : rank === 0 ? "Direct · fastest" : "Direct";
  const tagColor = option.transferRequired ? "var(--yellow)" : "#22c55e";
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      {...(onSelect
        ? {
            type: "button" as const,
            onClick: () => onSelect(option),
            "aria-label": `Take the ${option.route}, ${option.totalWalkMin} minutes walking. Saves to trip history`,
          }
        : {})}
      className={`block w-full rounded-card border border-border bg-card p-4 text-left ${
        onSelect ? "transition-colors hover:bg-chip active:bg-chip" : ""
      }`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <RouteBadge routeId={option.route} size="lg" />
        <span className="flex items-center gap-1 text-xs font-bold" style={{ color: tagColor }}>
          {option.transferRequired && <Icon name="refresh" size={12} />}
          {tag}
        </span>
        <span className="ml-auto text-lg font-extrabold tabular-nums text-text">
          {option.totalWalkMin}
          <span className="ml-1 text-[11px] font-semibold text-dim">min walk</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-text2">
        <span className="flex items-center gap-1">
          <Icon name="pin" size={12} className="text-dim" />
          {option.originStop.walkMin}m walk
        </span>
        <Icon name="chevronRight" size={12} className="text-dim" />
        <RouteBadge routeId={option.route} size="sm" />
        <Icon name="chevronRight" size={12} className="text-dim" />
        <span className="flex items-center gap-1">
          <Icon name="pin" size={12} className="text-dim" />
          {option.destStop.walkMin}m walk
        </span>
      </div>
      <div className="mt-2 truncate text-[11px] capitalize text-dim">
        {option.originStop.name.toLowerCase()} → {option.destStop.name.toLowerCase()}
      </div>
      {onSelect && (
        <div className="mt-2 text-[11px] font-semibold text-accent">Save to trip history</div>
      )}
    </Wrapper>
  );
}
