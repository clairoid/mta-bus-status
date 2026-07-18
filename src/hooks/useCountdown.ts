import { useMemo } from "react";
import { fmtSecs, timeColor } from "../lib/data/format";
import { useTick } from "./tick-context";

export interface Countdown {
  remaining: number;
  big: string;
  small: string;
  color: string;
}

// secs is the remaining time as of load; the shared 1s tick decrements it live.
export function useCountdown(secs: number | null, textColor = "var(--text)"): Countdown | null {
  const elapsed = useTick();
  return useMemo(() => {
    if (secs === null) return null;
    const remaining = Math.max(0, secs - elapsed);
    const { big, small } = fmtSecs(remaining);
    return { remaining, big, small, color: timeColor(remaining, textColor) };
  }, [secs, elapsed, textColor]);
}
