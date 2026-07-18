import { useState } from "react";
import { useAuth } from "../../lib/supabase/auth-context";

// Email + password sign-in / sign-up. The user types their own credentials;
// this only renders the form and calls Supabase auth.
export function AuthPanel() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const fn = mode === "in" ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    if (mode === "up") {
      // If email confirmation is on, there's no session yet.
      setNotice("Account created. If email confirmation is on, check your inbox to finish.");
    }
  };

  return (
    <div className="mx-auto max-w-[420px] rounded-card border border-border bg-card p-6">
      <div className="mb-1 text-lg font-bold text-text">
        {mode === "in" ? "Sign in" : "Create account"}
      </div>
      <p className="mb-4 text-[13px] text-dim">
        {mode === "in"
          ? "Sign in to sync your favorites, saved views, and settings across devices."
          : "Create an account to save your data to the cloud."}
      </p>

      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-control border border-border bg-shell px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-dim focus-visible:border-accent"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-control border border-border bg-shell px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-dim focus-visible:border-accent"
        />

        {error && <div className="text-xs text-red">{error}</div>}
        {notice && <div className="text-xs text-green">{notice}</div>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-control bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "in" ? "up" : "in");
          setError(null);
          setNotice(null);
        }}
        className="mt-4 w-full text-center text-xs text-dim hover:text-text"
      >
        {mode === "in" ? "No account? Create one" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
