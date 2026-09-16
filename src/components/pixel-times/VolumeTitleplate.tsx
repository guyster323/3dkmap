import type { Volume } from "@/lib/types";

export function VolumeTitleplate({
  volume,
  compact = false,
}: {
  volume: Volume;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <p className="eik-src min-w-0 truncate tracking-widest" style={{ color: "var(--color-eik-gold)" }}>
        전략 삼국지 {volume.number}권 · {volume.title}
      </p>
    );
  }
  return (
    <div className="min-w-0">
      <p className="eik-src tracking-widest" style={{ color: "var(--color-eik-gold)" }}>
        전략 삼국지 {volume.number}권
      </p>
      <h2 className="eik-era mt-1 break-keep" style={{ color: "var(--color-eik-gold)" }}>
        {volume.title}
      </h2>
    </div>
  );
}
