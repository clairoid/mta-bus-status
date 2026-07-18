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

export function StopCardSkeleton() {
  return <Skeleton className="h-[120px] w-full" />;
}
