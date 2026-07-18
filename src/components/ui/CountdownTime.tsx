import { useCountdown } from "../../hooks/useCountdown";

interface CountdownTimeProps {
  seconds: number | null;
  size?: "md" | "lg";
}

// README countdown: tabular-nums big/small split, recolors by threshold
// (<=120s green, <=420s yellow, else text). The shared tick drives it.
export function CountdownTime({ seconds, size = "lg" }: CountdownTimeProps) {
  const cd = useCountdown(seconds);

  if (cd === null) {
    return <span className="text-sm font-semibold text-dim">—</span>;
  }

  return (
    <span
      className={`tabular-nums font-extrabold ${size === "lg" ? "text-lg" : "text-[15px]"}`}
      style={{ color: cd.color }}
    >
      {cd.big}
      {cd.small && <span className="ml-0.5 text-[9px] text-dim">{cd.small}</span>}
    </span>
  );
}
