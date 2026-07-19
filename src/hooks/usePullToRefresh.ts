import { useEffect, useRef, useState } from "react";

const THRESHOLD = 70; // px pull distance to trigger
const MAX_PULL = 110;

interface PullState {
  pull: number; // current visual pull offset (px)
  refreshing: boolean;
}

// Pull-to-refresh for a scroll container. Only engages when scrolled to the
// top and pulled down; resists past a threshold, then fires onRefresh. Meant
// for touch / installed-standalone use (where the browser's native pull-to-
// refresh is unavailable).
export function usePullToRefresh(
  ref: React.RefObject<HTMLElement | null>,
  onRefresh: () => Promise<unknown> | void,
  enabled = true
): PullState {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const setPullValue = (v: number) => {
      pullRef.current = v;
      setPull(v);
    };

    const onStart = (e: TouchEvent) => {
      if (el.scrollTop <= 0 && !refreshingRef.current) startY.current = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0 || el.scrollTop > 0) {
        startY.current = null;
        setPullValue(0);
        return;
      }
      const dist = Math.min(MAX_PULL, dy * 0.5); // resistance curve
      setPullValue(dist);
      if (dist > 4 && e.cancelable) e.preventDefault();
    };
    const onEnd = async () => {
      if (startY.current === null) return;
      const shouldRefresh = pullRef.current >= THRESHOLD;
      startY.current = null;
      if (shouldRefresh) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPullValue(THRESHOLD);
        try {
          await onRefresh();
        } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          setPullValue(0);
        }
      } else {
        setPullValue(0);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [ref, onRefresh, enabled]);

  return { pull, refreshing };
}
