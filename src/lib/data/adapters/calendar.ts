import type { CalendarData } from "../types";
import { CALENDAR } from "../mock/mta";

export interface CalendarSource {
  getCalendar(): Promise<CalendarData>;
}

export const mockCalendarSource: CalendarSource = {
  getCalendar: async () => CALENDAR,
};

// Swap in later: GTFS calendar.txt/calendar_dates.txt + Alerts with future active_period.
