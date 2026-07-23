interface ToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
  label?: string;
}

// README Toggle: 46×28 track, sliding knob, indigo when on.
//
// The 28px track sits inside a 44px hit area (negative margin keeps the row
// height unchanged). The "off" state also carries a ring and the knob a
// shadow: in light mode the track is #f0f0ed and the knob white, which on a
// white settings card made every disabled switch essentially invisible.
export function Toggle({ on, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="-m-2 flex h-11 w-[62px] shrink-0 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span
        className="relative block h-7 w-[46px] rounded-full transition-colors"
        style={{
          background: on ? "var(--accent)" : "var(--chip)",
          boxShadow: on ? undefined : "inset 0 0 0 1.5px rgba(122, 122, 146, 0.45)",
        }}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: on ? 22 : 4, boxShadow: "0 1px 2px rgba(0,0,0,0.28)" }}
        />
      </span>
    </button>
  );
}
