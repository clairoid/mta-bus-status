import { useAppStore } from "../../store/useAppStore";

// README: offline banner driven by navigator.onLine + online/offline events.
export function OfflineBanner() {
  const offline = useAppStore((s) => s.offline);
  if (!offline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-red-strong px-4 py-1.5 text-xs font-semibold text-white">
      <span>⚠️</span>
      You're offline — showing last-known times
    </div>
  );
}
