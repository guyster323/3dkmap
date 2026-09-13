import type { FactionId } from "./types";
import kaoIndex from "../../public/assets/eiketsu/kao.index.json";
import officerIndex from "../../public/assets/eiketsu/units-officer.index.json";
import unitsIndex from "../../public/assets/eiketsu/units.index.json";
import ptPortraitIndex from "../../public/assets/pixel-times/portrait-atlas.index.json";
import ptActorIndex from "../../public/assets/pixel-times/scene-actors.index.json";
import ptMapIndex from "../../public/assets/pixel-times/map-characters.index.json";

export type UnitKind =
  | "infantry"
  | "spear"
  | "cavalry"
  | "archer"
  | "crossbow"
  | "navy"
  | "strategist"
  | "lord";

export const ATLAS = {
  tiles: "/assets/eiketsu/tiles32.png",
  units: "/assets/eiketsu/units.png",
  officers: "/assets/eiketsu/units-officer.png",
  kao: "/assets/eiketsu/kao.png",
  ptKao: "/assets/pixel-times/portrait-atlas.png",
  ptActors: "/assets/pixel-times/scene-actors.png",
  ptMap: "/assets/pixel-times/map-characters.png",
  tile: 32,
  tileCols: 16,
  unitW: 32,
  unitH: 64,
  unitCols: 4,
  kaoW: 64,
  kaoH: 80,
  kaoCols: 8,
  ptActorW: 48,
  ptActorH: 64,
} as const;

export const TILE_ROW = {
  single: 0,
  forest: 1,
  hill: 2,
  mountain: 3,
  river: 4,
  sea: 5,
  road: 6,
  wall: 7,
  structure: 8,
  overlay: 9,
} as const;

type UnitRow = { kind: string; faction: string; row: number };

const UNIT_LOOKUP = new Map<string, number>();
for (const row of unitsIndex.rows as UnitRow[]) {
  UNIT_LOOKUP.set(`${row.kind}:${row.faction}`, row.row);
}

const OFFICER_ROWS = officerIndex.rows as Record<string, number>;
const KAO_CELLS = kaoIndex.cells as Record<string, { col: number; row: number }>;
const PT_KAO = ptPortraitIndex.cells as Record<string, { col: number; row: number }>;
const PT_ACTOR = ptActorIndex.cells as Record<string, { col: number; row: number }>;
const PT_MAP = ptMapIndex.cells as Record<string, { col: number; row: number }>;
const PT_KAO_W = Number(ptPortraitIndex.cellW) || 64;
const PT_KAO_H = Number(ptPortraitIndex.cellH) || 80;
const PT_MAP_W = Number(ptMapIndex.cellW) || 32;
const PT_MAP_H = Number(ptMapIndex.cellH) || 64;
const PT_ACTOR_W = Number(ptActorIndex.cellW) || 48;
const PT_ACTOR_H = Number(ptActorIndex.cellH) || 64;

export function autoTile(row: number, mask: number): number {
  return row * ATLAS.tileCols + (mask & 15);
}

export function unitCell(
  kind: UnitKind,
  faction: FactionId,
  dir: 0 | 1,
  frame: 0 | 1,
): { sx: number; sy: number } {
  const row = UNIT_LOOKUP.get(`${kind}:${faction}`) ?? 0;
  const col = dir * 2 + frame;
  return { sx: col * ATLAS.unitW, sy: row * ATLAS.unitH };
}

export function officerCell(
  characterId: string,
  dir: 0 | 1,
  frame: 0 | 1,
): { sx: number; sy: number } | null {
  const pt = PT_MAP[characterId];
  if (pt) return { sx: pt.col * PT_MAP_W, sy: pt.row * PT_MAP_H };
  const row = OFFICER_ROWS[characterId];
  if (row === undefined) return null;
  const col = dir * 2 + frame;
  return { sx: col * ATLAS.unitW, sy: row * ATLAS.unitH };
}

export function officerSheet(characterId: string): "ptMap" | "officers" {
  return PT_MAP[characterId] ? "ptMap" : "officers";
}

export function kaoCell(characterId: string): { sx: number; sy: number } | null {
  const pt = PT_KAO[characterId];
  if (pt) return { sx: pt.col * PT_KAO_W, sy: pt.row * PT_KAO_H };
  const cell = KAO_CELLS[characterId];
  if (!cell) return null;
  return { sx: cell.col * ATLAS.kaoW, sy: cell.row * ATLAS.kaoH };
}

export function kaoSheet(characterId: string): "ptKao" | "kao" {
  return PT_KAO[characterId] ? "ptKao" : "kao";
}

export function ptActorCell(
  characterId: string,
  frame: 0 | 1,
): { sx: number; sy: number } | null {
  const cell = PT_ACTOR[`${characterId}:${frame}`] ?? PT_ACTOR[`${characterId}:0`];
  if (!cell) return null;
  return { sx: cell.col * PT_ACTOR_W, sy: cell.row * PT_ACTOR_H };
}
