import { useEffect, useRef } from "react";
import type { StopArrivals } from "../lib/data/types";

// Ported from legacy App.jsx: a synthesized oscillator beep (no audio file)
// fires once per arrival when it's 0-2 minutes out, gated by the `sound`
// store toggle. Dedupe keys are cleared once minutes climbs back above 4
// so the *next* bus on that route/destination alerts again too.
export function useAudioAlert(stops: StopArrivals[], enabled: boolean): void {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const firedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!enabled) return;

    stops.forEach((stop) => {
      stop.arrivals.forEach((a) => {
        if (a.minutes == null) return;
        const key = `${stop.stopId}-${a.route}-${a.destination}`;

        if (a.minutes > 4) {
          delete firedRef.current[key];
          return;
        }
        if (a.minutes <= 2 && a.minutes >= 0 && !firedRef.current[key]) {
          firedRef.current[key] = true;
          try {
            if (!audioCtxRef.current) {
              audioCtxRef.current = new AudioContext();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === "suspended") ctx.resume();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.type = "sine";
            gain.gain.value = 0.3;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.stop(ctx.currentTime + 0.5);
          } catch {
            // Web Audio unavailable/blocked — silently skip the alert.
          }
        }
      });
    });
  }, [stops, enabled]);
}
