interface IconButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export function IconButton({ icon, label, onClick, active }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-control border border-border text-base transition-colors hover:bg-chip focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
        active ? "bg-accent-soft text-accent" : "bg-card text-text2"
      }`}
    >
      {icon}
    </button>
  );
}
