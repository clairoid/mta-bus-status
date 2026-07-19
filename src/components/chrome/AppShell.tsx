import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { useBreakpoints } from "../../hooks/useMediaQuery";

// The shell fills the whole browser window. The handoff specified a centered
// max-width:1360px / height:min(880px,92vh) "card", but that left big empty
// margins on large displays; filling the viewport reads like a normal web
// app. The responsive sidebar → icon-rail → mobile tab-bar breakpoints still
// apply within.
export function AppShell({ children }: { children: ReactNode }) {
  const { iconRailSidebar, mobile } = useBreakpoints();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-shell">
      {!mobile && <Sidebar iconOnly={iconRailSidebar} />}
      <main
        className={`flex flex-1 flex-col overflow-hidden ${
          mobile ? "pb-[calc(4rem+env(safe-area-inset-bottom))]" : ""
        }`}
      >
        {children}
      </main>
      {mobile && <BottomTabBar />}
    </div>
  );
}
