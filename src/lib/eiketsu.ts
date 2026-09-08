import type { FactionId, Place, PlaceKind, RegionId } from "./types";
import { MAP_BOUNDS } from "./projection";

export const TILE = 16;
export const SCALE = 2;
export const COLS = 40;
export const ROWS = 28;

export type Terrain =
  | "plain"
  | "forest"
  | "mountain"
  | "water"
  | "waste"
  | "wall"
  | "gate"
  | "keep"
  | "camp"
  | "palisade";

export const FACTION_BANNER: Record<FactionId, string> = {
  han: "#c9a227",
  yellow: "#c9b44a",
  dong: "#6b4a2a",
  cao: "#6b2a2a",
  liu: "#3d6b3a",
  sun: "#2a4a6b",
  "yuan-shao": "#5a3a6b",
  "yuan-shu": "#6b3a4a",
  "lu-bu": "#8a2a4a",
  gongsun: "#3a5a6b",
  tao: "#4a6b4a",
  goguryeo: "#3d8b7a",
  mahan: "#4a6b3a",
  jinhan: "#3a5a4a",
  byeonhan: "#2a5a4a",
  lelange: "#8a7a4a",
  other: "#8a7d68",
};

export function lonLatToCell(lon: number, lat: number): { col: number; row: number } {
  const col = Math.max(
    0,
    Math.min(COLS - 1, Math.floor(((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * COLS)),
  );
  const row = Math.max(
    0,
    Math.min(ROWS - 1, Math.floor(((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * ROWS)),
  );
  return { col, row };
}

export function kindToTerrain(kind: PlaceKind, region: RegionId): Terrain {
  if (kind === "river") return "water";
  if (kind === "pass") return "gate";
  if (kind === "battlefield") return "camp";
  if (kind === "palace") return "keep";
  if (kind === "city") return "keep";
  if (region === "shu" || region === "xiliang") return "mountain";
  if (region === "korea") return "palisade";
  return "plain";
}

export function buildTerrain(places: Place[]): Terrain[][] {
  const grid: Terrain[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => defaultTerrain(c, r)),
  );
  for (const p of places) {
    const { col, row } = lonLatToCell(p.lon, p.lat);
    const t = kindToTerrain(p.kind, p.region);
    stamp(grid, col, row, t);
  }
  return grid;
}

function defaultTerrain(c: number, r: number): Terrain {
  const nx = c / COLS;
  const ny = r / ROWS;
  if (nx > 0.78 && ny > 0.18 && ny < 0.72) {
    if (nx > 0.9 && ny > 0.45) return "water";
    if (ny < 0.32) return "mountain";
    return "plain";
  }
  if (nx < 0.18) return ny < 0.45 ? "waste" : "mountain";
  if (ny > 0.78 || (nx > 0.55 && ny > 0.62 && ny < 0.72)) return "water";
  if (ny < 0.12) return "waste";
  if ((c + r * 3) % 17 === 0) return "forest";
  if ((c * 2 + r) % 23 === 0) return "mountain";
  return "plain";
}

function stamp(grid: Terrain[][], col: number, row: number, t: Terrain) {
  const size = t === "keep" ? 2 : 1;
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const x = Math.min(COLS - 1, col + dx);
      const y = Math.min(ROWS - 1, row + dy);
      grid[y][x] = t;
    }
  }
}

export const CORE_OFFICERS = [
  "liu-bei",
  "guan-yu",
  "zhang-fei",
  "cao-cao",
  "dong-zhuo",
  "lu-bu",
  "sun-jian",
  "gogukcheon",
] as const;
