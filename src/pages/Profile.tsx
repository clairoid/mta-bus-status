import { useMemo } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { StatTile } from "../components/cards/StatTile";
import { SavedPlaceRow } from "../components/cards/SavedPlaceRow";
import { Overline } from "../components/ui/Overline";
import { useAppStore } from "../store/useAppStore";

// README Profile: avatar, name/email, MetroCard/Fair-Fares tags, live stat
// tiles (favorites / routes / saved views), saved Home & Work places.
export function Profile() {
  const fav = useAppStore((s) => s.fav);
  const tracked = useAppStore((s) => s.tracked);
  const savedViews = useAppStore((s) => s.savedViews);

  const favCount = useMemo(() => Object.values(fav).filter(Boolean).length, [fav]);
  const trackedCount = useMemo(() => Object.values(tracked).filter(Boolean).length, [tracked]);

  return (
    <PageShell title="Profile">
      <div className="mx-auto max-w-[640px] space-y-5">
        <div className="flex items-center gap-4 rounded-card border border-border bg-card p-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold text-white" style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
            AR
          </span>
          <div>
            <div className="text-lg font-bold text-text">Alex Rivera</div>
            <div className="text-sm text-dim">alex.rivera@example.com</div>
            <div className="mt-2 flex gap-2">
              <span className="rounded-pill bg-chip px-2.5 py-0.5 text-[11px] font-semibold text-chip-text">MetroCard</span>
              <span className="rounded-pill bg-green-soft px-2.5 py-0.5 text-[11px] font-semibold text-green">Fair Fares</span>
            </div>
          </div>
        </div>

        <div className="flex justify-around rounded-card border border-border bg-card p-5 text-center">
          <StatTile value={favCount} label="Favorites" />
          <StatTile value={trackedCount} label="Tracked routes" />
          <StatTile value={savedViews.length} label="Saved views" />
        </div>

        <div>
          <Overline>Saved places</Overline>
          <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-card">
            <SavedPlaceRow icon="🏠" label="Home" sublabel="Court St, Brooklyn" />
            <SavedPlaceRow icon="💼" label="Work" sublabel="Kings Hwy, Brooklyn" />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
