interface SavedPlaceRowProps {
  icon: string;
  label: string;
  sublabel: string;
}

// README: saved place row (Profile Home/Work, Trip autocomplete).
export function SavedPlaceRow({ icon, label, sublabel }: SavedPlaceRowProps) {
  return (
    <div className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0">
      <span className="text-lg">{icon}</span>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-text">{label}</div>
        <div className="truncate text-[11px] text-dim">{sublabel}</div>
      </div>
    </div>
  );
}
