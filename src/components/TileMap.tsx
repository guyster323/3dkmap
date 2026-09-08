"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  COLS,
  FACTION_BANNER,
  ROWS,
  SCALE,
  TILE,
  buildTerrain,
  lonLatToCell,
  type Terrain,
} from "@/lib/eiketsu";
import type { Character, Place, WorldEvent } from "@/lib/types";
import { getCharacter } from "@/lib/content";

type Unit = {
  col: number;
  row: number;
  place: Place;
  event?: WorldEvent;
  officer?: Character;
  banner: string;
};

const TERRAIN_FILL: Record<Terrain, [string, string]> = {
  plain: ["#6b8f3a", "#5a7a2e"],
  forest: ["#2f5a28", "#3d6b3a"],
  mountain: ["#6a5a3a", "#4a3e28"],
  water: ["#2a5a7a", "#3a6a8a"],
  waste: ["#8a7a4a", "#6a5a32"],
  wall: ["#8a7a6a", "#6a5a4a"],
  gate: ["#5a4a3a", "#c9a227"],
  keep: ["#8a6a4a", "#c23b22"],
  camp: ["#5a4a28", "#c9b44a"],
  palisade: ["#4a6b3a", "#7a5a2a"],
};

export function TileMap({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const terrain = useMemo(() => buildTerrain(places), [places]);
  const units = useMemo<Unit[]>(() => {
    return places.map((place) => {
      const { col, row } = lonLatToCell(place.lon, place.lat);
      const event = liveEvents.find((e) => e.placeId === place.id);
      const officer = event?.characterIds?.[0] ? getCharacter(event.characterIds[0]) : undefined;
      const banner = FACTION_BANNER[officer?.faction ?? "other"];
      return { col, row, place, event, officer, banner };
    });
  }, [places, liveEvents]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 400) {
        frameRef.current = 1 - frameRef.current;
        last = t;
      }
      paint(ctx, terrain, units, selectedId, frameRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [terrain, units, selectedId]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
    const hit = units.find((u) => u.col === col && u.row === row)
      ?? units.find((u) => Math.abs(u.col - col) + Math.abs(u.row - row) <= 1);
    if (hit) onSelect?.(hit.place.id);
  };

  return (
    <div className="wood-panel overflow-hidden p-1">
      <canvas
        ref={canvasRef}
        width={COLS * TILE}
        height={ROWS * TILE}
        onClick={onClick}
        className="pixelated block h-auto w-full cursor-pointer bg-[#1a120c]"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

function paint(
  ctx: CanvasRenderingContext2D,
  terrain: Terrain[][],
  units: Unit[],
  selectedId: string | undefined,
  frame: number,
) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      drawTile(ctx, c * TILE, r * TILE, terrain[r][c], frame);
    }
  }
  for (const u of units) {
    const x = u.col * TILE;
    const y = u.row * TILE + (frame && u.event ? -1 : 0);
    drawKeep(ctx, x, y, u.banner);
    drawOfficer(ctx, x + 4, y - 6, u.banner, frame);
    if (u.place.id === selectedId) drawCursor(ctx, x, y, frame);
  }
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, t: Terrain, frame: number) {
  const [a, b] = TERRAIN_FILL[t];
  ctx.fillStyle = a;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = b;
  for (let i = 0; i < 16; i++) {
    const dx = (i * 7 + y) % TILE;
    const dy = (i * 3 + x) % TILE;
    if ((dx + dy) % 2 === 0) ctx.fillRect(x + dx, y + dy, 1, 1);
  }
  if (t === "water") {
    ctx.fillStyle = frame ? "#8ab4c8" : "#6a94a8";
    ctx.fillRect(x + 2, y + 7 + frame, 5, 1);
    ctx.fillRect(x + 9, y + 11 - frame, 4, 1);
  }
  if (t === "forest") {
    px(ctx, x + 4, y + 8, "#1a3a18", 3, 6);
    px(ctx, x + 3, y + 4, "#2f5a28", 5, 5);
    px(ctx, x + 10, y + 9, "#1a3a18", 2, 5);
    px(ctx, x + 9, y + 6, "#3d6b3a", 4, 4);
  }
  if (t === "mountain") {
    px(ctx, x + 2, y + 10, "#4a3e28", 12, 5);
    px(ctx, x + 5, y + 5, "#8a7a5a", 6, 6);
    px(ctx, x + 7, y + 3, "#ead9b6", 2, 2);
  }
}

function drawKeep(ctx: CanvasRenderingContext2D, x: number, y: number, banner: string) {
  px(ctx, x + 2, y + 8, "#6a5a4a", 12, 7);
  px(ctx, x + 3, y + 4, "#8a7a6a", 10, 5);
  px(ctx, x + 6, y + 1, banner, 4, 4);
  px(ctx, x + 7, y + 9, "#1a120c", 2, 5);
  px(ctx, x + 4, y + 6, "#c9a227", 1, 1);
  px(ctx, x + 11, y + 6, "#c9a227", 1, 1);
}

function drawOfficer(ctx: CanvasRenderingContext2D, x: number, y: number, banner: string, frame: number) {
  px(ctx, x + 2, y + 6, banner, 5, 6);
  px(ctx, x + 3, y + 2, "#ead9b6", 3, 4);
  px(ctx, x + 3, y + 1, "#1a120c", 3, 2);
  px(ctx, x + 4, y + 3, "#1a120c", 1, 1);
  px(ctx, x + 1, y + 5, banner, 2, 3);
  px(ctx, x + 6, y + 8 + frame, "#c9a227", 1, 4);
}

function drawCursor(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.strokeStyle = frame ? "#ead9b6" : "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
  px(ctx, x, y, "#c9a227", 3, 1);
  px(ctx, x, y, "#c9a227", 1, 3);
  px(ctx, x + 13, y, "#c9a227", 3, 1);
  px(ctx, x + 15, y, "#c9a227", 1, 3);
}
