import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import type { LiveMap } from "./LiveMap";

// Lazy-load LiveMap so mapbox-gl (the largest dependency) is split into its
// own chunk and only fetched when the map view is actually opened.
const LiveMapImpl = lazy(() =>
  import("./LiveMap").then((m) => ({ default: m.LiveMap }))
);

export function LiveMapLazy(props: ComponentProps<typeof LiveMap>) {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-[360px] flex-1 items-center justify-center overflow-hidden rounded-[16px] bg-[#0d0e14] text-sm text-white/60">
          Loading map…
        </div>
      }
    >
      <LiveMapImpl {...props} />
    </Suspense>
  );
}
