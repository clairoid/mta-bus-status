import type { ReactNode } from "react";
import { TopBar } from "./TopBar";

interface PageShellProps {
  title: string;
  liveCount?: number;
  children: ReactNode;
}

// README: "Content region: one absolutely-positioned page at a time; each
// page is its own scroll container." Every page wraps its body in this so
// TopBar + scroll padding stay consistent without a global title context.
export function PageShell({ title, liveCount, children }: PageShellProps) {
  return (
    <div className="flex h-full flex-col [animation:fadeIn_0.3s]">
      <TopBar title={title} liveCount={liveCount} />
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
    </div>
  );
}
