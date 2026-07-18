import { useEffect, type ReactNode } from "react";
import { useAppStore } from "../../store/useAppStore";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const a11y = useAppStore((s) => s.a11y);
  const textSize = useAppStore((s) => s.textSize);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("high-contrast", a11y.highContrast);
    root.classList.toggle("bold-text", a11y.boldText);
    root.classList.toggle("reduce-motion", a11y.reduceMotion);
    root.classList.toggle("large-tap", a11y.largeTap);
  }, [a11y]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize * 100}%`;
  }, [textSize]);

  return <>{children}</>;
}
