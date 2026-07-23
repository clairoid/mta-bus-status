import { createContext, useContext } from "react";
import type { IconName } from "../ui/Icon";

export interface ToastContextValue {
  showToast: (message: string, icon?: IconName) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
