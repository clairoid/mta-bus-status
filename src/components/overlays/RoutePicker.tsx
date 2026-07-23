import { useMemo, useState } from "react";
import { useRouteCatalog } from "../../hooks/useRouteCatalog";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "./toast-context";
import { routeColor } from "../../lib/data/routeColors";
import { useBreakpoints } from "../../hooks/useMediaQuery";
import { Icon } from "../ui/Icon";
import { Sheet } from "./Sheet";

// "Manage lines": search the full MTA catalog and add/remove the routes the
// app follows. Selections live in myRoutes (persisted + account-synced).
export function RoutePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { routes, loading } = useRouteCatalog();
  const myRoutes = useAppStore((s) => s.myRoutes);
  const addRoute = useAppStore((s) => s.addRoute);
  const removeRoute = useAppStore((s) => s.removeRoute);
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const { mobile } = useBreakpoints();

  const mine = useMemo(() => new Set(myRoutes), [myRoutes]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? routes.filter((r) => r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
      : routes;
    // Show followed lines first when browsing unfiltered.
    return q ? list.slice(0, 120) : [...list].sort((a, b) => Number(mine.has(b.id)) - Number(mine.has(a.id))).slice(0, 120);
  }, [routes, query, mine]);

  const toggle = (id: string) => {
    if (mine.has(id)) {
      removeRoute(id);
      showToast(`${id} removed`, "check");
    } else {
      addRoute(id);
      showToast(`${id} added`, "plus");
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Manage lines"
      subtitle={`${myRoutes.length} followed · ${routes.length || "…"} MTA routes`}
      mobileHeight="full"
    >
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <input
          // autoFocus yanks up the on-screen keyboard the instant the sheet
          // opens on a phone, covering the results it's meant to filter.
          autoFocus={!mobile}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a line — B41, Q35, Kings Plaza…"
          aria-label="Search MTA lines"
          className="w-full rounded-control border border-border bg-shell px-3.5 py-3 text-sm text-text outline-none placeholder:text-dim focus-visible:border-accent"
        />
      </div>

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
              aria-pressed={following}
              className="flex min-h-14 w-full items-center gap-3 border-t border-border px-4 py-2.5 text-left transition-colors first:border-t-0 hover:bg-chip active:bg-chip"
            >
              <span
                className="w-14 shrink-0 rounded-[5px] py-1 text-center text-[11px] font-extrabold text-white"
                style={{ backgroundColor: routeColor(r.id) }}
              >
                {r.id}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-text2">{r.name}</span>
              <span
                className={`flex shrink-0 items-center gap-1 rounded-pill px-2.5 py-1.5 text-[11px] font-bold ${
                  following ? "bg-accent-soft text-accent" : "bg-chip text-chip-text"
                }`}
              >
                <Icon name={following ? "check" : "plus"} size={12} />
                {following ? "Following" : "Add"}
              </span>
            </button>
          );
        })
      )}
    </Sheet>
  );
}
