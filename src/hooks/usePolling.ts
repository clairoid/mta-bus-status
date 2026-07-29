import { useEffect } from "react";

/**
 * Shared polling loop for the live-data hooks.
 *
 * Two things every one of them previously got wrong by hand-rolling
 * `setInterval`:
 *   1. They kept polling in a hidden tab, forever. A single forgotten
 *      background tab generated sustained upstream load and drained battery.
 *   2. A slow response could overlap the next tick, stacking requests.
 *
 * Behaviour: fetches immediately on mount and whenever `fn` changes, pauses the
 * interval while the tab is hidden, catches up as soon as it's visible again,
 * and never runs two ticks concurrently.
 *
 * `fn` must be memoized (`useCallback`) — it's an effect dependency, so an
 * inline function would restart the loop on every render.
 */
export function usePolling(fn: () => Promise<unknown> | unknown, intervalMs: number, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let running = false;
    let cancelled = false;

    // `force` bypasses the visibility check. The *first* load must always run:
    // a tab restored in the background (session restore, cmd-click, PWA launch)
    // is hidden at mount, and gating the initial fetch on visibility would
    // leave it showing loading skeletons until the user focused it.
    const tick = async (force = false) => {
      if (running || cancelled) return;
      if (!force && document.hidden) return;
      running = true;
      try {
        await fn();
      } finally {
        running = false;
      }
    };

    const start = () => {
      if (timer === null) timer = setInterval(() => void tick(), intervalMs);
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibility = () => {
      if (cancelled) return;
      if (document.hidden) {
        stop();
      } else {
        void tick(); // catch up immediately on return
        start();
      }
    };

    void tick(true);
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fn, intervalMs, enabled]);
}
