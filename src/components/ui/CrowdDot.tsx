import { crowdColor, crowdLabel } from "../../lib/data/format";

interface CrowdDotProps {
  level: string;
  showLabel?: boolean;
}

// README CrowdDot: colored dot (green/amber/red) + optional label.
export function CrowdDot({ level, showLabel }: CrowdDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: crowdColor(level) }} />
      {showLabel && <span className="text-xs text-text2">{crowdLabel(level)}</span>}
    </span>
  );
}
