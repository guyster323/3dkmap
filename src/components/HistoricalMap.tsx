"use client";

import { project } from "@/lib/projection";
import { REGION_LABEL, type Place, type RegionId, type WorldEvent } from "@/lib/types";
import { getPlace } from "@/lib/content";

const REGION_COLOR: Record<RegionId, string> = {
  zhongyuan: "#c23b22",
  hebei: "#6b8cae",
  jiangdong: "#4a6b52",
  shu: "#c9a227",
  xiliang: "#b8834a",
  naman: "#7a5c3a",
  korea: "#3d8b7a",
  other: "#8a7d68",
};

type Pin = {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
  live: boolean;
  importance: number;
};

export function HistoricalMap({
  places,
  liveEvents,
  selectedId,
  onSelect,
}: {
  places: Place[];
  liveEvents: WorldEvent[];
  selectedId?: string;
  onSelect?: (placeId: string) => void;
}) {
  const livePlaceIds = new Set(liveEvents.map((e) => e.placeId).filter(Boolean) as string[]);

  const pins: Pin[] = places.map((p) => {
    const { x, y } = project(p.lon, p.lat);
    const live = livePlaceIds.has(p.id);
    const ev = liveEvents.find((e) => e.placeId === p.id);
    return {
      id: p.id,
      x,
      y,
      label: p.nameKo,
      color: REGION_COLOR[p.region],
      live,
      importance: ev?.importance ?? 1,
    };
  });

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-2xl border border-paper/10 bg-[#16110c]">
      <svg viewBox="0 0 100 72" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#2a2014" />
            <stop offset="100%" stopColor="#120e0a" />
          </radialGradient>
        </defs>
        <rect width="100" height="72" fill="url(#glow)" />

        {/* stylized landmasses in lon/lat space */}
        <Land />

        {/* yellow river / yangtze hints */}
        <path
          d={riverPath([
            [103.5, 36.2],
            [106.5, 35.4],
            [110.2, 35.6],
            [113.5, 35.0],
            [116.8, 36.1],
            [118.8, 37.6],
          ])}
          fill="none"
          stroke="#6b8cae"
          strokeOpacity="0.35"
          strokeWidth="0.35"
        />
        <path
          d={riverPath([
            [104.0, 30.7],
            [108.5, 30.8],
            [111.8, 30.5],
            [114.5, 30.4],
            [117.2, 31.4],
            [120.2, 31.9],
          ])}
          fill="none"
          stroke="#4a6b52"
          strokeOpacity="0.4"
          strokeWidth="0.35"
        />

        {pins.map((pin) => (
          <g
            key={pin.id}
            transform={`translate(${pin.x} ${pin.y * 0.72})`}
            className="cursor-pointer"
            onClick={() => onSelect?.(pin.id)}
          >
            {pin.live && (
              <circle r={1.8 + pin.importance * 0.15} className="pin-pulse" fill={pin.color} opacity={0.5} />
            )}
            <circle
              r={selectedId === pin.id ? 1.15 : pin.live ? 0.85 : 0.55}
              fill={pin.color}
              stroke={selectedId === pin.id ? "#ead9b6" : "transparent"}
              strokeWidth="0.25"
            />
            {(pin.live || selectedId === pin.id) && (
              <text
                y={-1.6}
                textAnchor="middle"
                fill="#ead9b6"
                fontSize="1.55"
                fontFamily="Noto Serif KR, serif"
              >
                {pin.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-1.5">
        {(Object.keys(REGION_COLOR) as RegionId[])
          .filter((r) => r !== "other" && r !== "naman")
          .map((r) => (
            <span
              key={r}
              className="rounded-sm bg-ink/70 px-1.5 py-0.5 text-[9px] text-paper/80"
            >
              <i
                className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: REGION_COLOR[r] }}
              />
              {REGION_LABEL[r]}
            </span>
          ))}
      </div>
    </div>
  );
}

function riverPath(coords: [number, number][]): string {
  return coords
    .map(([lon, lat], i) => {
      const { x, y } = project(lon, lat);
      return `${i === 0 ? "M" : "L"} ${x} ${y * 0.72}`;
    })
    .join(" ");
}

function Land() {
  const china: [number, number][] = [
    [108, 41.5],
    [114, 41],
    [119.5, 40.2],
    [122.2, 37.2],
    [121.6, 31.5],
    [120.8, 27.5],
    [117.5, 23.5],
    [110.2, 21.5],
    [108, 21.8],
    [106.5, 23],
    [104, 24.5],
    [101.5, 26],
    [100.5, 30],
    [101.2, 33.5],
    [103, 36.5],
    [105.5, 39.5],
    [108, 41.5],
  ];
  const korea: [number, number][] = [
    [124.6, 39.8],
    [125.4, 40.6],
    [127.2, 41.3],
    [129.4, 41.8],
    [129.5, 37.6],
    [129.2, 35.5],
    [127.8, 34.7],
    [126.4, 34.4],
    [126.1, 36.4],
    [126.0, 37.7],
    [124.8, 38.1],
    [124.6, 39.8],
  ];
  const to = (c: [number, number][]) =>
    c
      .map(([lon, lat], i) => {
        const { x, y } = project(lon, lat);
        return `${i === 0 ? "M" : "L"} ${x} ${y * 0.72}`;
      })
      .join(" ") + " Z";

  return (
    <g>
      <path d={to(china)} fill="#2a2318" stroke="#3d3426" strokeWidth="0.2" />
      <path d={to(korea)} fill="#24302c" stroke="#3d5c52" strokeWidth="0.22" />
    </g>
  );
}

export function livePlacesFromEvents(events: WorldEvent[]): Place[] {
  const ids = [...new Set(events.map((e) => e.placeId).filter(Boolean) as string[])];
  return ids.map((id) => getPlace(id)).filter((p): p is Place => Boolean(p));
}
