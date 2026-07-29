import { useEffect, useState } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { Overline } from "../components/ui/Overline";
import { Skeleton } from "../components/ui/Skeleton";
import { dataSources } from "../lib/data/adapters";
import type { CalendarData } from "../lib/data/types";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const EVENT_COLORS: Record<string, string> = { alert: "var(--yellow)", holiday: "#ef4444" };

// README Service Calendar: month grid (today highlighted, event days
// color-coded) + legend + Upcoming list. Mock-backed for now.
export function ServiceCalendar() {
  const [cal, setCal] = useState<CalendarData | null>(null);

  useEffect(() => {
    let active = true;
    dataSources.calendar.getCalendar().then((c) => active && setCal(c));
    return () => {
      active = false;
    };
  }, []);

  if (!cal) {
    return (
      <PageShell title="Service Calendar">
        <Skeleton className="mx-auto h-80 w-full max-w-[820px]" />
      </PageShell>
    );
  }

  return (
    <PageShell title="Service Calendar">
      <div className="mx-auto grid max-w-[820px] grid-cols-1 gap-5 min-[860px]:grid-cols-[1.3fr_1fr]">
        {/* month grid */}
        <div className="rounded-card border border-border bg-card p-[18px]">
          <div className="mb-3.5 text-base font-extrabold text-text">{cal.month}</div>
          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold text-dim">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cal.weeks.flat().map((day, i) => {
              if (day === null) return <span key={i} />;
              const isToday = day === cal.today;
              const event = cal.events[day];
              return (
                <span
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-[9px] text-[13px] font-medium"
                  style={
                    isToday
                      ? { background: "var(--accent)", color: "#fff", fontWeight: 700 }
                      : event
                        ? { background: `${EVENT_COLORS[event]}22`, color: EVENT_COLORS[event], fontWeight: 700 }
                        : { color: "var(--text2)" }
                  }
                >
                  {day}
                </span>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {cal.legend.map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5 text-[11px] text-dim">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* upcoming */}
        <div>
          <Overline>Upcoming</Overline>
          <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-card">
            {cal.upcoming.map((u) => (
              <div key={u.label} className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: EVENT_COLORS[u.type] ?? "var(--accent)" }}
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-text">{u.label}</div>
                  <div className="text-[11px] text-dim">{u.day}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
