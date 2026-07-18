import { crowdLevelColor } from "../../lib/data/format";
import type { CrowdingSegment } from "../../lib/data/types";

// README Live Crowding: along-route segment bar chart (per-stop level).
export function SegmentBarChart({ segments }: { segments: CrowdingSegment[] }) {
  return (
    <div className="flex h-48 gap-2">
      {segments.map((seg) => (
        <div key={seg.stop} className="flex h-full min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md transition-all"
              style={{ height: `${Math.round(seg.level * 100)}%`, backgroundColor: crowdLevelColor(seg.level) }}
            />
          </div>
          <span className="w-full truncate text-center text-[10px] text-dim" title={seg.stop}>
            {seg.stop}
          </span>
        </div>
      ))}
    </div>
  );
}
