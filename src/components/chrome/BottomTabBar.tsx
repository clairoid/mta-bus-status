import { NavLink } from "react-router-dom";
import { MOBILE_TABS } from "../../lib/nav";
import { Icon } from "../ui/Icon";

const itemClasses =
  "flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-semibold transition-colors";

export function BottomTabBar({ onOpenMore, moreActive }: { onOpenMore: () => void; moreActive: boolean }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-sidebar pb-[var(--safe-b)]"
      style={{ minHeight: "calc(var(--tabbar-h) + var(--safe-b))" }}
    >
      {MOBILE_TABS.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.path}
          end={tab.path === "/"}
          className={({ isActive }) =>
            `${itemClasses} ${isActive ? "text-accent" : "text-dim active:text-text2"}`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-7 w-11 items-center justify-center rounded-pill transition-colors ${
                  isActive ? "bg-accent-soft" : ""
                }`}
              >
                {/* SVG, so the glyph tints with the active state — the old
                    emoji could only ever colour the label underneath it. */}
                <Icon name={tab.icon} size={20} strokeWidth={isActive ? 2.1 : 1.8} />
              </span>
              {tab.label}
            </>
          )}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={onOpenMore}
        aria-haspopup="dialog"
        aria-expanded={moreActive}
        className={`${itemClasses} ${moreActive ? "text-accent" : "text-dim active:text-text2"}`}
      >
        <span
          className={`flex h-7 w-11 items-center justify-center rounded-pill transition-colors ${
            moreActive ? "bg-accent-soft" : ""
          }`}
        >
          <Icon name="grid" size={20} strokeWidth={moreActive ? 2.1 : 1.8} />
        </span>
        More
      </button>
    </nav>
  );
}
