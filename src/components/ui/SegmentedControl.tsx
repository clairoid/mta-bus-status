interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex rounded-[10px] border border-border bg-card p-[3px]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-4 py-1.5 text-[13px] font-bold transition-colors ${
            value === opt.value ? "bg-accent-soft text-accent" : "text-text2"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
