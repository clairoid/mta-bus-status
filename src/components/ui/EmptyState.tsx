import { Icon, type IconName } from "./Icon";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  /** Optional call-to-action, so an empty screen isn't a dead end. */
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border px-6 py-14 text-center">
      <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-chip text-dim">
        <Icon name={icon} size={24} />
      </span>
      <p className="text-sm font-semibold text-text">{title}</p>
      {subtitle && <p className="max-w-sm text-xs leading-relaxed text-dim">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
