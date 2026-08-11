import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useBreakpoints } from "../../hooks/useMediaQuery";
import { useHistoryOverlay } from "../../hooks/useHistoryOverlay";
import { IconButton } from "../ui/IconButton";

type DesktopShape = "modal" | "drawer";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Slot rendered in the header row, right of the title. */
  headerAccessory?: ReactNode;
  /** How this renders at ≥560px. Mobile is always a bottom sheet. */
  desktop?: DesktopShape;
  /** Mobile height: hug the content (default) or take the full screen. */
  mobileHeight?: "auto" | "full";
  /**
   * Element to focus when the sheet opens, instead of the panel itself.
   * Racing the panel focus from the consumer (rAF, timeouts) is unreliable —
   * the palette's search input lost that race and ⌘K opened a box you
   * couldn't type into.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

const DISMISS_PX = 90;

// One overlay primitive for every sheet/drawer/modal in the app.
//
// On mobile this is a real bottom sheet: it animates up from the bottom edge,
// leaves the page visible behind it, sits above the tab bar, respects the home
// indicator, and can be flicked down to dismiss. Previously each overlay was a
// hand-rolled `fixed inset-0` panel that covered the tab bar completely and
// entered with a 16px nudge, so on a phone it read as a full-screen takeover
// with no way out but a 15px ✕.
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  headerAccessory,
  desktop = "modal",
  mobileHeight = "auto",
  initialFocusRef,
  children,
}: SheetProps) {
  const { mobile } = useBreakpoints();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);

  useHistoryOverlay(open, onClose);

  // Esc closes; focus moves into the sheet and returns where it came from.
  useEffect(() => {
    if (!open) return;
    // Don't steal focus from something inside the sheet. `onClose` is often a
    // fresh closure each render, so this effect re-runs constantly — it used to
    // yank focus back to the panel on every keystroke, which is why ⌘K opened
    // the palette but you couldn't type into it.
    if (!panelRef.current?.contains(document.activeElement)) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      (initialFocusRef?.current ?? panelRef.current)?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  useEffect(() => {
    if (!open) {
      setDrag(0);
      setDragging(false);
    }
  }, [open]);

  // Flick-to-dismiss. Only armed from the grab handle + header so it never
  // steals a scroll gesture from the sheet body.
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;
    setDragging(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStart.current === null) return;
    const dy = e.touches[0].clientY - dragStart.current;
    setDrag(dy > 0 ? dy : dy / 4); // resist upward travel
  }, []);

  const onTouchEnd = useCallback(() => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    setDragging(false);
    setDrag((d) => {
      if (d > DISMISS_PX) onClose();
      return 0;
    });
  }, [onClose]);

  if (!open) return null;

  const grabbable = mobile
    ? { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd }
    : {};

  const panelClasses = mobile
    ? [
        "w-full rounded-t-[20px] border-t border-border",
        mobileHeight === "full" ? "h-[92dvh]" : "max-h-[88dvh]",
        drag === 0 ? "[animation:sheetUp_0.28s_cubic-bezier(0.32,0.72,0,1)]" : "",
      ].join(" ")
    : desktop === "drawer"
      ? "h-full w-full max-w-[420px] border-l border-border [animation:overlayUp_0.3s]"
      : "w-full max-w-lg rounded-card border border-border [animation:overlayUp_0.3s]";

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-black/50 [animation:fadeIn_0.2s] ${
        mobile
          ? "items-end"
          : desktop === "drawer"
            ? "justify-end"
            : "items-start justify-center p-4 pt-[12vh]"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`flex min-h-0 flex-col bg-card shadow-drawer outline-none ${panelClasses}`}
        style={{
          transform: drag ? `translateY(${drag}px)` : undefined,
          // Follow the finger 1:1 while dragging; spring back once released.
          transition: dragging ? undefined : "transform 0.22s",
          // Clear the home indicator on mobile, the notch on a desktop drawer.
          paddingBottom: mobile ? "var(--safe-b)" : undefined,
          paddingTop: !mobile && desktop === "drawer" ? "var(--safe-t)" : undefined,
        }}
      >
        {mobile && (
          <div className="shrink-0 cursor-grab pt-2.5 pb-1" {...grabbable}>
            <div className="mx-auto h-1 w-9 rounded-full bg-dim/50" />
          </div>
        )}

        {(title || headerAccessory) && (
          <div
            className="flex shrink-0 items-start gap-3 border-b border-border px-5 pt-3 pb-3.5"
            {...grabbable}
          >
            <div className="min-w-0 flex-1">
              {title && <h2 className="truncate text-base font-bold text-text">{title}</h2>}
              {subtitle && <div className="mt-0.5 text-[11px] text-dim">{subtitle}</div>}
            </div>
            {headerAccessory}
            <IconButton icon="close" label="Close" onClick={onClose} />
          </div>
        )}

        <div data-scroll className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
