import { LivePill } from "../ui/LivePill";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import { useAppStore } from "../../store/useAppStore";
import { useBreakpoints } from "../../hooks/useMediaQuery";

interface TopBarProps {
  title: string;
  liveCount?: number;
}

export function TopBar({ title, liveCount }: TopBarProps) {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setHelpOpen = useAppStore((s) => s.setHelpOpen);
  const setPalette = useAppStore((s) => s.setPalette);
  const { mobile } = useBreakpoints();

  return (
    <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-border px-4 pt-[var(--safe-t)] sm:min-h-16 sm:px-6">
      <h1 className="min-w-0 flex-1 truncate text-base font-extrabold text-text sm:flex-none sm:shrink-0 sm:text-lg">
        {title}
      </h1>
      {liveCount !== undefined && (
        <span className="hidden shrink-0 sm:inline-flex">
          <LivePill count={liveCount} label="live · updated" />
        </span>
      )}

      <div className="flex shrink-0 items-center gap-1 sm:ml-auto sm:gap-3">
        {mobile ? (
          // A 96px text field that squeezed out the page title isn't a search
          // experience. On mobile the field collapses to a button that opens
          // the palette full-screen, where there's room to actually type.
          <IconButton icon="search" label="Search" onClick={() => setPalette(true)} bare />
        ) : (
          <div className="flex min-w-0 items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5">
            <Icon name="search" size={15} className="shrink-0 text-dim" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              aria-label="Search"
              className="w-40 min-w-0 bg-transparent text-sm text-text outline-none placeholder:text-dim lg:w-56"
            />
            <span className="shrink-0 rounded bg-chip px-1.5 py-0.5 text-[10px] font-semibold text-chip-text">
              ⌘K
            </span>
          </div>
        )}
        {!mobile && (
          <IconButton icon="help" label="Keyboard shortcuts" onClick={() => setHelpOpen(true)} />
        )}
      </div>
    </header>
  );
}
