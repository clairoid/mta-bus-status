import { NavLink } from "react-router-dom";
import { MOBILE_TABS } from "../../lib/nav";

export function BottomTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-border bg-sidebar">
      {MOBILE_TABS.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.path}
          end={tab.path === "/"}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium ${
              isActive ? "text-accent" : "text-dim"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-7 w-10 items-center justify-center rounded-pill text-base ${
                  isActive ? "scale-110 bg-accent-soft" : ""
                }`}
              >
                {tab.icon}
              </span>
              {tab.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
