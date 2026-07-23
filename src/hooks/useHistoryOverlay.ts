import { useEffect, useRef } from "react";

// Makes an overlay dismissable with the browser / Android hardware Back
// button. Without this, Back on a phone exits the app entirely while a sheet
// is open, which is the most jarring thing a mobile web app can do.
//
// While `open`, we push a throwaway history entry on top of the current one
// (same URL, so the router doesn't re-render). Back pops it and closes the
// overlay instead of leaving the page.
//
// The close decision reads the *current* history state rather than assuming
// any popstate was ours. That matters because history.back() is asynchronous,
// and StrictMode's double-invoked effects (push → cleanup-back → push) would
// otherwise land a stale pop on the second listener and slam the sheet shut
// the instant it opened. Consequence of the shared marker: this supports one
// overlay at a time, which is all the app ever opens.
export function useHistoryOverlay(open: boolean, onClose: () => void): void {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    // Spread the existing state so react-router keeps its own `idx`/`key`
    // bookkeeping intact.
    window.history.pushState({ ...window.history.state, __overlay: true }, "");

    // Close only once the marker is actually gone from the top of the stack.
    const onPop = () => {
      if (!window.history.state?.__overlay) closeRef.current();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      // Only pop our own entry if it's still the current one. If the overlay
      // closed because the user navigated from inside it (tapping a link in
      // the More sheet), the top entry is the router's — calling back() there
      // would bounce them straight off the page they just asked for.
      if (window.history.state?.__overlay) window.history.back();
    };
  }, [open]);
}
