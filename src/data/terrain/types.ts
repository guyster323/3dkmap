import type { FactionId } from "@/lib/types";

export const TERRAIN_CHAR = {
  ".": "plain",
  ",": "grass",
  "=": "field",
  "_": "waste",
  "T": "forest",
  "n": "hill",
  "A": "mountain",
  "~": "river",
  "s": "sea",
  "-": "road",
  "+": "bridge",
  "#": "wall",
  "D": "gate",
  "K": "keep",
  "C": "camp",
  "|": "palisade",
  "^": "tower",
} as const;

export type TerrainChar = keyof typeof TERRAIN_CHAR;
export type TerrainKind = (typeof TERRAIN_CHAR)[TerrainChar];

export type BattleMapMarker = {
  col: number;
  row: number;
  kind: "banner" | "gate" | "tent" | "beacon";
  faction?: FactionId;
  label?: string;
};

export type BattleMap = {
  id: string;
  placeId: string;
  cols: 24;
  rows: 18;
  grid: string[];
  markers: BattleMapMarker[];
  /** 지형 근거의 한계. 기록이 없으면 그 사실을 적는다. */
  note?: string;
};

export type StrategicNode = {
  placeId: string;
  x: number;
  y: number;
  tier: 1 | 2 | 3;
  battleMapId?: string;
};

export type StrategicEdge = {
  from: string;
  to: string;
  kind: "road" | "river" | "sea" | "pass";
};

export type StrategicTerritory = {
  faction: FactionId;
  year: number;
  polygon: [number, number][];
};
