import { PageShell } from "../components/chrome/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import type { IconName } from "../components/ui/Icon";

interface ComingSoonProps {
  title: string;
  icon: IconName;
}

// Placeholder for screens not yet built out in the rewrite (see the
// phased build order in the rewrite plan) — swapped for the real page
// component one phase at a time.
export function ComingSoon({ title, icon }: ComingSoonProps) {
  return (
    <PageShell title={title}>
      <EmptyState icon={icon} title={`${title} is coming soon`} subtitle="This screen hasn't been rebuilt from the design handoff yet." />
    </PageShell>
  );
}
