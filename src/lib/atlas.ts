export const ATLAS = {
  tiles: "/assets/eiketsu/tileset.png",
  units: "/assets/eiketsu/units.png",
  kao: "/assets/eiketsu/kao.png",
  tile: 16,
  tileCols: 8,
  unitW: 32,
  unitH: 64,
  kaoW: 64,
  kaoH: 80,
  kaoCols: 4,
} as const;

export const TILE_INDEX = {
  plain: 0,
  plain2: 1,
  forest: 2,
  mountain: 3,
  water0: 4,
  water1: 5,
  waste: 6,
  wall: 7,
  gate: 8,
  keep: 9,
  camp: 10,
  palisade: 11,
  cursor: 12,
} as const;

export const UNIT_ROWS = [
  "liu-bei",
  "guan-yu",
  "zhang-fei",
  "cao-cao",
  "dong-zhuo",
  "lu-bu",
  "sun-jian",
  "gogukcheon",
] as const;

export function unitRow(characterId?: string, faction?: string): number {
  if (characterId) {
    const i = UNIT_ROWS.indexOf(characterId as (typeof UNIT_ROWS)[number]);
    if (i >= 0) return i;
  }
  if (faction === "cao") return 3;
  if (faction === "dong") return 4;
  if (faction === "lu-bu") return 5;
  if (faction === "sun") return 6;
  if (faction === "goguryeo" || faction === "mahan") return 7;
  if (faction === "liu") return 0;
  return 0;
}

export function kaoCell(characterId: string): { sx: number; sy: number } | null {
  const i = UNIT_ROWS.indexOf(characterId as (typeof UNIT_ROWS)[number]);
  if (i < 0) return null;
  return { sx: (i % ATLAS.kaoCols) * ATLAS.kaoW, sy: Math.floor(i / ATLAS.kaoCols) * ATLAS.kaoH };
}
