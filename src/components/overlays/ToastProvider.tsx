import { useCallback, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "./toast-context";

interface ToastState {
  id: number;
  message: string;
  icon?: string;
}

// README: bottom-center toast, auto-dismiss ~2.3s, contextual icon.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, icon?: string) => {
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
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center">
          <div className="flex items-center gap-2 rounded-pill border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text shadow-popover [animation:overlayUp_0.3s]">
            {toast.icon && <span>{toast.icon}</span>}
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
