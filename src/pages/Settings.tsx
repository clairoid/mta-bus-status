import type { ReactNode } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { Toggle } from "../components/ui/Toggle";
import { Overline } from "../components/ui/Overline";
import { RouteBadge } from "../components/ui/RouteBadge";
import { useTheme } from "../lib/theme/theme-context";
import { useAppStore } from "../store/useAppStore";
import { useRouteName } from "../hooks/useRouteCatalog";
import { InstallCard } from "../components/pwa/InstallCard";
import { PushCard } from "../components/pwa/PushCard";


function SettingRow({ label, sublabel, control }: { label: string; sublabel?: string; control: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-text">{label}</div>
        {sublabel && <div className="text-[11px] text-dim">{sublabel}</div>}
      </div>
      {control}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <Overline>{title}</Overline>
      <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-card">{children}</div>
    </div>
  );
}

// README Settings: Appearance, Notifications, per-route Route Alerts, About.
// Two-column, collapses to one on mobile.
export function Settings() {
  const { theme, toggleTheme } = useTheme();
  // Selector-scoped rather than `useAppStore()`, which subscribed this page to
  // every store change (including each search keystroke).
  const heatmap = useAppStore((st) => st.heatmap);
  const toggleHeatmap = useAppStore((st) => st.toggleHeatmap);
  const pushAlerts = useAppStore((st) => st.pushAlerts);
  const setPushAlerts = useAppStore((st) => st.setPushAlerts);
  const myRoutes = useAppStore((st) => st.myRoutes);
  const routeAlerts = useAppStore((st) => st.routeAlerts);
  const toggleRouteAlert = useAppStore((st) => st.toggleRouteAlert);
  const s = { heatmap, toggleHeatmap, pushAlerts, setPushAlerts, myRoutes, routeAlerts, toggleRouteAlert };
  const routeName = useRouteName();

  return (
    <PageShell title="Settings">
      <div className="mx-auto grid max-w-[820px] grid-cols-1 gap-5 min-[860px]:grid-cols-2">
        <div className="space-y-5">
          <InstallCard />
          <Card title="Appearance">
            <SettingRow
              label="Dark mode"
              control={<Toggle on={theme === "dark"} onChange={toggleTheme} label="Dark mode" />}
            />
            <SettingRow
              label="Crowding heatmap"
              sublabel="Show bus density on the map"
              control={<Toggle on={s.heatmap} onChange={s.toggleHeatmap} label="Crowding heatmap" />}
            />
          </Card>

          <div className="space-y-2.5">
            <Overline>Notifications</Overline>
            <PushCard />
          </div>
          {/* "Sound alerts", "Arrival push" and "Weekly summary" used to live
              here too. They persisted and synced but nothing consumed them —
              there is no arrival-push or weekly-digest backend — so they were
              controls that quietly did nothing. Removed until the features
              exist. "Service alerts" stays because it genuinely gates the push
              subscription's route filter. */}
          <Card title="Notification preferences">
            <SettingRow
              label="Service alerts"
              sublabel="Push when a line you follow has a disruption"
              control={<Toggle on={s.pushAlerts} onChange={s.setPushAlerts} label="Service alerts" />}
            />
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Route alerts">
            {s.myRoutes.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-dim">
                No lines followed — add some from the Routes screen.
              </div>
            ) : (
              s.myRoutes.map((r) => (
                <div
                  key={r}
                  className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0"
                >
                  <RouteBadge routeId={r} />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-text2">{routeName(r)}</span>
                  <Toggle
                    on={!!s.routeAlerts[r]}
                    onChange={() => s.toggleRouteAlert(r)}
                    label={`${r} alerts`}
                  />
                </div>
              ))
            )}
            {!s.pushAlerts && s.myRoutes.length > 0 && (
              <div className="border-t border-border px-4 py-2.5 text-[11px] text-dim">
                Service alerts are off, so these won't send.
              </div>
            )}
          </Card>

          <Card title="About">
            <div className="px-4 py-3 text-[13px] leading-relaxed text-dim">
              MTA Bus Status — live NYC bus tracking. Real-time data from MTA Bus Time (SIRI) and
              GTFS-Realtime. Rebuilt from the design handoff.
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
