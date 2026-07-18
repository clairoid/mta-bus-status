import type { ReactNode } from "react";
import { PageShell } from "../components/chrome/PageShell";
import { Toggle } from "../components/ui/Toggle";
import { Overline } from "../components/ui/Overline";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { useAppStore } from "../store/useAppStore";
import type { TextSize } from "../store/useAppStore";

function Row({ label, sublabel, control }: { label: string; sublabel?: string; control: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-text">{label}</div>
        {sublabel && <div className="text-[11px] text-dim">{sublabel}</div>}
      </div>
      {control}
    </div>
  );
}

const TEXT_SIZES: { value: string; label: string; size: TextSize }[] = [
  { value: "s", label: "S", size: 0.9 },
  { value: "m", label: "M", size: 1 },
  { value: "l", label: "L", size: 1.15 },
  { value: "xl", label: "XL", size: 1.3 },
];

// README Accessibility: Display toggles + Text-size selector + "Accessible
// routing only" toggle. These actually affect the whole app (see the
// AccessibilityProvider / TickProvider wired in Phase 0) and persist.
export function Accessibility() {
  const a11y = useAppStore((s) => s.a11y);
  const setA11y = useAppStore((s) => s.setA11y);
  const textSize = useAppStore((s) => s.textSize);
  const setTextSize = useAppStore((s) => s.setTextSize);

  const currentSize = TEXT_SIZES.find((t) => t.size === textSize)?.value ?? "m";

  return (
    <PageShell title="Accessibility">
      <div className="mx-auto max-w-[640px] space-y-5">
        <div>
          <Overline>Display</Overline>
          <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-card">
            <Row
              label="High contrast"
              control={<Toggle on={a11y.highContrast} onChange={(v) => setA11y({ highContrast: v })} label="High contrast" />}
            />
            <Row
              label="Bold text"
              control={<Toggle on={a11y.boldText} onChange={(v) => setA11y({ boldText: v })} label="Bold text" />}
            />
            <Row
              label="Reduce motion"
              sublabel="Stops animations and live bus movement"
              control={<Toggle on={a11y.reduceMotion} onChange={(v) => setA11y({ reduceMotion: v })} label="Reduce motion" />}
            />
            <Row
              label="Large tap targets"
              control={<Toggle on={a11y.largeTap} onChange={(v) => setA11y({ largeTap: v })} label="Large tap targets" />}
            />
          </div>
        </div>

        <div>
          <Overline>Text size</Overline>
          <div className="mt-2.5">
            <SegmentedControl
              options={TEXT_SIZES.map((t) => ({ value: t.value, label: t.label }))}
              value={currentSize}
              onChange={(v) => {
                const found = TEXT_SIZES.find((t) => t.value === v);
                if (found) setTextSize(found.size);
              }}
            />
          </div>
        </div>

        <div>
          <Overline>Routing</Overline>
          <div className="mt-2.5 overflow-hidden rounded-card border border-border bg-card">
            <Row
              label="Accessible routing only"
              sublabel="Prefer wheelchair-accessible stops in trip options"
              control={<Toggle on={a11y.accRoute} onChange={(v) => setA11y({ accRoute: v })} label="Accessible routing only" />}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
