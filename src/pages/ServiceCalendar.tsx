import { useMemo, useState } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { Overline } from "../components/ui/Overline";
import { IconButton } from "../components/ui/IconButton";
import {
  serviceCalendar,
  buildMonthGrid,
  upcomingExceptions,
  formatExceptionDate,
  parseCompact,
} from "../lib/data/serviceCalendar";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const CHANGE_COLOR = "var(--yellow)";

// Service Calendar: days whose schedule differs from the normal weekly
// pattern, from MTA GTFS static (regenerate with `npm run build:calendar`).
// The grid and "today" are computed live — the old mock froze both, so the
// calendar was stale the day after it was written.
export function ServiceCalendar() {
  const today = useMemo(() => new Date(), []);
  const [offset, setOffset] = useState(0);

  const viewed = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + offset, 1, 12),
    [today, offset]
  );

  const weeks = useMemo(
    () => buildMonthGrid(viewed.getFullYear(), viewed.getMonth(), serviceCalendar.exceptions, today),
    [viewed, today]
  );

  const upcoming = useMemo(() => upcomingExceptions(serviceCalendar.exceptions, today), [today]);

  const rangeEnd = parseCompact(serviceCalendar.rangeEnd);
  const monthLabel = viewed.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <PageShell title="Service Calendar">
      <div className="mx-auto grid max-w-[820px] grid-cols-1 gap-5 min-[860px]:grid-cols-[1.3fr_1fr]">
        <div className="rounded-card border border-border bg-card p-[18px]">
          <div className="mb-3.5 flex items-center justify-between gap-2">
            <div className="text-base font-extrabold text-text">{monthLabel}</div>
            <div className="flex items-center gap-1">
              {/* One chevron glyph, mirrored for "previous". */}
              <span className="inline-flex rotate-180">
                <IconButton icon="chevronRight" label="Previous month" onClick={() => setOffset((o) => o - 1)} bare />
              </span>
              <IconButton icon="chevronRight" label="Next month" onClick={() => setOffset((o) => o + 1)} bare />
              {offset !== 0 && (
                <button
                  type="button"
                  onClick={() => setOffset(0)}
                  className="ml-1 min-h-9 rounded-control px-2 text-[11px] font-semibold text-accent transition-colors hover:bg-chip"
                >
                  Today
                </button>
              )}
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold text-dim">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weeks.flat().map((cell, i) => {
              if (cell.day === null) return <span key={i} />;
              const { isToday, exception, inFeedRange } = cell;
              return (
                <span
                  key={i}
                  title={exception ? `${exception.label} (normally a ${exception.naturalType})` : undefined}
                  className="flex aspect-square items-center justify-center rounded-[9px] text-[13px] font-medium"
                  style={
                    isToday
                      ? { background: "var(--accent)", color: "#fff", fontWeight: 700 }
                      : exception
                        ? { background: `${CHANGE_COLOR}22`, color: CHANGE_COLOR, fontWeight: 700 }
                        : // Beyond the published schedule we genuinely don't
                          // know, so those days are dimmed rather than shown
                          // as if they were confirmed normal.
                          { color: inFeedRange ? "var(--text2)" : "var(--dim)", opacity: inFeedRange ? 1 : 0.45 }
                  }
                >
                  {cell.day}
                </span>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5 text-[11px] text-dim">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
              Today
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-dim">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHANGE_COLOR }} />
              Different schedule
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-dim">
              <span className="h-2.5 w-2.5 rounded-full bg-dim opacity-45" />
              Not yet published
            </span>
          </div>
        </div>

        <div>
          <Overline>Upcoming changes</Overline>
          <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-card">
            {upcoming.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-dim">
                No schedule changes in the published timetable.
              </div>
            ) : (
              upcoming.map((e) => (
                <div key={e.date} className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: CHANGE_COLOR }}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-text">{e.label}</div>
                    <div className="text-[11px] text-dim">
                      {formatExceptionDate(e.date)} · normally a {e.naturalType}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-dim">
            From the MTA's published timetable
            {rangeEnd
              ? `, which currently runs through ${rangeEnd.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`
              : ""}
            . Day-to-day disruptions appear on Service Alerts instead.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
