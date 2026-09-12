"use client";

import { useEffect, useRef, useState } from "react";
import {
  ATLAS,
  TILE_ROW,
  autoTile,
  officerCell,
  unitCell,
} from "@/lib/atlas";
import {
  AUTOTILE_KINDS,
  EDGE,
  edgeMask,
  parseTerrainGrid,
} from "@/lib/autotile";
import {
  FACTION_BANNER,
  TILE,
  isApproximateMap,
  type MapUnit,
} from "@/lib/eiketsu";
import type { BattleMap } from "@/data/terrain";
import type { TerrainKind } from "@/data/terrain/types";
import { getPlace } from "@/lib/content";
import type { FactionId } from "@/lib/types";

export type { MapUnit };

export type BattleMapCanvasProps = {
  map: BattleMap;
  units: MapUnit[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  highlight?: string[];
};

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

const STRUCTURE_KINDS: ReadonlySet<TerrainKind> = new Set([
  "gate",
  "keep",
  "tower",
  "camp",
  "palisade",
  "bridge",
]);

function neighborKind(grid: TerrainKind[][], col: number, row: number): TerrainKind | null {
  if (row < 0 || row >= grid.length) return null;
  const line = grid[row];
  if (col < 0 || col >= line.length) return null;
  return line[col];
}

function structureLocal(grid: TerrainKind[][], col: number, row: number, kind: TerrainKind): number {
  const n = neighborKind(grid, col, row - 1);
  const e = neighborKind(grid, col + 1, row);
  const s = neighborKind(grid, col, row + 1);
  const w = neighborKind(grid, col - 1, row);
  const isPath = (k: TerrainKind | null) =>
    k === "road" || k === "bridge" || k === "gate";
  if (kind === "gate") {
    const ns = isPath(n) || isPath(s);
    const ew = isPath(e) || isPath(w);
    if (ew && !ns) return isPath(e) ? 1 : 3;
    if (ns) return isPath(s) ? 2 : 0;
    const mask = edgeMask(grid, col, row);
    if (mask & EDGE.E) return 1;
    if (mask & EDGE.W) return 3;
    if (mask & EDGE.S) return 2;
    return 0;
  }
  if (kind === "keep") return 4 + ((col + row) & 3);
  if (kind === "tower") return 8 + (col & 1);
  if (kind === "camp") return 10 + (col & 1);
  if (kind === "palisade") return 12 + (row & 1);
  const ns = (n === "road" || n === "bridge" || n === "river" || n === "sea" ? 1 : 0) +
    (s === "road" || s === "bridge" || s === "river" || s === "sea" ? 1 : 0);
  const ew = (e === "road" || e === "bridge" || e === "river" || e === "sea" ? 1 : 0) +
    (w === "road" || w === "bridge" || w === "river" || w === "sea" ? 1 : 0);
  return ew >= ns ? 14 : 15;
}

function terrainIndex(grid: TerrainKind[][], col: number, row: number): number {
  const kind = grid[row][col];
  if (STRUCTURE_KINDS.has(kind)) {
    return autoTile(TILE_ROW.structure, structureLocal(grid, col, row, kind));
  }
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
  const sx = (index % ATLAS.tileCols) * ATLAS.tile;
  const sy = Math.floor(index / ATLAS.tileCols) * ATLAS.tile;
  ctx.drawImage(sheet, sx, sy, ATLAS.tile, ATLAS.tile, dx, dy, ATLAS.tile, ATLAS.tile);
}

const MARKER_KIND_LABEL = {
  banner: "깃발",
  gate: "문",
  tent: "막사",
  beacon: "봉화",
} as const;

function markerId(col: number, row: number, label?: string) {
  return label ?? `m-${col}-${row}`;
}

function markerName(kind: keyof typeof MARKER_KIND_LABEL, label?: string) {
  return label ?? MARKER_KIND_LABEL[kind];
}

function visHidden(text: string) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {text}
    </span>
  );
}

function cellKey(col: number, row: number) {
  return `${col},${row}`;
}

