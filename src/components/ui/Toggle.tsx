interface ToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
  label?: string;
}

// README Toggle: 46×28 track, sliding knob, indigo when on.
export function Toggle({ on, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-7 w-[46px] shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      style={{ background: on ? "var(--accent)" : "var(--chip)" }}
    >
      <span
        className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
        style={{ left: on ? 22 : 4 }}
      />
    </button>
  );
}
