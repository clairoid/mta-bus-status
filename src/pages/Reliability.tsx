import { PageShell } from "../components/chrome/PageShell";
import { ReliabilityCard } from "../components/cards/ReliabilityCard";
import { Skeleton } from "../components/ui/Skeleton";
import { useReliability } from "../hooks/useReliability";

// README Reliability: 3-col route cards (on-time %, trend bars, counts).
// Mock-backed until a reliability-analytics backend exists.
export function Reliability() {
  const { reliability, loading } = useReliability();

  return (
    <PageShell title="Reliability">
      {loading ? (
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2 min-[1080px]:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2 min-[1080px]:grid-cols-3">
          {reliability.map((entry) => (
            <ReliabilityCard key={entry.route} entry={entry} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
