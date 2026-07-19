import { useEffect, useMemo, useState } from "react";
import { useRouteCatalog } from "../../hooks/useRouteCatalog";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "./toast-context";
import { routeColor } from "../../lib/data/routeColors";

// "Manage lines": search the full MTA catalog and add/remove the routes the
// app follows. Selections live in myRoutes (persisted + account-synced).
export function RoutePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { routes, loading } = useRouteCatalog();
  const myRoutes = useAppStore((s) => s.myRoutes);
  const addRoute = useAppStore((s) => s.addRoute);
  const removeRoute = useAppStore((s) => s.removeRoute);
  const { showToast } = useToast();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const mine = useMemo(() => new Set(myRoutes), [myRoutes]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? routes.filter((r) => r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
      : routes;
    // Show followed lines first when browsing unfiltered.
    return q ? list.slice(0, 120) : [...list].sort((a, b) => Number(mine.has(b.id)) - Number(mine.has(a.id))).slice(0, 120);
  }, [routes, query, mine]);

  if (!open) return null;

  const toggle = (id: string) => {
    if (mine.has(id)) {
      removeRoute(id);
      showToast(`${id} removed`, "✓");
    } else {
      addRoute(id);
      showToast(`${id} added`, "📍");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[8vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card border border-border bg-card shadow-popover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div>
            <div className="text-sm font-bold text-text">Manage lines</div>
            <div className="text-[11px] text-dim">
              {myRoutes.length} followed · {routes.length || "…"} MTA routes
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto rounded-control px-2 py-1 text-dim hover:bg-chip hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a line — B41, Q35, Kings Plaza…"
            className="w-full rounded-control border border-border bg-shell px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-dim focus-visible:border-accent"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-dim">Loading MTA routes…</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-dim">No lines match “{query}”.</div>
          ) : (
            results.map((r) => {
              const following = mine.has(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggle(r.id)}
                  className="flex w-full items-center gap-3 border-t border-border px-4 py-2.5 text-left first:border-t-0 hover:bg-chip"
                >
                  <span
                    className="w-14 shrink-0 rounded-[5px] py-1 text-center text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: routeColor(r.id) }}
                  >
                    {r.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-text2">{r.name}</span>
                  <span
                    className={`shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                      following ? "bg-accent-soft text-accent" : "bg-chip text-chip-text"
                    }`}
                  >
                    {following ? "Following" : "+ Add"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
