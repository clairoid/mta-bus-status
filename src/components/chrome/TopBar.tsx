import { LivePill } from "../ui/LivePill";
import { IconButton } from "../ui/IconButton";
import { useAppStore } from "../../store/useAppStore";

interface TopBarProps {
  title: string;
  liveCount?: number;
}

export function TopBar({ title, liveCount }: TopBarProps) {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setHelpOpen = useAppStore((s) => s.setHelpOpen);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
      <h1 className="shrink-0 truncate text-base font-extrabold text-text sm:text-lg">{title}</h1>
      {liveCount !== undefined && (
        <span className="hidden shrink-0 sm:inline-flex">
          <LivePill count={liveCount} label="live · updated" />
        </span>
      )}

      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5">
          <span className="shrink-0 text-dim">🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="w-24 min-w-0 bg-transparent text-sm text-text outline-none placeholder:text-dim sm:w-56"
          />
          <span className="hidden shrink-0 rounded bg-chip px-1.5 py-0.5 text-[10px] font-semibold text-chip-text sm:inline">
            ⌘K
          </span>
        </div>
        <span className="shrink-0">
          <IconButton icon="?" label="Keyboard shortcuts" onClick={() => setHelpOpen(true)} />
        </span>
      </div>
    </header>
  );
}
