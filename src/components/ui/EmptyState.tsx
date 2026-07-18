interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border px-6 py-16 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="text-sm font-semibold text-text">{title}</p>
      {subtitle && <p className="max-w-sm text-xs text-dim">{subtitle}</p>}
    </div>
  );
}
