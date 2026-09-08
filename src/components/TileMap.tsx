"use client";

import { useEffect, useMemo, useRef } from "react";
import { COLS, ROWS, TILE, buildTerrain, lonLatToCell, type Terrain } from "@/lib/eiketsu";
import { ATLAS, TILE_INDEX, unitRow } from "@/lib/atlas";
import type { Character, Place, WorldEvent } from "@/lib/types";
import { getCharacter } from "@/lib/content";

type Unit = {
  col: number;
  row: number;
  place: Place;
  event?: WorldEvent;
  officer?: Character;
};

function terrainIndex(t: Terrain, frame: number): number {
  if (t === "plain") return TILE_INDEX.plain;
  if (t === "forest") return TILE_INDEX.forest;
  if (t === "mountain") return TILE_INDEX.mountain;
  if (t === "water") return frame ? TILE_INDEX.water1 : TILE_INDEX.water0;
  if (t === "waste") return TILE_INDEX.waste;
  if (t === "wall") return TILE_INDEX.wall;
  if (t === "gate") return TILE_INDEX.gate;
  if (t === "keep") return TILE_INDEX.keep;
  if (t === "camp") return TILE_INDEX.camp;
  if (t === "palisade") return TILE_INDEX.palisade;
  return TILE_INDEX.plain;
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
  const terrain = useMemo(() => buildTerrain(places), [places]);
  const units = useMemo<Unit[]>(() => {
    return places.map((place) => {
      const { col, row } = lonLatToCell(place.lon, place.lat);
      const event = liveEvents.find((e) => e.placeId === place.id);
      const officer = event?.characterIds?.[0] ? getCharacter(event.characterIds[0]) : undefined;
      return { col, row, place, event, officer };
    });
  }, [places, liveEvents]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const tiles = new Image();
    const unitSheet = new Image();
    tiles.src = ATLAS.tiles;
    unitSheet.src = ATLAS.units;
    let loaded = 0;
    let raf = 0;
    let frame = 0;
    let last = 0;
    const ready = () => {
      loaded += 1;
      if (loaded < 2) return;
      const loop = (t: number) => {
        if (t - last > 400) {
          frame = 1 - frame;
          last = t;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            blitTile(ctx, tiles, terrainIndex(terrain[r][c], frame), c * TILE, r * TILE);
          }
        }
        for (const u of units) {
          const row = unitRow(u.officer?.id, u.officer?.faction);
          const dx = u.col * TILE - 8;
          const dy = u.row * TILE - 48;
          ctx.drawImage(
            unitSheet,
            frame * ATLAS.unitW,
            row * ATLAS.unitH,
            ATLAS.unitW,
            ATLAS.unitH,
            dx,
            dy,
            ATLAS.unitW,
            ATLAS.unitH,
          );
          if (u.place.id === selectedId) {
            blitTile(ctx, tiles, TILE_INDEX.cursor, u.col * TILE, u.row * TILE);
          }
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };
    tiles.onload = ready;
    unitSheet.onload = ready;
    return () => cancelAnimationFrame(raf);
  }, [terrain, units, selectedId]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
    const hit =
      units.find((u) => u.col === col && u.row === row) ??
      units.find((u) => Math.abs(u.col - col) + Math.abs(u.row - row) <= 1);
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
