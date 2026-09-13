"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { StrategicEdge, StrategicNode, StrategicTerritory } from "@/data/terrain";
import { GRID_COLS, GRID_ROWS } from "@/data/terrain/strategic-terrain";
import { ATLAS } from "@/lib/atlas";
import { FACTION_BANNER } from "@/lib/eiketsu";
import { getPlace } from "@/lib/content";
import { getStrategicOverlay } from "@/data/pixel-times";

export type StrategicMapCanvasProps = {
  nodes: StrategicNode[];
  edges: StrategicEdge[];
  territories?: StrategicTerritory[];
  selectedPlaceId?: string;
  onSelect?: (placeId: string) => void;
  highlight?: string[];
  overlay?: ReactNode;
};

const LOGIC_W = 1000;
const LOGIC_H = 700;
const TILE = ATLAS.worldTile;
const HIT = 44;

const CITY_SRC: Record<1 | 2 | 3, { src: string; w: number; h: number }> = {
  1: { src: "/assets/pixel-times/terrain/city-capital.png", w: 96, h: 80 },
  2: { src: "/assets/pixel-times/terrain/city-major.png", w: 64, h: 56 },
  3: { src: "/assets/pixel-times/terrain/city-county.png", w: 40, h: 32 },
};



const EDGE_STYLE: Record<StrategicEdge["kind"], { stroke: string; width: number; dash?: string }> = {
  road: { stroke: "#c9a06a", width: 2.4 },
  river: { stroke: "#3a7a9a", width: 3 },
  sea: { stroke: "#1a4a6a", width: 2.2, dash: "6 5" },
  pass: { stroke: "#8a7430", width: 2, dash: "4 3" },
};

function labelPriority(node: StrategicNode, selected: boolean, lit: boolean): number {
  if (selected) return 300;
  if (lit) return 200;
  if (node.tier === 1) return 100;
  if (node.tier === 2) return 50;
  return 10;
}

type LabelBox = { left: number; top: number; right: number; bottom: number };
type LabelAnchor = "below" | "above" | "right" | "left";

const LABEL_ANCHORS: LabelAnchor[] = ["below", "above", "right", "left"];

function boxesOverlap(a: LabelBox, b: LabelBox): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

function labelPixelSize(name: string, tier: 1 | 2 | 3): { width: number; height: number } {
  const fontSize = tier === 1 ? 11 : 10;
  const width = Math.min(name.length * (fontSize + 3) + 14, 6.5 * fontSize + 14);
  const height = Math.ceil(fontSize * 1.6) + 6;
  return { width, height };
}

function estimateLabelBox(
  node: StrategicNode,
  name: string,
  mapW: number,
  mapH: number,
  anchor: LabelAnchor,
): LabelBox {
  const { width, height } = labelPixelSize(name, node.tier);
  const cx = (node.x / LOGIC_W) * mapW;
  const cy = (node.y / LOGIC_H) * mapH;
  const gap = HIT / 2;
  let left: number;
  let top: number;
  if (anchor === "below") {
    left = cx - width / 2;
    top = cy + gap;
  } else if (anchor === "above") {
    left = cx - width / 2;
    top = cy - gap - height;
  } else if (anchor === "right") {
    left = cx + gap;
    top = cy - height / 2;
  } else {
    left = cx - gap - width;
    top = cy - height / 2;
  }
  const pad = 4;
  return {
    left: left - pad,
    top: top - pad,
    right: left + width + pad,
    bottom: top + height + pad,
  };
}

function boxOnMap(box: LabelBox, mapW: number, mapH: number): boolean {
  return box.left >= 0 && box.top >= 0 && box.right <= mapW && box.bottom <= mapH;
}

function planLabelLayout(
  nodes: StrategicNode[],
  mapW: number,
  selectedPlaceId: string | undefined,
  highlightSet: Set<string>,
): Map<string, { show: boolean; anchor: LabelAnchor }> {
  const mapH = mapW * (LOGIC_H / LOGIC_W);
  const ranked = [...nodes].sort((a, b) => {
    const d =
      labelPriority(b, selectedPlaceId === b.placeId, highlightSet.has(b.placeId)) -
      labelPriority(a, selectedPlaceId === a.placeId, highlightSet.has(a.placeId));
    return d || a.placeId.localeCompare(b.placeId);
  });
  const occupied: LabelBox[] = [];
  const out = new Map<string, { show: boolean; anchor: LabelAnchor }>();
  for (const node of ranked) {
    const name = getPlace(node.placeId)?.nameKo ?? node.placeId;
    const selected = selectedPlaceId === node.placeId;
    let chosen: { anchor: LabelAnchor; box: LabelBox } | null = null;
    for (const anchor of LABEL_ANCHORS) {
      const box = estimateLabelBox(node, name, mapW, mapH, anchor);
      if (!boxOnMap(box, mapW, mapH) && !selected) continue;
      if (occupied.some((o) => boxesOverlap(o, box))) continue;
      chosen = { anchor, box };
      break;
    }
    if (chosen) {
      occupied.push(chosen.box);
      out.set(node.placeId, { show: true, anchor: chosen.anchor });
    } else {
      out.set(node.placeId, { show: false, anchor: "below" });
    }
  }
  return out;
}

