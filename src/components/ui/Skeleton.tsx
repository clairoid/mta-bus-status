interface SkeletonProps {
  className?: string;
}

// README skeleton: shimmer block, used for per-page + initial-boot loading.
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-card [animation:shimmer_1.3s_linear_infinite] ${className}`}
      style={{
        background:
          "linear-gradient(90deg, var(--chip) 25%, var(--chip-soft) 50%, var(--chip) 75%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

// Mirrors StopCard's actual anatomy (header row + two arrival rows) rather
// than being one flat block, so the swap to real content doesn't jump.
export function StopCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-2/3 rounded" />
          <Skeleton className="h-2.5 w-16 rounded" />
        </div>
        <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-2 border-t border-border px-4 py-3 first:border-t-0">
          <Skeleton className="h-5 w-9 shrink-0 rounded-[6px]" />
          <Skeleton className="h-3 flex-1 rounded" />
          <Skeleton className="h-4 w-10 shrink-0 rounded" />
        </div>
      ))}
    </div>
  );
}
