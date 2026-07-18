interface OverlineProps {
  children: React.ReactNode;
}

// README: 10-11px/700 uppercase, 1px tracking section label.
export function Overline({ children }: OverlineProps) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[1px] text-dim">{children}</div>
  );
}
