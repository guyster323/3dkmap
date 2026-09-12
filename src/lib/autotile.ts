import { TERRAIN_CHAR, type TerrainChar, type TerrainKind } from "@/data/terrain/types";

export type { TerrainKind };

/** Wang 4-bit edge mask: N=1, E=2, S=4, W=8. `localIndex = N*1 + E*2 + S*4 + W*8`. */
export const EDGE = {
  N: 1,
  E: 2,
  S: 4,
  W: 8,
} as const;

/**
 * Pairs that count as the same terrain group for autotile edges.
 * Identity is always connected; this table is only the cross-kind joins.
 *
 * river↔sea: 수면이 이어진다.
 * road↔bridge / river↔bridge / sea↔bridge: 다리가 길·물을 끊지 않는다.
 * wall↔gate: 성문이 성벽 이음새를 끊지 않는다.
 * hill↔mountain: 기슭이 산으로 이어진다.
 */
const CONNECTS: ReadonlyArray<readonly [TerrainKind, TerrainKind]> = [
  ["river", "sea"],
  ["road", "bridge"],
  ["river", "bridge"],
  ["sea", "bridge"],
  ["wall", "gate"],
  ["hill", "mountain"],
];

const CONNECT_SET = new Set<string>();
for (const [a, b] of CONNECTS) {
  CONNECT_SET.add(`${a}|${b}`);
  CONNECT_SET.add(`${b}|${a}`);
}

export function sameTerrainGroup(a: TerrainKind, b: TerrainKind): boolean {
  if (a === b) return true;
  return CONNECT_SET.has(`${a}|${b}`);
}

export function parseTerrainGrid(grid: string[]): TerrainKind[][] {
  return grid.map((line) =>
    Array.from(line, (ch) => {
      const kind = TERRAIN_CHAR[ch as TerrainChar];
      if (!kind) {
        throw new Error(`unknown terrain char ${JSON.stringify(ch)}`);
      }
      return kind;
    }),
  );
}

function cellAt(grid: TerrainKind[][], col: number, row: number, self: TerrainKind): TerrainKind {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  if (row < 0 || row >= rows || col < 0 || col >= cols) return self;
  return grid[row][col];
}

/** 맵 밖은 같은 지형으로 본다. 가장자리에 불필요한 테두리가 생기지 않는다. */
export function edgeMask(grid: TerrainKind[][], col: number, row: number): number {
  const self = grid[row][col];
  const n = sameTerrainGroup(self, cellAt(grid, col, row - 1, self)) ? 1 : 0;
  const e = sameTerrainGroup(self, cellAt(grid, col + 1, row, self)) ? 1 : 0;
  const s = sameTerrainGroup(self, cellAt(grid, col, row + 1, self)) ? 1 : 0;
  const w = sameTerrainGroup(self, cellAt(grid, col - 1, row, self)) ? 1 : 0;
  return n * EDGE.N + e * EDGE.E + s * EDGE.S + w * EDGE.W;
}

export function edgeMasks(grid: TerrainKind[][]): number[][] {
  return grid.map((line, row) => line.map((_, col) => edgeMask(grid, col, row)));
}

export const AUTOTILE_KINDS: ReadonlySet<TerrainKind> = new Set([
  "forest",
  "hill",
  "mountain",
  "river",
  "sea",
  "road",
  "wall",
]);
