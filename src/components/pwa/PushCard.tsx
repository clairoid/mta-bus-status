import { useState } from "react";
import { Toggle } from "../ui/Toggle";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { useAuth } from "../../lib/supabase/auth-context";
import { useToast } from "../overlays/toast-context";

// Settings card that owns the actual Web Push subscription (browser permission
// + PushManager), separate from the per-type notification preference toggles.
export function PushCard() {
  const { supported, subscribed, busy, enable, disable, sendTest } = usePushNotifications();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [testing, setTesting] = useState(false);

  if (!supported) return null;

  const onToggle = async (on: boolean) => {
    if (on) {
      const { error } = await enable();
      showToast(error ? error : "Push notifications on", error ? "⚠️" : "🔔");
    } else {
      await disable();
      showToast("Push notifications off", "🔕");
    }
  };

  const onTest = async () => {
    setTesting(true);
    const { error } = await sendTest();
    setTesting(false);
    if (error) showToast(error, "⚠️");
  };

  return (
    <div className="rounded-card border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-text">Push notifications</div>
          <div className="text-[11px] text-dim">
            {user ? "Get alerts even when the app is closed" : "Sign in to enable push"}
          </div>
        </div>
        <Toggle on={subscribed} onChange={onToggle} label="Push notifications" />
      </div>
      <button
        type="button"
        disabled={!subscribed || testing || busy}
        onClick={onTest}
        className="w-full px-4 py-3 text-left text-[13px] font-semibold text-accent disabled:text-dim"
      >
        {testing ? "Sending…" : "Send test notification"}
      </button>
    </div>
  );
}
