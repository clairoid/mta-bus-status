import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { useBreakpoints } from "../../hooks/useMediaQuery";

// README: "App shell: centered, max-width 1360px, height min(880px, 92vh),
// radius 18px. On mobile (<=560px) it goes full-screen (100vh, no radius)
// with 60-64px bottom padding for the tab bar."
export function AppShell({ children }: { children: ReactNode }) {
  const { iconRailSidebar, mobile } = useBreakpoints();

  return (
    <div className="flex h-screen items-center justify-center bg-shell p-0 sm:p-6">
      <div
        className={`flex w-full overflow-hidden border border-border-outer bg-shell shadow-shell ${
          mobile ? "h-screen rounded-none" : "h-[min(880px,92vh)] max-w-[1360px] rounded-shell"
        }`}
      >
        {!mobile && <Sidebar iconOnly={iconRailSidebar} />}
        <main className={`flex flex-1 flex-col overflow-hidden ${mobile ? "pb-16" : ""}`}>
          {children}
        </main>
        {mobile && <BottomTabBar />}
      </div>
    </div>
  );
}
