import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/chrome/PageShell";
import { EmptyState } from "../components/ui/EmptyState";

// vercel.json rewrites every non-/api path to index.html, so any typo'd or
// stale URL reaches the router. Without a catch-all it rendered the app chrome
// around an empty content area, which reads as a broken page.
export function NotFound() {
  const navigate = useNavigate();

  return (
    <PageShell title="Not found">
      <EmptyState
        icon="compass"
        title="That page doesn't exist"
        subtitle="The link may be out of date, or the address mistyped."
        action={
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex min-h-11 items-center rounded-control bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-95"
          >
            Back to Dashboard
          </button>
        }
      />
    </PageShell>
  );
}
