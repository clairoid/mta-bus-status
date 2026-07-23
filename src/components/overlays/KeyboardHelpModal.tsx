import { useAppStore } from "../../store/useAppStore";
import { IconButton } from "../ui/IconButton";

const SHORTCUTS: [string, string][] = [
  ["1–9", "Jump to section"],
  ["⌘K / Ctrl+K", "Command palette"],
  ["?", "This help"],
  ["G", "Settings"],
  ["T", "Toggle theme"],
  ["M / L", "Map / List view"],
  ["Esc", "Close overlay"],
];

// README: modal listing shortcuts. Click-inside must not close
// (stopPropagation); ✕ / click-away / Esc close.
export function KeyboardHelpModal() {
  const open = useAppStore((s) => s.helpOpen);
  const setHelpOpen = useAppStore((s) => s.setHelpOpen);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 [animation:fadeIn_0.3s]"
      onClick={() => setHelpOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-card border border-border bg-card p-5 shadow-popover [animation:overlayUp_0.35s]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">Keyboard shortcuts</h2>
          <IconButton icon="close" label="Close" onClick={() => setHelpOpen(false)} bare />
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-text2">{desc}</span>
              <kbd className="rounded bg-chip px-2 py-0.5 font-mono text-[11px] font-semibold text-chip-text">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
