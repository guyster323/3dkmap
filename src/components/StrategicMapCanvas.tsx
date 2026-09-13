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
import {
  GRID_COLS,
  GRID_ROWS,
  STRATEGIC_TERRAIN_GRID,
} from "@/data/terrain/strategic-terrain";
import { ATLAS, TILE_ROW, autoTile } from "@/lib/atlas";
import {
  AUTOTILE_KINDS,
  edgeMask,
  parseTerrainGrid,
  type TerrainKind,
} from "@/lib/autotile";
import { FACTION_BANNER } from "@/lib/eiketsu";
import { getPlace } from "@/lib/content";

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
const TILE = ATLAS.tile;
const HIT = 44;

const SINGLE_BASE: Record<string, number> = {
  plain: 0,
  grass: 4,
  field: 8,
  waste: 12,
};

const AUTOTILE_ROW: Record<string, number> = {
  forest: TILE_ROW.forest,
  hill: TILE_ROW.hill,
  mountain: TILE_ROW.mountain,
  river: TILE_ROW.river,
  sea: TILE_ROW.sea,
  road: TILE_ROW.road,
  wall: TILE_ROW.wall,
};

const EDGE_STYLE: Record<StrategicEdge["kind"], { stroke: string; width: number; dash?: string }> = {
  road: { stroke: "#c9a06a", width: 2.4 },
  river: { stroke: "#3a7a9a", width: 3 },
  sea: { stroke: "#1a4a6a", width: 2.2, dash: "6 5" },
  pass: { stroke: "#8a7430", width: 2, dash: "4 3" },
};

function terrainIndex(grid: TerrainKind[][], col: number, row: number): number {
  const kind = grid[row][col];
  if (AUTOTILE_KINDS.has(kind)) {
    return autoTile(AUTOTILE_ROW[kind], edgeMask(grid, col, row));
  }
  const base = SINGLE_BASE[kind] ?? 0;
  return autoTile(TILE_ROW.single, base + ((col + row) & 3));
}

function blitTile(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  index: number,
  dx: number,
  dy: number,
) {
  const sx = (index % ATLAS.tileCols) * TILE;
  const sy = Math.floor(index / ATLAS.tileCols) * TILE;
  ctx.drawImage(sheet, sx, sy, TILE, TILE, dx, dy, TILE, TILE);
}

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

function iconSize(tier: 1 | 2 | 3): number {
  if (tier === 1) return 22;
  if (tier === 2) return 16;
  return 12;
}

function NodeGlyph({ tier, active }: { tier: 1 | 2 | 3; active: boolean }) {
  const size = iconSize(tier);
  const stroke = active ? "#f0dc8a" : "#d8b74a";
  const fill = active ? "#1c2f5e" : "#0a1226";
  if (tier === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
        <rect x="3" y="8" width="16" height="11" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <polygon points="2,8 11,2 20,8" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="9" y="13" width="4" height="6" fill={stroke} />
      </svg>
    );
  }
  if (tier === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2" y="4" width="12" height="10" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="6" y="8" width="4" height="6" fill={stroke} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
      <polygon points="6,1 11,6 6,11 1,6" fill={fill} stroke={stroke} strokeWidth="1.4" />
    </svg>
  );
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
  const grid = useMemo(() => parseTerrainGrid(STRATEGIC_TERRAIN_GRID), []);
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
      ctx.fillStyle = "#060a14";
      ctx.fillRect(0, 0, LOGIC_W, LOGIC_H);
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          blitTile(ctx, img, terrainIndex(grid, c, r), c * TILE, r * TILE);
        }
      }
    };
    img.src = ATLAS.tiles;
    return () => {
      cancelled = true;
    };
  }, [grid]);

  return (
    <div className="eik-win w-full max-w-full min-w-0 overflow-hidden">
      <div
        ref={frameRef}
        className="relative w-full max-w-full min-w-0 overflow-hidden"
        style={{ aspectRatio: `${LOGIC_W} / ${LOGIC_H}` }}
      >
        <canvas
          ref={canvasRef}
          width={LOGIC_W}
          height={LOGIC_H}
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
                <NodeGlyph tier={node.tier} active={selected || lit} />
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
