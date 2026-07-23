import { Icon, type IconName } from "../ui/Icon";

interface SavedPlaceRowProps {
  icon: IconName;
  label: string;
  sublabel: string;
}

// README: saved place row (Profile Home/Work, Trip autocomplete).
export function SavedPlaceRow({ icon, label, sublabel }: SavedPlaceRowProps) {
  return (
    <div className="flex min-h-12 items-center gap-3 border-t border-border px-4 py-3 first:border-t-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-chip text-text2">
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-text">{label}</div>
        <div className="truncate text-[11px] text-dim">{sublabel}</div>
      </div>
    </div>
  );
}
