import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface Place {
  label: string;
  lat: number;
  lon: number;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  home: Place | null;
  work: Place | null;
}

export interface AuthState {
  enabled: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<Profile, "id">>) => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
