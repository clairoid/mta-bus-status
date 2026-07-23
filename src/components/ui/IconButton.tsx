import { Icon, type IconName } from "./Icon";

interface IconButtonProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
  active?: boolean;
  /** Drops the border/background — for icons sitting inside another surface. */
  bare?: boolean;
}

// The visible chrome stays 36px so desktop density is unchanged, but the
// button itself spans a 44px hit area (WCAG 2.5.5). The negative margin keeps
// that extra reach from pushing surrounding layout around.
export function IconButton({ icon, label, onClick, active, bare }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`-m-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-control transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
        active ? "text-accent" : bare ? "text-dim" : "text-text2"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-control transition-colors ${
          bare
            ? "hover:bg-chip"
            : active
              ? "border border-accent bg-accent-soft"
              : "border border-border bg-card hover:bg-chip"
        }`}
      >
        <Icon name={icon} size={17} />
      </span>
    </button>
  );
}
