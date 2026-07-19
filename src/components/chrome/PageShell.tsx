import { useRef, type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";

interface PageShellProps {
  title: string;
  liveCount?: number;
  onRefresh?: () => Promise<unknown> | void;
  children: ReactNode;
}

// README: "Content region: one absolutely-positioned page at a time; each
// page is its own scroll container." Every page wraps its body in this so
// TopBar + scroll padding stay consistent. Pages that pass onRefresh get
// touch pull-to-refresh on their scroll container.
export function PageShell({ title, liveCount, onRefresh, children }: PageShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pull, refreshing } = usePullToRefresh(scrollRef, onRefresh ?? (() => {}), !!onRefresh);

  return (
    <div className="flex min-h-0 flex-1 flex-col [animation:fadeIn_0.3s]">
      <TopBar title={title} liveCount={liveCount} />
      {onRefresh && (pull > 0 || refreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden text-dim transition-[height]"
          style={{ height: pull }}
        >
          <span className={`text-lg ${refreshing ? "animate-spin" : ""}`} style={{ opacity: Math.min(1, pull / 60) }}>
            ↻
          </span>
        </div>
      )}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {children}
      </div>
    </div>
  );
}
