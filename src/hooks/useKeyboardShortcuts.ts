import { useEffect } from "react";

export interface KeyboardShortcutHandlers {
  onDigit?: (n: number) => void;
  onPalette?: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
  onTheme?: () => void;
  onMapView?: () => void;
  onListView?: () => void;
  onEscape?: () => void;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable
  );
}

// README: "1-9 jump to sections; ⌘K palette; ? help; G settings; T theme;
// M/L map/list; Esc closes topmost overlay. Do not trigger single-key
// shortcuts while typing in an input."
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handlers.onEscape?.();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handlers.onPalette?.();
        return;
      }

      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key >= "1" && e.key <= "9") {
        handlers.onDigit?.(Number(e.key));
        return;
      }
      switch (e.key.toLowerCase()) {
        case "?":
          handlers.onHelp?.();
          break;
        case "g":
          handlers.onSettings?.();
          break;
        case "t":
          handlers.onTheme?.();
          break;
        case "m":
          handlers.onMapView?.();
          break;
        case "l":
          handlers.onListView?.();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
