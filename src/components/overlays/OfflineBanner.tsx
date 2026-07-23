import { useAppStore } from "../../store/useAppStore";
import { Icon } from "../ui/Icon";

// README: offline banner driven by navigator.onLine + online/offline events.
export function OfflineBanner() {
  const offline = useAppStore((s) => s.offline);
  if (!offline) return null;

  return (
    <div
      role="status"
      className="flex shrink-0 items-center justify-center gap-2 bg-red-strong px-4 py-1.5 text-xs font-semibold text-white"
    >
      <Icon name="offline" size={14} />
      You're offline — showing last-known times
    </div>
  );
}
