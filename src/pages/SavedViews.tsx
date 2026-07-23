import { PageShell } from "../components/chrome/PageShell";
import { SavedViewCard } from "../components/cards/SavedViewCard";
import { EmptyState } from "../components/ui/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { useToast } from "../components/overlays/toast-context";

// README Saved Views: "Save current view" button (captures active map
// routes, fires toast) + 2-col cards. Dashed empty state.
export function SavedViews() {
  const savedViews = useAppStore((s) => s.savedViews);
  const addSavedView = useAppStore((s) => s.addSavedView);
  const removeSavedView = useAppStore((s) => s.removeSavedView);
  const mapRoutes = useAppStore((s) => s.mapRoutes);
  const { showToast } = useToast();

  const saveCurrent = () => {
    addSavedView({
      id: `v${Date.now()}`,
      icon: "pin",
      name: `View ${savedViews.length + 1}`,
      routes: mapRoutes.length ? mapRoutes : ["B6"],
      meta: `${mapRoutes.length} routes · current map`,
    });
    showToast("View saved", "bookmark");
  };

  return (
    <PageShell title="Saved Views">
      <div className="mb-4">
        <button
          type="button"
          onClick={saveCurrent}
          className="flex min-h-11 items-center gap-1.5 rounded-control bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-95"
        >
          + Save current view
        </button>
      </div>

      {savedViews.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No saved views"
          subtitle="Save the current map routes as a view to jump back to them quickly."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 min-[860px]:grid-cols-2">
          {savedViews.map((view) => (
            <SavedViewCard key={view.id} view={view} onRemove={() => removeSavedView(view.id)} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