function anchorStyle(anchor: LabelAnchor): CSSProperties {
  if (anchor === "above") {
    return { bottom: "100%", left: "50%", transform: "translateX(-50%)" };
  }
  if (anchor === "right") {
    return { left: "100%", top: "50%", transform: "translateY(-50%)" };
  }
  if (anchor === "left") {
    return { right: "100%", top: "50%", transform: "translateY(-50%)" };
  }
  return { top: "100%", left: "50%", transform: "translateX(-50%)" };
}

export function StrategicMapCanvas({
  nodes,
  edges,
  territories = [],
  selectedPlaceId,
  onSelect,
  highlight = [],
  overlay,
}: StrategicMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.placeId, n])), [nodes]);
  const highlightKey = [...highlight].sort().join(",");
  const highlightSet = useMemo(
    () => new Set(highlightKey ? highlightKey.split(",") : []),
    [highlightKey],
  );
  const [mapWidth, setMapWidth] = useState(LOGIC_W);

  const labelLayout = useMemo(
    () => planLabelLayout(nodes, mapWidth, selectedPlaceId, highlightSet),
    [nodes, mapWidth, selectedPlaceId, highlightSet],
  );

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w !== "number") return;
      setMapWidth((prev) => (Math.abs(prev - w) < 0.5 ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      ctx.imageSmoothingEnabled = false;
      const cw = GRID_COLS * TILE;
      const ch = GRID_ROWS * TILE;
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#060a14";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);
    };
    img.src = ATLAS.worldMap;
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="eik-win w-full max-w-full min-w-0 overflow-hidden">
      <div
        ref={frameRef}
        className="relative w-full max-w-full min-w-0 overflow-hidden"
        style={{ aspectRatio: `${LOGIC_W} / ${LOGIC_H}` }}
      >
        <canvas
          ref={canvasRef}
          width={GRID_COLS * TILE}
          height={GRID_ROWS * TILE}
          aria-hidden="true"
          className="pixelated absolute inset-0 block h-full w-full bg-[var(--color-eik-void)]"
          style={{ imageRendering: "pixelated" }}
        />
        <svg
          viewBox={`0 0 ${LOGIC_W} ${LOGIC_H}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {territories.map((t, i) => (
            <polygon
              key={`${t.faction}-${t.year}-${i}`}
              points={t.polygon.map(([x, y]) => `${x},${y}`).join(" ")}
              fill={FACTION_BANNER[t.faction]}
              fillOpacity="0.18"
              stroke={FACTION_BANNER[t.faction]}
              strokeOpacity="0.7"
              strokeWidth="2"
            />
          ))}
          {edges.map((edge) => {
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b) return null;
            const style = EDGE_STYLE[edge.kind];
            return (
              <line
                key={`${edge.kind}-${edge.from}-${edge.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={style.stroke}
                strokeWidth={style.width}
                strokeDasharray={style.dash}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        {nodes.map((node) => {
          const place = getPlace(node.placeId);
          const name = place?.nameKo ?? node.placeId;
          const selected = selectedPlaceId === node.placeId;
          const lit = highlightSet.has(node.placeId);
          const planned = labelLayout.get(node.placeId);
          const showLabel = Boolean(planned?.show);
          const z = selected ? 6 : lit ? 5 : 4 - node.tier;
          return (
            <button
              key={node.placeId}
              type="button"
              onClick={() => onSelect?.(node.placeId)}
              aria-label={name}
              aria-pressed={selected}
              className="absolute flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0"
              style={{
                left: `${(node.x / LOGIC_W) * 100}%`,
                top: `${(node.y / LOGIC_H) * 100}%`,
                zIndex: z,
              }}
            >
              <span
                className="flex h-[44px] w-[44px] items-center justify-center"
                style={{
                  boxShadow: selected
                    ? "0 0 0 2px var(--color-eik-gold)"
                    : lit
                      ? "0 0 0 2px var(--color-eik-jade)"
                      : undefined,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CITY_SRC[node.tier].src}
                  alt=""
                  className="pixelated pointer-events-none"
                  width={CITY_SRC[node.tier].w}
                  height={CITY_SRC[node.tier].h}
                />
                {getStrategicOverlay(node.placeId)?.ship ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/assets/pixel-times/terrain/landmark-ship.png"
                    alt=""
                    width={48}
                    height={32}
                    className="pixelated pointer-events-none absolute -right-6 top-0"
                  />
                ) : null}
                {getStrategicOverlay(node.placeId)?.army ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/assets/pixel-times/terrain/landmark-army.png"
                    alt=""
                    width={40}
                    height={28}
                    className="pixelated pointer-events-none absolute -left-5 bottom-0"
                  />
                ) : null}
              </span>
              {showLabel ? (
                <span
                  data-map-label=""
                  data-place-id={node.placeId}
                  className="eik-src pointer-events-none absolute max-w-[6.5em] truncate px-1 text-center whitespace-nowrap"
                  style={{
                    background: "rgba(10, 18, 38, 0.82)",
                    color: "var(--color-eik-text)",
                    fontSize: node.tier === 1 ? 11 : 10,
                    ...anchorStyle(planned?.anchor ?? "below"),
                  }}
                >
                  {name}
                </span>
              ) : null}
            </button>
          );
        })}
        {overlay}
      </div>
    </div>
  );
}
