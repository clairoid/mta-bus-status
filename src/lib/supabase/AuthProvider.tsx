import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseEnabled } from "./client";
import { AuthContext, type AuthState, type Profile } from "./auth-context";

async function loadProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, home, work")
    .eq("id", userId)
    .maybeSingle();
  return (data as Profile) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isSupabaseEnabled);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load the profile row whenever the signed-in user changes.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let active = true;
    loadProfile(userId).then((p) => active && setProfile(p));
    return () => {
      active = false;
    };
  }, [userId]);

  const signUp = useCallback<AuthState["signUp"]>(async (email, password) => {
    if (!supabase) return { error: "Auth is not configured." };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback<AuthState["signIn"]>(async (email, password) => {
    if (!supabase) return { error: "Auth is not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const updateProfile = useCallback<AuthState["updateProfile"]>(
    async (patch) => {
      if (!supabase || !userId) return;
      const { data } = await supabase
        .from("profiles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select("id, display_name, avatar_url, home, work")
        .maybeSingle();
      if (data) setProfile(data as Profile);
    },
    [userId]
  );

  const value: AuthState = {
    enabled: isSupabaseEnabled,
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
