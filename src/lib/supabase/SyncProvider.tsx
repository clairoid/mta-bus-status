import { useEffect, useRef, type ReactNode } from "react";
import { supabase } from "./client";
import { useAuth } from "./auth-context";
import { useAppStore, snapshotPersisted, hydratePersisted } from "../../store/useAppStore";

const DEBOUNCE_MS = 1200;

// Syncs the durable store slice to Supabase `user_state` for the signed-in
// user. On login: an empty account is seeded from local state (so anonymous
// data carries into a new account); a populated account is the source of
// truth and hydrates the store. Then durable changes are pushed up, debounced.
export function SyncProvider({ children }: { children: ReactNode }) {
  const userId = useAuth().user?.id ?? null;
  const hydratingRef = useRef(false);
  const lastJsonRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!supabase || !userId) return;
    const db = supabase;
    let active = true;

    // Must await/execute the builder — a supabase-js query only fires the
    // request when awaited, so a bare `setTimeout(push)` would never send.
    const push = async () => {
      const { error } = await db
        .from("user_state")
        .upsert({ user_id: userId, state: snapshotPersisted(), updated_at: new Date().toISOString() });
      if (error) console.warn("[sync] user_state push failed:", error.message);
    };

    (async () => {
      const { data } = await db.from("user_state").select("state").eq("user_id", userId).maybeSingle();
      if (!active) return;
      const remote = (data?.state ?? {}) as Record<string, unknown>;
      if (Object.keys(remote).length === 0) {
        await push(); // new/empty account — seed from local
      } else {
        hydratingRef.current = true;
        hydratePersisted(remote);
        hydratingRef.current = false;
      }
      lastJsonRef.current = JSON.stringify(snapshotPersisted());
    })();

    const unsub = useAppStore.subscribe(() => {
      if (hydratingRef.current) return;
      // Only react to changes in the durable slice (ignore selectedStop,
      // search query, tick-driven UI state, etc.).
      const json = JSON.stringify(snapshotPersisted());
      if (json === lastJsonRef.current) return;
      lastJsonRef.current = json;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(push, DEBOUNCE_MS);
    });

    return () => {
      active = false;
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId]);

  return <>{children}</>;
}
