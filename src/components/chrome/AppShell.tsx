import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { MoreSheet } from "./MoreSheet";
import { useBreakpoints } from "../../hooks/useMediaQuery";

// The shell fills the whole browser window. The handoff specified a centered
// max-width:1360px / height:min(880px,92vh) "card", but that left big empty
// margins on large displays; filling the viewport reads like a normal web
// app. The responsive sidebar → icon-rail → mobile tab-bar breakpoints still
// apply within.
export function AppShell({ children }: { children: ReactNode }) {
  const { iconRailSidebar, mobile } = useBreakpoints();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    // h-app is 100dvh (100vh fallback). Plain 100vh is measured against the
    // *expanded* mobile viewport, so on iOS Safari / Android Chrome the bottom
    // of the app — tab bar included — hid behind the browser toolbar.
    <div className="flex h-app w-full overflow-hidden bg-shell">
      {!mobile && <Sidebar iconOnly={iconRailSidebar} />}
      <main
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
        style={mobile ? { paddingBottom: "var(--tabbar-total)" } : undefined}
      >
        {children}
      </main>
      {mobile && (
        <>
          <BottomTabBar onOpenMore={() => setMoreOpen(true)} moreActive={moreOpen} />
          <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
        </>
      )}
    </div>
  );
}
