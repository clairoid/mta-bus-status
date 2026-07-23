import { useRef, type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Icon } from "../ui/Icon";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";

interface PageShellProps {
  title: string;
  liveCount?: number;
  onRefresh?: () => Promise<unknown> | void;
  /** Let the body run edge-to-edge (the map does its own insetting). */
  bleed?: boolean;
  children: ReactNode;
}

// README: "Content region: one absolutely-positioned page at a time; each
// page is its own scroll container." Every page wraps its body in this so
// TopBar + scroll padding stay consistent. Pages that pass onRefresh get
// touch pull-to-refresh on their scroll container.
export function PageShell({ title, liveCount, onRefresh, bleed, children }: PageShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pull, refreshing } = usePullToRefresh(scrollRef, onRefresh ?? (() => {}), !!onRefresh);

  return (
    <div className="flex min-h-0 flex-1 flex-col [animation:fadeIn_0.3s]">
      <TopBar title={title} liveCount={liveCount} />
      {onRefresh && (pull > 0 || refreshing) && (
        <div
          className="flex shrink-0 items-center justify-center overflow-hidden text-dim transition-[height]"
          style={{ height: pull }}
        >
          <span
            className={refreshing ? "animate-spin" : ""}
            style={{
              opacity: Math.min(1, pull / 60),
              transform: refreshing ? undefined : `rotate(${pull * 3}deg)`,
            }}
          >
            <Icon name="refresh" size={18} />
          </span>
        </div>
      )}
      <div
        ref={scrollRef}
        data-scroll
        // 24px of side padding on a 375px screen is 13% of the viewport gone
        // before any card padding starts — 16px on mobile, 24px from sm up.
        className={`min-h-0 flex-1 overflow-y-auto ${bleed ? "" : "px-4 py-4 sm:px-6 sm:py-5"}`}
      >
        {children}
      </div>
    </div>
  );
}
