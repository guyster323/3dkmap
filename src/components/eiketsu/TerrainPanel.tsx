import type { Place } from "@/lib/types";
import { EikWindow } from "./Window";

export type TerrainPanelPlace = Pick<Place, "nameKo" | "nameHanja" | "modernName" | "note">;

export type TerrainPanelProps = {
  place: TerrainPanelPlace;
  terrain: string;
  title?: string;
  className?: string;
};

const ROWS: { key: string; label: string; value: (p: TerrainPanelPlace, terrain: string) => string }[] = [
  { key: "name", label: "지명", value: (p) => p.nameKo },
  { key: "hanja", label: "한자", value: (p) => p.nameHanja },
  { key: "modern", label: "현대", value: (p) => p.modernName },
  { key: "terrain", label: "지형", value: (_p, terrain) => terrain },
  { key: "note", label: "비고", value: (p) => p.note ?? "—" },
];

/** 거점 정보창. 지명/한자/현대 지명/지형 이름/비고. */
export function TerrainPanel({ place, terrain, title = "거점", className = "" }: TerrainPanelProps) {
  return (
    <EikWindow title={title} className={className}>
      <dl className="eik-body space-y-1">
        {ROWS.map((row) => (
          <div key={row.key} className="flex min-w-0 gap-3">
            <dt className="w-10 shrink-0" style={{ color: "var(--color-eik-text-dim)" }}>
              {row.label}
            </dt>
            <dd className="min-w-0 flex-1 break-keep">{row.value(place, terrain)}</dd>
          </div>
        ))}
      </dl>
    </EikWindow>
  );
}
