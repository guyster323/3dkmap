/**
 * 전역도 바탕 지형. 22×32 개략도.
 *
 * 한 칸이 대략 경도 1°, 위도 1.05° 이다 (MAP_BOUNDS lon 100–132, lat 21–44,
 * 셀 중심은 렌더러와 같이 (c+0.5)*32, (r+0.5)*32 를 unproject 한 값).
 * 발해·산둥반도·황해·한반도·황하 오르도스 굽이·장강 사행만 알아볼 수 있게 손으로 그렸다.
 * 그 밖은 평범한 지형으로 두었다. 정확한 해안선이 아니다.
 */
import { TERRAIN_CHAR } from "./types";

/** ceil(1000 / ATLAS.tile). 렌더러가 이 값을 쓴다. */
export const GRID_COLS = 32;
/** ceil(700 / ATLAS.tile). 렌더러가 이 값을 쓴다. */
export const GRID_ROWS = 22;

/**
 * 행 0 = 북(위도 ~43.5), 행 21 = 남(위도 ~21.4).
 * 열 0 = 서(경도 ~100.5), 열 31 = 동(경도 ~132.3).
 * 문자 범례는 TERRAIN_CHAR.
 */
export const STRATEGIC_TERRAIN_GRID: string[] = [
  //    01234567890123456789012345678901
  "AAAA______,,,,,,,.....nnTTTTTTTT", // 0 초원·고비·장백
  "AAAA______,,,,,,,.....nnTTTTTTss", // 1
  "AAAA______,,,,,,,.....nn~AAAAsss", // 2 압록 북, 국내성
  "AAAA,,,~~~~,,,,,.ssssnnn~AAAAsss", // 3 황하 북굽이, 발해, 요동, 압록
  "AAAAAA~~__~,An,,.ssssnnnsnAAAsss", // 4 오르도스, 발해, 낙랑
  "AAAAA~~___~,An,,.ssssssss..nnsss", // 5 발해 해협·황해
  "AAAA~~n___~nAn,,~~nnnnsss..nnsss", // 6 산둥반도
  "AAA~~nn.nn~~~~=~~nnnsssss..nnsss", // 7 황하 하류, 산둥 남안
  "AAAAnnn===~~=~~~==.ssssss..nssss", // 8 관중·중원, 황하
  "AAAAnnn===========..ssssss.sssss", // 9 장안·허창, 한반도 남단
  "AAAAAA.AAA.=======...ssssnssssss", // 10 진령, 한중 틈, 제주
  "AAA====n.........~~~~sssssssssss", // 11 성도 분지, 장강 하구
  "AAA====n~~~~~~~~~~==ssssssssssss", // 12 장강 중류
  "AAA~~~~~~=====~~=.===sssssssssss", // 13 장강 사천·적벽
  "AAAnnnnnT========TTTTsssssssssss", // 14
  "AAATTTTTTTTTTTTTTTTTssssssssssss", // 15 남만 숲
  "TTTTTTTTTTTTTTTTTTTsssssssssssss", // 16
  "TTTTTTTTTTTTTTTTTTTsnnssssssssss", // 17 대만
  "TTTTTTTTTTTTTTTTTTssnnssssssssss", // 18
  "TTTTTTTTTTTTTTTTTsssnsssssssssss", // 19
  "TTTTTTTTTTTTTTTsssssssssssssssss", // 20
  "TTTTTTTTTTTsssssssssssssssssssss", // 21 남해
];

(function assertStrategicGrid() {
  if (STRATEGIC_TERRAIN_GRID.length !== GRID_ROWS) {
    throw new Error(
      `strategic terrain: expected ${GRID_ROWS} rows, got ${STRATEGIC_TERRAIN_GRID.length}`,
    );
  }
  STRATEGIC_TERRAIN_GRID.forEach((row, i) => {
    if (row.length !== GRID_COLS) {
      throw new Error(
        `strategic terrain row ${i}: expected ${GRID_COLS} chars, got ${row.length}`,
      );
    }
    for (const ch of row) {
      if (!(ch in TERRAIN_CHAR)) {
        throw new Error(
          `strategic terrain row ${i}: unknown terrain char ${JSON.stringify(ch)}`,
        );
      }
    }
  });
})();