function unitSprite(
  unit: MapUnit,
  frame: 0 | 1,
): { sheet: "units" | "officers"; sx: number; sy: number } {
  const dir: 0 | 1 = unit.dir === 1 ? 1 : 0;
  if (unit.characterId) {
    const cell = officerCell(unit.characterId, dir, frame);
    if (cell) return { sheet: "officers", ...cell };
  }
  const cell = unitCell(unit.kind, unit.faction, dir, frame);
  return { sheet: "units", ...cell };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

export function BattleMapCanvas({
  map,
  units,
  selectedId,
  onSelect,
  highlight = [],
}: BattleMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<1 | 2>(1);
  const mapRef = useRef(map);
  const unitsRef = useRef(units);
  const selectedRef = useRef(selectedId);
  const highlightRef = useRef(highlight);

  useEffect(() => {
    mapRef.current = map;
    unitsRef.current = units;
    selectedRef.current = selectedId;
    highlightRef.current = highlight;
  }, [map, units, selectedId, highlight]);

  const approximate = isApproximateMap(map);
  const placeName = getPlace(map.placeId)?.nameKo;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    let cancelled = false;
    let frame: 0 | 1 = 0;
    let last = 0;
    let tiles: HTMLImageElement | null = null;
    let unitsSheet: HTMLImageElement | null = null;
    let officersSheet: HTMLImageElement | null = null;

    const draw = (t: number) => {
      if (cancelled) return;
      if (t - last > 400) {
        frame = frame === 0 ? 1 : 0;
        last = t;
      }
      const current = mapRef.current;
      const grid = parseTerrainGrid(current.grid);
      const cols = current.cols;
      const rows = current.rows;
      const nextW = cols * TILE;
      const nextH = rows * TILE;
      if (canvas.width !== nextW) canvas.width = nextW;
      if (canvas.height !== nextH) canvas.height = nextH;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!tiles) {
        raf = requestAnimationFrame(draw);
        return;
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          blitTile(ctx, tiles, terrainIndex(grid, c, r), c * TILE, r * TILE);
        }
      }

      const hl = new Set(highlightRef.current);
      const sel = selectedRef.current;
      const liveUnits = unitsRef.current;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const key = cellKey(c, r);
          const unitHere = liveUnits.some((u) => u.col === c && u.row === r && hl.has(u.id));
          if (hl.has(key) || unitHere) {
            blitTile(ctx, tiles, autoTile(TILE_ROW.overlay, 4 + (frame % 4)), c * TILE, r * TILE);
          }
        }
      }

      for (const marker of current.markers) {
        if (marker.kind === "banner") {
          const factionIndex = marker.faction ? factionFlag(marker.faction) : 0;
          blitTile(
            ctx,
            tiles,
            autoTile(TILE_ROW.overlay, 12 + factionIndex),
            marker.col * TILE,
            marker.row * TILE,
          );
        }
      }

      if (sel) {
        const unit = liveUnits.find((u) => u.id === sel);
        const marker = current.markers.find((m) => markerId(m.col, m.row, m.label) === sel);
        const cell = unit
          ? { col: unit.col, row: unit.row }
          : marker
            ? { col: marker.col, row: marker.row }
            : null;
        if (cell) {
          blitTile(ctx, tiles, autoTile(TILE_ROW.overlay, 8 + frame), cell.col * TILE, cell.row * TILE);
          blitTile(ctx, tiles, autoTile(TILE_ROW.overlay, frame), cell.col * TILE, cell.row * TILE);
        }
      }

      const drawn = [...liveUnits].sort((a, b) => a.row - b.row || a.col - b.col);
      for (const unit of drawn) {
        if (unit.col < 0 || unit.row < 0 || unit.col >= cols || unit.row >= rows) continue;
        const fx = unit.col * TILE + TILE / 2;
        const fy = unit.row * TILE + TILE - 5;
        ctx.fillStyle = "rgba(6, 10, 20, 0.55)";
        ctx.beginPath();
        ctx.ellipse(fx, fy, 12, 3.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = FACTION_BANNER[unit.faction];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 11, 3.2, 0, 0, Math.PI * 2);
        ctx.stroke();

        const sprite = unitSprite(unit, frame);
        const sheet = sprite.sheet === "officers" ? officersSheet : unitsSheet;
        if (!sheet) continue;
        const dx = unit.col * TILE + (TILE - ATLAS.unitW) / 2;
        const dy = unit.row * TILE + TILE - ATLAS.unitH;
        ctx.drawImage(
          sheet,
          sprite.sx,
          sprite.sy,
          ATLAS.unitW,
          ATLAS.unitH,
          dx,
          dy,
          ATLAS.unitW,
          ATLAS.unitH,
        );
      }
      raf = requestAnimationFrame(draw);
    };

    Promise.all([loadImage(ATLAS.tiles), loadImage(ATLAS.units), loadImage(ATLAS.officers)])
      .then(([t, u, o]) => {
        if (cancelled) return;
        tiles = t;
        unitsSheet = u;
        officersSheet = o;
        raf = requestAnimationFrame(draw);
      })
      .catch(() => {
        /* sheets missing: leave canvas blank rather than throw */
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * map.cols);
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * map.rows);
    const unit = units.find((u) => u.col === col && u.row === row);
    if (unit) {
      onSelect?.(unit.id);
      return;
    }
    const marker = map.markers.find((m) => m.col === col && m.row === row);
    if (marker) onSelect?.(markerId(marker.col, marker.row, marker.label));
  };

  return (
    <div className="eik-win w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 px-2 pt-2">
        <div className="min-w-0">
          {placeName ? (
            <button
              type="button"
              onClick={() => onSelect?.(map.placeId)}
              aria-label={placeName}
              aria-pressed={selectedId === map.placeId || selectedId === placeName}
              className="eik-src min-h-[44px] min-w-[44px] border-0 bg-transparent px-1 py-1 text-left"
              style={{ color: "var(--color-eik-gold)" }}
            >
              {placeName}
            </button>
          ) : null}
          <p className="eik-src m-0 text-[var(--color-eik-text-dim)]">
            {approximate ? "약식 지형" : map.note ?? "전투맵"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
          aria-pressed={zoom === 2}
          className="eik-win eik-win--flat eik-src min-h-[44px] min-w-[44px] px-3 py-2"
        >
          2배 확대
        </button>
      </div>
      <div
        ref={wrapRef}
        className="w-full max-w-full min-w-0 max-h-[70vh] overflow-auto"
      >
        <div
          className="relative"
          style={{ width: zoom === 2 ? "200%" : "100%" }}
        >
          <canvas
            ref={canvasRef}
            width={map.cols * TILE}
            height={map.rows * TILE}
            onClick={onCanvasClick}
            aria-hidden="true"
            className="pixelated block h-auto w-full max-w-full cursor-pointer bg-[var(--color-eik-void)]"
            style={{ imageRendering: "pixelated" }}
          />
          {map.markers.map((marker) => {
            const id = markerId(marker.col, marker.row, marker.label);
            const name = markerName(marker.kind, marker.label);
            const left = ((marker.col + 0.5) / map.cols) * 100;
            const top = ((marker.row + 0.5) / map.rows) * 100;
            const pressed = selectedId === id;
            return (
              <button
                key={`marker-${marker.col}-${marker.row}-${id}`}
                type="button"
                onClick={() => onSelect?.(id)}
                aria-label={name}
                aria-pressed={pressed}
                className="absolute z-[1] flex min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {marker.label ? (
                  <span
                    className="eik-src max-w-[7em] rounded-sm px-1 py-0.5 text-center break-keep"
                    style={{
                      background: "rgba(10, 18, 38, 0.82)",
                      color: "var(--color-eik-text)",
                      boxShadow: pressed ? "0 0 0 1px var(--color-eik-gold)" : "0 0 0 1px var(--color-eik-bevel-lo)",
                    }}
                  >
                    {marker.label}
                  </span>
                ) : (
                  visHidden(name)
                )}
              </button>
            );
          })}
          {units.map((unit) => {
            const name = unit.label ?? unit.id;
            const left = ((unit.col + 0.5) / map.cols) * 100;
            const top = ((unit.row + 0.5) / map.rows) * 100;
            const pressed = selectedId === unit.id;
            return (
              <button
                key={unit.id}
                type="button"
                onClick={() => onSelect?.(unit.id)}
                aria-label={name}
                aria-pressed={pressed}
                className="absolute z-[2] flex min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-[70%] items-center justify-center border-0 bg-transparent p-0"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {visHidden(name)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function factionFlag(faction: FactionId): number {
  if (faction === "cao" || faction === "dong" || faction === "lu-bu") return 1;
  if (faction === "liu" || faction === "goguryeo" || faction === "mahan") return 2;
  if (faction === "sun") return 3;
  return 0;
}
