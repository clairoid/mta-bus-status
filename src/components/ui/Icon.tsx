import type { ReactNode, SVGProps } from "react";

// A single inline stroke-icon set, replacing the emoji the rewrite used for
// iconography. Emoji render differently on every OS, can't be tinted by state
// (the tab bar could only ever colour the *label*, never the glyph), and read
// as placeholder art. These are 24×24, stroke `currentColor`, so they inherit
// text colour and any active/hover state for free.

export type IconName =
  // nav
  | "home"
  | "clock"
  | "alert"
  | "route"
  | "star"
  | "pin"
  | "bookmark"
  | "users"
  | "compass"
  | "list"
  | "calendar"
  | "chart"
  | "bus"
  | "megaphone"
  | "map"
  | "accessibility"
  | "bell"
  | "history"
  | "user"
  | "settings"
  | "grid"
  // ui
  | "search"
  | "close"
  | "help"
  | "moon"
  | "sun"
  | "refresh"
  | "flame"
  | "crosshair"
  | "expand"
  | "chevronRight"
  | "chevronDown"
  | "plus"
  | "check"
  | "briefcase"
  | "swap"
  | "offline"
  | "inbox";

const PATHS: Record<IconName, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4" />
      <path d="M12 17.2h.01" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2.6" />
      <circle cx="18" cy="5" r="2.6" />
      <path d="M9 19h7.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H15" />
    </>
  ),
  star: <path d="m12 3.2 2.85 5.78 6.4.93-4.63 4.5 1.1 6.36L12 17.77l-5.72 3-1.1-6.36L.55 9.91l6.4-.93z" />,
  pin: (
    <>
      <path d="M20 10.2c0 5.9-8 11.8-8 11.8s-8-5.9-8-11.8a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.8" />
    </>
  ),
  bookmark: <path d="m19 21-7-4.8L5 21V5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5z" />,
  users: (
    <>
      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="3.6" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.34a4 4 0 0 1 0 7.32" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16.1 7.9-2.1 6.2-6.2 2.1 2.1-6.2z" />
    </>
  ),
  list: (
    <>
      <path d="M8.5 6H21M8.5 12H21M8.5 18H21" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v16.5A1.5 1.5 0 0 0 4.5 21H21" />
      <path d="M7.5 16.5v-4M12 16.5v-8M16.5 16.5v-5.5" />
    </>
  ),
  bus: (
    <>
      <rect x="3" y="3.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M8 3.5v6.5M16 3.5v6.5M6.5 20v-3.5M17.5 20v-3.5" />
      <path d="M7 13.4h.01M17 13.4h.01" />
    </>
  ),
  megaphone: (
    <>
      <path d="m3 10.8 18-5.3v13.4L3 13.6z" />
      <path d="M3 10.8H2.4A1.4 1.4 0 0 0 1 12.2v.6a1.4 1.4 0 0 0 1.4 1.4H3" />
      <path d="M11.5 16.6a3 3 0 1 1-5.7-1.7" />
    </>
  ),
  map: (
    <>
      <path d="m3 6.5 6-3 6 3 6-3v14l-6 3-6-3-6 3z" />
      <path d="M9 3.5v14M15 6.5v14" />
    </>
  ),
  accessibility: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="7.6" r="1.15" fill="currentColor" stroke="none" />
      <path d="M7.8 10.7h8.4M12 10.7v4.1M9.6 19l2.4-4.2 2.4 4.2" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6.5-2.5 8-2.5 8h17S18 15 18 8.5" />
      <path d="M10.3 20a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  history: (
    <>
      <path d="M3.2 12a8.8 8.8 0 1 0 2.7-6.35L3 8.4" />
      <path d="M3 3.6v4.8h4.8" />
      <path d="M12 7.6V12l3 1.8" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-1.8a4.2 4.2 0 0 0-4.2-4.2H8.2A4.2 4.2 0 0 0 4 19.2V21" />
      <circle cx="12" cy="7.5" r="4.2" />
    </>
  ),
  settings: (
    <>
      <path d="M20 7.5h-8.5M8 7.5H4M20 16.5h-4M12.5 16.5H4" />
      <circle cx="9.5" cy="7.5" r="2.5" />
      <circle cx="15" cy="16.5" r="2.5" />
    </>
  ),
  grid: (
    <>
      <rect x="3.2" y="3.2" width="7.6" height="7.6" rx="2" />
      <rect x="13.2" y="3.2" width="7.6" height="7.6" rx="2" />
      <rect x="3.2" y="13.2" width="7.6" height="7.6" rx="2" />
      <rect x="13.2" y="13.2" width="7.6" height="7.6" rx="2" />
    </>
  ),

  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.2-4.2" />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.4 9.3a2.7 2.7 0 0 1 5.25.9c0 1.8-2.65 2.7-2.65 2.7" />
      <path d="M12 16.8h.01" />
    </>
  ),
  moon: <path d="M21 13.1A9 9 0 1 1 10.9 3a7.2 7.2 0 0 0 10.1 10.1Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3.2v5.6h-5.6" />
    </>
  ),
  flame: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3" />
    </>
  ),
  expand: <path d="M8 3.5H5.5a2 2 0 0 0-2 2V8M16 3.5h2.5a2 2 0 0 1 2 2V8M8 20.5H5.5a2 2 0 0 1-2-2V16M16 20.5h2.5a2 2 0 0 0 2-2V16" />,
  chevronRight: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  chevronDown: <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />,
  plus: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  check: <path d="m20 6.5-10.5 11L4 12" />,
  briefcase: (
    <>
      <rect x="2.5" y="7" width="19" height="13.5" rx="2.5" />
      <path d="M16 20.5V5.5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v15" />
    </>
  ),
  swap: <path d="M7.5 20V4.5M3.5 8.5l4-4 4 4M16.5 4v15.5M12.5 15.5l4 4 4-4" />,
  offline: (
    <>
      <path d="m2 2 20 20" />
      <path d="M8.6 16.6a4.8 4.8 0 0 1 6.8 0" />
      <path d="M5 13a9.5 9.5 0 0 1 3-2M19 13a9.5 9.5 0 0 0-4.5-2.4" />
      <path d="M1.8 9.4A15 15 0 0 1 6 6.6M22.2 9.4a15 15 0 0 0-11-3.3" />
      <path d="M12 20h.01" />
    </>
  ),
  inbox: (
    <>
      <path d="M21 12.5h-5l-1.5 2.6h-5L8 12.5H3" />
      <path d="M6.4 4.6 3 12.5v5A1.5 1.5 0 0 0 4.5 19h15a1.5 1.5 0 0 0 1.5-1.5v-5l-3.4-7.9a1.5 1.5 0 0 0-1.38-.9H7.78a1.5 1.5 0 0 0-1.38.9z" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number | string;
  /** Fill the shape as well as stroke it — used for the "on" star. */
  filled?: boolean;
  /** Accessible name. Omit for decorative icons sitting next to a text label. */
  title?: string;
}

export function Icon({ name, size = 20, filled, title, strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      {PATHS[name]}
    </svg>
  );
}
