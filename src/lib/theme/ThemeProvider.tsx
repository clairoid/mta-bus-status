import { useEffect, type ReactNode } from "react";
import { useAppStore } from "../../store/useAppStore";
import { ThemeContext } from "./theme-context";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    // Keep the mobile browser chrome (iOS status bar / Android address bar)
    // in step with the shell colour — a hardcoded dark theme-color leaves a
    // black bar sitting above a white app in light mode.
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#0b0b10" : "#fafaf9";
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
