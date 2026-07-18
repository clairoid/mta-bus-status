import { useEffect, useState, type ReactNode } from "react";
import { useAppStore } from "../store/useAppStore";
import { TickContext } from "./tick-context";

// Single 1s interval feeding every CountdownTime / map bus marker in the
// app, rather than each running its own interval. Halts when reduce-motion
// is on, per README's "kill JS-driven bus drift" requirement.
export function TickProvider({ children }: { children: ReactNode }) {
  const [elapsed, setElapsed] = useState(0);
  const reduceMotion = useAppStore((s) => s.a11y.reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return <TickContext.Provider value={elapsed}>{children}</TickContext.Provider>;
}
