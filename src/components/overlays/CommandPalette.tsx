import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { useTheme } from "../../lib/theme/theme-context";
import { NAV_ENTRIES, SETTINGS_ENTRY } from "../../lib/nav";

interface Command {
  id: string;
  label: string;
  icon: string;
  hint: string;
  run: () => void;
}

// README: ⌘K palette searchable across pages + quick actions; type to
// filter, click to run, Esc closes. (Stop search folds in once a shared
// stop index exists — pages + actions for now.)
export function CommandPalette() {
  const open = useAppStore((s) => s.paletteOpen);
  const setPalette = useAppStore((s) => s.setPalette);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      inputRef.current?.focus();
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
        icon: "🌓",
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[12vh] [animation:fadeIn_0.3s]"
      onClick={() => setPalette(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-card border border-border bg-card shadow-popover [animation:overlayUp_0.35s]"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages and actions…"
          className="w-full border-b border-border bg-transparent px-4 py-3.5 text-sm text-text outline-none placeholder:text-dim"
        />
        <div className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-dim">No matches</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={c.run}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text hover:bg-chip"
              >
                <span className="text-base">{c.icon}</span>
                <span className="flex-1">{c.label}</span>
                <span className="text-[10px] uppercase tracking-wide text-dim">{c.hint}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
