import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { useTheme } from "../../lib/theme/theme-context";
import { useBreakpoints } from "../../hooks/useMediaQuery";
import { NAV_ENTRIES, SETTINGS_ENTRY } from "../../lib/nav";
import { Icon, type IconName } from "../ui/Icon";
import { Sheet } from "./Sheet";

interface Command {
  id: string;
  label: string;
  icon: IconName;
  hint: string;
  run: () => void;
}

// README: ⌘K palette searchable across pages + quick actions; type to
// filter, click to run, Esc closes. (Stop search folds in once a shared
// stop index exists — pages + actions for now.)
//
// On mobile this doubles as the search surface: the TopBar's 96px input was
// unusable, so it now opens this instead.
export function CommandPalette() {
  const open = useAppStore((s) => s.paletteOpen);
  const setPalette = useAppStore((s) => s.setPalette);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { mobile } = useBreakpoints();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      // Wait a frame so the sheet is mounted before we pull focus (and the
      // keyboard) up.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const pages: Command[] = [...NAV_ENTRIES, SETTINGS_ENTRY].map((e) => ({
      id: `page-${e.id}`,
      label: e.label,
      icon: e.icon,
      hint: "Page",
      run: () => {
        navigate(e.path);
        setPalette(false);
      },
    }));
    const actions: Command[] = [
      {
        id: "action-theme",
        label: "Toggle theme",
        icon: "moon",
        hint: "Action",
        run: () => {
          toggleTheme();
          setPalette(false);
        },
      },
    ];
    return [...pages, ...actions];
  }, [navigate, setPalette, toggleTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  const close = () => setPalette(false);

  return (
    <Sheet open={open} onClose={close} mobileHeight="full">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card px-4 py-3">
        <Icon name="search" size={17} className="shrink-0 text-dim" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages and actions…"
          aria-label="Search pages and actions"
          className="min-w-0 flex-1 bg-transparent py-1 text-base text-text outline-none placeholder:text-dim sm:text-sm"
        />
        {mobile && (
          <button
            type="button"
            onClick={close}
            className="-mr-2 min-h-11 shrink-0 px-2 text-sm font-semibold text-dim active:text-text"
          >
            Cancel
          </button>
        )}
      </div>
      <div className={mobile ? "py-1" : "max-h-80 py-1"}>
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-dim">No matches</div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={c.run}
              className="flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text transition-colors hover:bg-chip active:bg-chip"
            >
              <Icon name={c.icon} size={17} className="shrink-0 text-text2" />
              <span className="flex-1 truncate">{c.label}</span>
              <span className="shrink-0 text-[10px] uppercase tracking-wide text-dim">{c.hint}</span>
            </button>
          ))
        )}
      </div>
    </Sheet>
  );
}
