import { useEffect, useRef, type ReactNode } from "react";
import { supabase } from "./client";
import { useAuth } from "./auth-context";
import {
  useAppStore,
  snapshotPersisted,
  hydratePersisted,
  sanitizePersisted,
  STATE_VERSION,
} from "../../store/useAppStore";

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
    // Set when the remote blob was written by a newer client; blocks writes for
    // the rest of the session so we can't persist a lossy downgrade.
    let readOnly = false;

    // Must await/execute the builder — a supabase-js query only fires the
    // request when awaited, so a bare `setTimeout(push)` would never send.
    const push = async () => {
      const { error } = await db.from("user_state").upsert({
        user_id: userId,
        state: { ...snapshotPersisted(), __v: STATE_VERSION },
        updated_at: new Date().toISOString(),
      });
      if (error) console.warn("[sync] user_state push failed:", error.message);
    };

    (async () => {
      const { data } = await db.from("user_state").select("state").eq("user_id", userId).maybeSingle();
      if (!active) return;
      const remote = (data?.state ?? {}) as Record<string, unknown>;
      const remoteVersion = typeof remote.__v === "number" ? remote.__v : 1;

      if (Object.keys(remote).length === 0) {
        await push(); // new/empty account — seed from local
      } else if (remoteVersion > STATE_VERSION) {
        // Written by a newer client than this one. Hydrating would drop fields
        // this build doesn't know about, and the next push would then persist
        // that loss. Read-only for this session instead.
        console.warn(`[sync] remote state v${remoteVersion} is newer than this client (v${STATE_VERSION}); not syncing`);
        readOnly = true;
        return;
      } else {
        hydratingRef.current = true;
        // sanitizePersisted drops unknown/mistyped keys rather than spreading
        // an arbitrary blob into the store.
        hydratePersisted(sanitizePersisted(remote));
        hydratingRef.current = false;
      }
      lastJsonRef.current = JSON.stringify(snapshotPersisted());
    })();

    const unsub = useAppStore.subscribe(() => {
      if (hydratingRef.current || readOnly) return;
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
