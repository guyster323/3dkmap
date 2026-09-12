import { getBattleMap, type BattleMap, type BattleMapMarker } from "@/data/terrain";
import type { UnitKind } from "./atlas";
import { MAP_BOUNDS } from "./projection";
import type { FactionId, Place, PlaceKind, RegionId } from "./types";
import officerIndex from "../../public/assets/eiketsu/units-officer.index.json";

export const TILE = 32;
export const SCALE = 2;
export const COLS = 24;
export const ROWS = 18;

/** Pre-redesign TileMap still switches on this union. */
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

export type ResolvedBattleMap = BattleMap & {
  /** 저작 맵이 없어 약식으로 채운 경우. 화면에서 「약식 지형」으로 드러낸다. */
  approximate: boolean;
};

export type MapUnit = {
  id: string;
  col: number;
  row: number;
  kind: UnitKind;
  faction: FactionId;
  characterId?: string;
  dir?: 0 | 1;
  label?: string;
};

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

const OFFICER_ROWS = officerIndex.rows as Record<string, number>;

/** Derived from units-officer.index.json. Do not hardcode the roster. */
export const CORE_OFFICERS: readonly string[] = Object.keys(OFFICER_ROWS);

export function lonLatToCell(lon: number, lat: number): { col: number; row: number } {
  const col = Math.max(
    0,
    Math.min(
      COLS - 1,
      Math.floor(((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * COLS),
    ),
  );
  const row = Math.max(
    0,
    Math.min(
      ROWS - 1,
      Math.floor(((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * ROWS),
    ),
  );
  return { col, row };
}

export function resolveBattleMap(place: Place): ResolvedBattleMap {
  const authored = getBattleMap(place.id);
  if (authored) return { ...authored, approximate: false };
  return proceduralFallback(place);
}

export function isApproximateMap(map: BattleMap | ResolvedBattleMap): boolean {
  return "approximate" in map && map.approximate === true;
}

export function proceduralFallback(place: Place): ResolvedBattleMap {
  const grid = makeGrid(groundChar(place.region));
  dressRegion(grid, place.region);
  stampByKind(grid, place.kind, place.region);
  const anchor = findAnchor(grid);
  const markers: BattleMapMarker[] = [
    { col: anchor.col, row: anchor.row, kind: "banner", label: place.nameKo },
  ];
  return {
    id: `approx-${place.id}`,
    placeId: place.id,
    cols: 24,
    rows: 18,
    grid,
    markers,
    note: `약식 지형. ${place.nameKo}(${place.nameHanja})의 저작 전투맵이 없다.`,
    approximate: true,
  };
}

function makeGrid(fill: string): string[] {
  return Array.from({ length: ROWS }, () => fill.repeat(COLS));
}

function put(grid: string[], col: number, row: number, ch: string) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
  const line = grid[row];
  grid[row] = line.slice(0, col) + ch + line.slice(col + 1);
}

function fillRect(grid: string[], c0: number, r0: number, c1: number, r1: number, ch: string) {
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) put(grid, c, r, ch);
  }
}

function hline(grid: string[], c0: number, c1: number, row: number, ch: string) {
  for (let c = c0; c <= c1; c++) put(grid, c, row, ch);
}

function vline(grid: string[], col: number, r0: number, r1: number, ch: string) {
  for (let r = r0; r <= r1; r++) put(grid, col, r, ch);
}

function groundChar(region: RegionId): string {
  switch (region) {
    case "hebei":
      return ",";
    case "shu":
      return "n";
    case "xiliang":
      return "_";
    case "naman":
      return "T";
    case "korea":
      return ",";
    default:
      return ".";
  }
}

function dressRegion(grid: string[], region: RegionId) {
  if (region === "jiangdong") {
    fillRect(grid, 19, 0, 23, 17, "s");
    hline(grid, 0, 18, 16, "~");
    hline(grid, 0, 18, 17, "~");
  } else if (region === "shu") {
    fillRect(grid, 0, 0, 23, 2, "A");
    fillRect(grid, 0, 3, 2, 17, "A");
    fillRect(grid, 21, 3, 23, 17, "A");
  } else if (region === "xiliang") {
    fillRect(grid, 0, 0, 23, 3, "A");
    fillRect(grid, 0, 15, 23, 17, "_");
  } else if (region === "zhongyuan") {
    fillRect(grid, 0, 15, 23, 17, "=");
  } else if (region === "korea") {
    fillRect(grid, 0, 0, 23, 2, "n");
    fillRect(grid, 20, 10, 23, 17, "s");
  } else if (region === "naman") {
    fillRect(grid, 0, 0, 23, 3, "T");
    fillRect(grid, 0, 14, 23, 17, "T");
  } else if (region === "hebei") {
    fillRect(grid, 0, 0, 23, 2, "n");
  }
}

function stampByKind(grid: string[], kind: PlaceKind, region: RegionId) {
  if (kind === "city" || kind === "palace") {
    stampSettlement(grid, region === "korea", kind === "palace");
    return;
  }
  if (kind === "pass") {
    stampPass(grid);
    return;
  }
  if (kind === "battlefield") {
    stampField(grid);
    return;
  }
  if (kind === "river") {
    stampRiver(grid);
    return;
  }
  stampOpen(grid);
}

function stampSettlement(grid: string[], palisade: boolean, palace: boolean) {
  const wall = palisade ? "|" : "#";
  const c0 = 6;
  const c1 = 17;
  const r0 = 4;
  const r1 = 13;
  hline(grid, 0, 23, 8, "-");
  vline(grid, 11, 3, 14, "-");
  hline(grid, c0, c1, r0, wall);
  hline(grid, c0, c1, r1, wall);
  vline(grid, c0, r0, r1, wall);
  vline(grid, c1, r0, r1, wall);
  fillRect(grid, c0 + 1, r0 + 1, c1 - 1, r1 - 1, ".");
  hline(grid, c0 + 1, c1 - 1, 8, "-");
  vline(grid, 11, r0 + 1, r1 - 1, "-");
  put(grid, 11, r0, "D");
  put(grid, 12, r0, "D");
  put(grid, 11, r1, "D");
  put(grid, 12, r1, "D");
  put(grid, c0, 8, "D");
  put(grid, c1, 8, "D");
  const kr = palace ? 7 : 8;
  put(grid, 11, kr, "K");
  put(grid, 12, kr, "K");
  put(grid, 11, kr + 1, "K");
  put(grid, 12, kr + 1, "K");
}

function stampPass(grid: string[]) {
  fillRect(grid, 0, 0, 23, 17, "A");
  fillRect(grid, 9, 0, 14, 17, ".");
  vline(grid, 11, 0, 17, "-");
  vline(grid, 12, 0, 17, "-");
  hline(grid, 9, 14, 7, "D");
  hline(grid, 9, 14, 8, "D");
  put(grid, 10, 6, "^");
  put(grid, 13, 6, "^");
}

function stampField(grid: string[]) {
  fillRect(grid, 4, 2, 19, 6, "|");
  fillRect(grid, 5, 3, 18, 5, "C");
  fillRect(grid, 4, 11, 19, 15, "|");
  fillRect(grid, 5, 12, 18, 14, "C");
  hline(grid, 0, 23, 8, "-");
  put(grid, 11, 8, "+");
  put(grid, 12, 8, "+");
}

function stampRiver(grid: string[]) {
  hline(grid, 0, 23, 8, "~");
  hline(grid, 0, 23, 9, "~");
  hline(grid, 0, 23, 10, "~");
  put(grid, 11, 8, "+");
  put(grid, 12, 8, "+");
  put(grid, 11, 9, "+");
  put(grid, 12, 9, "+");
  put(grid, 11, 10, "+");
  put(grid, 12, 10, "+");
  hline(grid, 11, 12, 0, "-");
  hline(grid, 11, 12, 7, "-");
  hline(grid, 11, 12, 11, "-");
  hline(grid, 11, 12, 17, "-");
}

function stampOpen(grid: string[]) {
  hline(grid, 4, 19, 8, "-");
}

function findAnchor(grid: string[]): { col: number; row: number } {
  for (const ch of ["K", "D", "C", "^", "+"] as const) {
    for (let r = 0; r < ROWS; r++) {
      const c = grid[r].indexOf(ch);
      if (c >= 0) return { col: c, row: r };
    }
  }
  return { col: 11, row: 8 };
}
