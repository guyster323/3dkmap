import type { FactionId } from "./types";
import kaoIndex from "../../public/assets/eiketsu/kao.index.json";
import officerIndex from "../../public/assets/eiketsu/units-officer.index.json";
import unitsIndex from "../../public/assets/eiketsu/units.index.json";

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
  tile: 32,
  tileCols: 16,
  unitW: 32,
  unitH: 64,
  unitCols: 4,
  kaoW: 64,
  kaoH: 80,
  kaoCols: 8,
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
  const row = OFFICER_ROWS[characterId];
  if (row === undefined) return null;
  const col = dir * 2 + frame;
  return { sx: col * ATLAS.unitW, sy: row * ATLAS.unitH };
}

export function kaoCell(characterId: string): { sx: number; sy: number } | null {
  const cell = KAO_CELLS[characterId];
  if (!cell) return null;
  return { sx: cell.col * ATLAS.kaoW, sy: cell.row * ATLAS.kaoH };
}
