import { routeColor } from "../../lib/data/routeColors";

interface RouteBadgeProps {
  routeId: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-[11px] py-1 text-[13px]",
};

// README: route color at full saturation, white 800 text, radius 5-6px.
export function RouteBadge({ routeId, size = "md" }: RouteBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[6px] font-extrabold text-white ${SIZES[size]}`}
      style={{ backgroundColor: routeColor(routeId) }}
    >
      {routeId}
    </span>
  );
}
