interface StatusPillProps {
  status: string;
}

// README: In service (green) / Delayed (red) soft-fill pill.
export function StatusPill({ status }: StatusPillProps) {
  const delayed = /delay/i.test(status);
  return (
    <span
      className="inline-flex items-center rounded-pill px-2.5 py-0.5 text-[11px] font-bold"
      style={
        delayed
          ? { backgroundColor: "rgba(239,68,68,0.14)", color: "#ef4444" }
          : { backgroundColor: "var(--green-soft)", color: "#22c55e" }
      }
    >
      {status}
    </span>
  );
}
