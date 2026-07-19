import type { ReactNode } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { Toggle } from "../components/ui/Toggle";
import { Overline } from "../components/ui/Overline";
import { RouteBadge } from "../components/ui/RouteBadge";
import { useTheme } from "../lib/theme/theme-context";
import { useAppStore } from "../store/useAppStore";
import { ROUTES } from "../lib/data/mock/mta";
import { InstallCard } from "../components/pwa/InstallCard";

const ALL_ROUTES = Object.keys(ROUTES);

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
  const s = useAppStore();

  return (
    <PageShell title="Settings">
      <div className="grid max-w-[820px] grid-cols-1 gap-5 min-[860px]:grid-cols-2">
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

          <Card title="Notifications">
            <SettingRow label="Sound alerts" control={<Toggle on={s.sound} onChange={s.setSound} label="Sound alerts" />} />
            <SettingRow label="Arrival push" control={<Toggle on={s.pushArrivals} onChange={s.setPushArrivals} label="Arrival push" />} />
            <SettingRow label="Service alerts" control={<Toggle on={s.pushAlerts} onChange={s.setPushAlerts} label="Service alerts" />} />
            <SettingRow label="Weekly summary" control={<Toggle on={s.pushWeekly} onChange={s.setPushWeekly} label="Weekly summary" />} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Route alerts">
            {ALL_ROUTES.map((r) => (
              <div
                key={r}
                className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0"
              >
                <RouteBadge routeId={r} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-text2">{ROUTES[r].name}</span>
                <Toggle on={!!s.routeAlerts[r]} onChange={() => s.toggleRouteAlert(r)} label={`${r} alerts`} />
              </div>
            ))}
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
