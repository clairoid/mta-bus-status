import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export function useOnlineStatus(): void {
  const setOffline = useAppStore((s) => s.setOffline);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [setOffline]);
}
