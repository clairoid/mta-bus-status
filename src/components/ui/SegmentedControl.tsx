interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Stretch to fill its container instead of hugging its labels. */
  fluid?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  fluid,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex rounded-[10px] border border-border bg-card p-[3px] ${fluid ? "w-full" : ""}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`min-h-9 rounded-lg px-4 py-1.5 text-[13px] font-bold transition-colors active:scale-95 ${
            fluid ? "flex-1" : ""
          } ${value === opt.value ? "bg-accent-soft text-accent" : "text-text2 active:bg-chip"}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
