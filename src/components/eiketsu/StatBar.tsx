export type StatBarProps = {
  value: number;
  max: number;
  label?: string;
  className?: string;
};

function fillColor(ratio: number): string {
  if (ratio >= 0.5) return "var(--color-eik-hp)";
  if (ratio >= 0.25) return "var(--color-eik-hp-warn)";
  return "var(--color-eik-hp-crit)";
}

/** HP 스타일 게이지. 게임 수치가 아니라 사건 중요도·권 완성도 표시용. */
export function StatBar({ value, max, label, className = "" }: StatBarProps) {
  const safeMax = max <= 0 ? 1 : max;
  const clamped = Math.min(safeMax, Math.max(0, value));
  const ratio = clamped / safeMax;
  const pct = Math.round(ratio * 1000) / 10;

  return (
    <div className={["min-w-0", className].filter(Boolean).join(" ")}>
      <div className="eik-stat mb-1 flex items-baseline justify-between gap-2">
        {label ? <span className="min-w-0 break-keep">{label}</span> : <span />}
        <span style={{ color: "var(--color-eik-text-dim)" }}>
          {clamped}/{safeMax}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-label={label ?? "수치"}
        className="h-3 w-full overflow-hidden"
        style={{
          background: "var(--color-eik-void)",
          boxShadow: "inset 0 0 0 1px var(--color-eik-bevel-lo), inset 0 0 0 2px var(--color-eik-gold-dim)",
        }}
      >
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background: fillColor(ratio),
            boxShadow: "inset 0 1px 0 rgba(232,224,200,0.28)",
          }}
        />
      </div>
    </div>
  );
}
