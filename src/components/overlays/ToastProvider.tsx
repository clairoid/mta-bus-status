import { useCallback, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "./toast-context";
import { Icon, type IconName } from "../ui/Icon";

interface ToastState {
  id: number;
  message: string;
  icon?: IconName;
}

// README: bottom-center toast, auto-dismiss ~2.3s, contextual icon.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, icon?: IconName) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = ++idRef.current;
    setToast({ id, message, icon });
    timerRef.current = setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 2300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
          // A flat bottom-8 put every confirmation *behind* the mobile tab
          // bar. Clear the bar (and the home indicator) instead.
          style={{ bottom: "calc(var(--tabbar-total) + 1.5rem)" }}
          role="status"
          aria-live="polite"
        >
          <div className="flex max-w-full items-center gap-2 rounded-pill border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text shadow-popover [animation:overlayUp_0.3s]">
            {toast.icon && <Icon name={toast.icon} size={16} className="shrink-0 text-accent" />}
            <span className="truncate">{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
