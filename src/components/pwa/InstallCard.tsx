import { useState } from "react";
import { usePwaInstall } from "../../hooks/usePwaInstall";

// Shown in Settings: a one-tap install on Chrome/Android/desktop, or manual
// "Add to Home Screen" steps on iOS. Hidden once the app is installed.
export function InstallCard() {
  const { canInstall, isStandalone, isIOS, promptInstall } = usePwaInstall();
  const [iosOpen, setIosOpen] = useState(false);

  if (isStandalone) return null; // already installed
  if (!canInstall && !isIOS) return null; // no install path on this browser

  return (
    <div className="rounded-card border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-xl font-extrabold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
          M
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-text">Install Bus Status</div>
          <div className="text-[11px] text-dim">Add to your home screen for a full-screen app.</div>
        </div>
        {canInstall && (
          <button
            type="button"
            onClick={promptInstall}
            className="shrink-0 rounded-control bg-accent px-3.5 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
          >
            Install
          </button>
        )}
        {!canInstall && isIOS && (
          <button
            type="button"
            onClick={() => setIosOpen((o) => !o)}
            className="shrink-0 rounded-control border border-border px-3.5 py-2 text-xs font-semibold text-text2 hover:bg-chip"
          >
            How to
          </button>
        )}
      </div>
      {iosOpen && (
        <ol className="mt-3 space-y-1.5 border-t border-border pt-3 text-[12px] text-text2">
          <li>1. Tap the Share button <span aria-hidden>􀈂</span> in Safari's toolbar.</li>
          <li>2. Scroll and tap <b>Add to Home Screen</b>.</li>
          <li>3. Tap <b>Add</b> — Bus Status appears on your home screen.</li>
        </ol>
      )}
    </div>
  );
}
