import { useMemo } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { StatTile } from "../components/cards/StatTile";
import { SavedPlaceRow } from "../components/cards/SavedPlaceRow";
import { Overline } from "../components/ui/Overline";
import { AuthPanel } from "../components/auth/AuthPanel";
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "../lib/supabase/auth-context";

// README Profile: avatar, name/email, live stat tiles (favorites / routes /
// saved views), saved Home & Work places. Now backed by the real signed-in
// Supabase user; when auth is unavailable or signed-out it prompts to sign in.
export function Profile() {
  const { enabled, user, profile, loading, signOut } = useAuth();
  const fav = useAppStore((s) => s.fav);
  const tracked = useAppStore((s) => s.tracked);
  const savedViews = useAppStore((s) => s.savedViews);

  const favCount = useMemo(() => Object.values(fav).filter(Boolean).length, [fav]);
  const trackedCount = useMemo(() => Object.values(tracked).filter(Boolean).length, [tracked]);

  // Signed out (with auth available) → show the sign-in panel.
  if (enabled && !loading && !user) {
    return (
      <PageShell title="Profile">
        <AuthPanel />
      </PageShell>
    );
  }

  const email = user?.email ?? "";
  const name = profile?.display_name || email.split("@")[0] || "Rider";
  const initials =
    name
      .split(/[\s.]+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "🚌";
  const home = profile?.home ?? { label: "Not set", lat: 0, lon: 0 };
  const work = profile?.work ?? { label: "Not set", lat: 0, lon: 0 };

  return (
    <PageShell title="Profile">
      <div className="mx-auto max-w-[640px] space-y-5">
        <div className="flex items-center gap-4 rounded-card border border-border bg-card p-5">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold text-white"
            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-bold text-text">{name}</div>
            <div className="truncate text-sm text-dim">{email || "Signed in"}</div>
          </div>
          {user && (
            <button
              type="button"
              onClick={signOut}
              className="shrink-0 rounded-control border border-border px-3 py-1.5 text-xs font-semibold text-text2 hover:bg-chip"
            >
              Sign out
            </button>
          )}
        </div>

        <div className="flex justify-around rounded-card border border-border bg-card p-5 text-center">
          <StatTile value={favCount} label="Favorites" />
          <StatTile value={trackedCount} label="Tracked routes" />
          <StatTile value={savedViews.length} label="Saved views" />
        </div>

        <div>
          <Overline>Saved places</Overline>
          <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-card">
            <SavedPlaceRow icon="🏠" label="Home" sublabel={home.label} />
            <SavedPlaceRow icon="💼" label="Work" sublabel={work.label} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
