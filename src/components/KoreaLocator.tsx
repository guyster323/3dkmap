"use client";

import { KOREA_ZONES } from "@/lib/geo-korea";

const POLY: [number, number][] = [
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

function kx(lon: number) {
  return ((lon - 124.2) / 5.8) * 100;
}
function ky(lat: number) {
  return ((42.2 - lat) / 8.2) * 72;
}

export function KoreaLocator({
  lat,
  lon,
  zoneName,
}: {
  lat: number;
  lon: number;
  zoneName?: string;
}) {
  const d =
    POLY.map(([lo, la], i) => `${i === 0 ? "M" : "L"} ${kx(lo).toFixed(2)} ${ky(la).toFixed(2)}`).join(" ") +
    " Z";
  return (
    <div className="eik-win relative min-w-0 overflow-hidden">
      <svg viewBox="0 0 100 72" className="h-40 w-full" aria-label="한반도 상황도">
        <rect width="100" height="72" fill="#060a14" />
        {KOREA_ZONES.map((z) => (
          <rect
            key={z.id}
            x={kx(z.bounds.minLon)}
            y={ky(z.bounds.maxLat)}
            width={Math.max(2, kx(z.bounds.maxLon) - kx(z.bounds.minLon))}
            height={Math.max(2, ky(z.bounds.minLat) - ky(z.bounds.maxLat))}
            fill={z.nameKo === zoneName ? "#3d8b7a55" : "#14224a"}
            stroke="#3d8b7a"
            strokeWidth="0.3"
          />
        ))}
        <path d={d} fill="none" stroke="#3d8b7a" strokeWidth="0.7" />
        <circle cx={kx(lon)} cy={ky(lat)} r="2.2" fill="#d8b74a" stroke="#e8e0c8" strokeWidth="0.4" />
      </svg>
      {zoneName && (
        <p className="eik-src absolute bottom-1 left-2" style={{ color: "var(--color-eik-text)" }}>
          {zoneName}
        </p>
      )}
    </div>
  );
}
