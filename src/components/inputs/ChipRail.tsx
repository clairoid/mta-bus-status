import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// Horizontal chip scroller. The dashboard rail used to clip chips dead at the
// viewport edge with no affordance — on a 375px screen two of the five route
// chips were simply invisible and nothing hinted they were there. This masks
// the trailing edge into a fade while there's more to scroll, and drops the
// mask once you reach the end.
export function ChipRail({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtEnd(el.scrollWidth - el.clientWidth - el.scrollLeft < 8);
  }, []);

  // Runs on every render so adding/removing chips re-measures too.
  useEffect(update);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  return (
    <div
      ref={ref}
      onScroll={update}
      data-at-end={atEnd}
      className={`no-scrollbar scroll-fade-x flex min-w-0 gap-2 overflow-x-auto py-0.5 ${className}`}
    >
      {children}
    </div>
  );
}
