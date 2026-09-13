/** 전역도 바탕 지형. 44×64, 16px 타일. 원본 그림. 정확한 해안선이 아니다. */
import { TERRAIN_CHAR } from "./types";

export const GRID_COLS = 64;
export const GRID_ROWS = 44;

export const STRATEGIC_TERRAIN_GRID: string[] = [
  "AAAAAAAA____________,,,,,,,,,,,,,,..........nnnnTTTTTTTTTTTTTTTT", // 0
  "AAAAAAAA____________,,,,,,,,,,,,,,..........nnnnTTTTTTTTTTTTTTTT", // 1
  "AAAAAAAA____________,,,,,,,,,,,,,,..........nnnnTTTTTTTTTTTTssss", // 2
  "AAAAAAAA____________,,,,,,,,,,,,,,..........nnnnTTTTTTTTTTTTssss", // 3
  "AAAAAAAA____________,,,,,,,,,,,,,,..........nnnn~~AAnnAAAAssssss", // 4
  "AAAAAAAA____________,,,,,,,,,,,,,,..........nnnn~~AAnnnAAAssssss", // 5
  "AAAAAAAA,,,,,,~~~~~~~~,,,,,,,,,,..ssssssssnnnnnn~~AAAAnnAAssssss", // 6
  "AAAAAAAA,,,,,,~~~~~~~~,,,,,,,,,,..ssssssssnnnnnn~~AAAnnnAAssssss", // 7
  "AAAAAAAAAAAA~~~~____~~,,AAnn,,,,..ssssssssnnnnssssssA,,,,Assssss", // 8
  "AAAAAAAAAAAA~~~~____~~,,AAnn,,,,..ssssssssnnnnssssssAA,,,Assssss", // 9
  "AAAAAAAAAA~~~~______~~,,AAnn,,,,..ssssssssssssssssss..,,nnssssss", // 10
  "AAAAAAAAAA~~~~______~~,,AAnn,,,,..sssssssss,,,ssssss..n,nnssssss", // 11
  "AAAAAAAA~~~~nn______~~nnAAnn,,,,~~~~nnnnnn,,,,,sssss..,nnnssssss", // 12
  "AAAAAAAA~~~~nn______~~nnAAnn,,,,~~~~nnnnnnn,,,ssssss..nnnnssssss", // 13
  "AAAAAA~~~~nnnn..nnnn~~~~~~~~==~~~~nnnnnnssssssssssssssnnnnssssss", // 14
  "AAAAAA~~~~nnnn..nnnn~~~~~~~~==~~~~nnnnnnssssssssssssssnnnnssssss", // 15
  "AAAAAAAAnnnnnn======~~~~==~~~~~~====..ssssssssssssssssnnssssssss", // 16
  "AAAAAAAAnnnnnn======~~~~==~~~~~~====..ssssssssssssssssnnssssssss", // 17
  "AAAAAAAAnnnnnn======================....ssssssssssssssssssssssss", // 18
  "AAAAAAAAnnnnnn======================....ssssssssssssssssssssssss", // 19
  "AAAAAAAAAAAA..AAAAAA..==============......ssssssssnnssssssssssss", // 20
  "AAAAAAAAAAAA..AAAAAA..==============......ssssssssnnssssssssssss", // 21
  "AAAAAA========nn..................~~~~~~~~ssssssssssssssssssssss", // 22
  "AAAAAA========nn..................~~~~~~~~ssssssssssssssssssssss", // 23
  "AAAAAA========nn~~~~~~~~~~~~~~~~~~~~====ssssssssssssssssssssssss", // 24
  "AAAAAA========nn~~~~~~~~~~~~~~~~~~~~====ssssssssssssssssssssssss", // 25
  "AAAAAA~~~~~~~~~~~~==========~~~~==..======ssssssssssssssssssssss", // 26
  "AAAAAA~~~~~~~~~~~~==========~~~~==..======ssssssssssssssssssssss", // 27
  "AAAAAAnnnnnnnnnnTT================TTTTTTTTssssssssssssssssssssss", // 28
  "AAAAAAnnnnnnnnnnTT================TTTTTTTTssssssssssssssssssssss", // 29
  "AAAAAATTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssssssssssssssssssssss", // 30
  "AAAAAATTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssssssssssssssssssssss", // 31
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssssssssssssssssssssssss", // 32
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssssssssssssssssssssssss", // 33
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssnnnnssssssssssssssssssss", // 34
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssnnnnssssssssssssssssssss", // 35
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssnnnnssssssssssssssssssss", // 36
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssnnnnssssssssssssssssssss", // 37
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssssnnssssssssssssssssssssss", // 38
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssssnnssssssssssssssssssssss", // 39
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssssssssssssssssssssssssssssssss", // 40
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTssssssssssssssssssssssssssssssssss", // 41
  "TTTTTTTTTTTTTTTTTTTTTTssssssssssssssssssssssssssssssssssssssssss", // 42
  "TTTTTTTTTTTTTTTTTTTTTTssssssssssssssssssssssssssssssssssssssssss", // 43
];

(function assertStrategicGrid() {
  if (STRATEGIC_TERRAIN_GRID.length !== GRID_ROWS) {
    throw new Error(`strategic terrain: expected ${GRID_ROWS} rows, got ${STRATEGIC_TERRAIN_GRID.length}`);
  }
  STRATEGIC_TERRAIN_GRID.forEach((row, i) => {
    if (row.length !== GRID_COLS) {
      throw new Error(`strategic terrain row ${i}: expected ${GRID_COLS} chars, got ${row.length}`);
    }
    for (const ch of row) {
      if (!(ch in TERRAIN_CHAR)) {
        throw new Error(`strategic terrain row ${i}: unknown terrain char ${JSON.stringify(ch)}`);
      }
    }
  });
})();
