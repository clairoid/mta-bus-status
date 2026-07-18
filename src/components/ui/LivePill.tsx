interface LivePillProps {
  count: number;
  label: string;
}

export function LivePill({ count, label }: LivePillProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-green-soft px-3 py-1 text-xs font-semibold text-green">
      <span className="h-1.5 w-1.5 rounded-full bg-green [animation:livePulse_1.6s_ease-in-out_infinite]" />
      {count} {label}
    </span>
  );
}
