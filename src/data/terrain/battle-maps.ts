import { TERRAIN_CHAR, type BattleMap, type BattleMapMarker } from "./types";

function battleMap(
  spec: Omit<BattleMap, "cols" | "rows">,
): BattleMap {
  const { id, grid, markers } = spec;
  if (grid.length !== 18) {
    throw new Error(`${id}: expected 18 rows, got ${grid.length}`);
  }
  grid.forEach((row, i) => {
    if (row.length !== 24) {
      throw new Error(`${id} row ${i}: expected 24 chars, got ${row.length}`);
    }
    for (const ch of row) {
      if (!(ch in TERRAIN_CHAR)) {
        throw new Error(`${id} row ${i}: unknown terrain char ${JSON.stringify(ch)}`);
      }
    }
  });
  for (const m of markers) {
    if (m.col < 0 || m.col >= 24 || m.row < 0 || m.row >= 18) {
      throw new Error(`${id}: marker out of bounds ${m.col},${m.row}`);
    }
  }
  return { cols: 24, rows: 18, ...spec };
}

const luoyang = battleMap({
  id: "luoyang",
  placeId: "luoyang",
  note: "후한 동도. 북쪽에 망산, 남쪽에 낙수가 흐른다. 190년 동탁이 불태움.",
  grid: [
    "nnnnnnnnnnnnnnnnnnnnnnnn",
    "nnnn,,,,nnnnnnnn,,,,nnnn",
    "......----------........",
    "...########D#########...",
    "...#.......KK.......#...",
    "...#.......KK.......#...",
    "...#................#...",
    "...#....--------....#...",
    "...D----------------D...",
    "...#................#...",
    "...#....,,,,,,,,....#...",
    "...#................#...",
    "...########D#########...",
    "......----------........",
    "~~~~~~~~+++~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "====-----====-----======",
    "====,,,,,====,,,,,======",
  ],
  markers: [
    { col: 11, row: 4, kind: "banner", faction: "han", label: "낙양" },
    { col: 11, row: 3, kind: "gate", label: "북문" },
    { col: 3, row: 8, kind: "gate", label: "서문" },
    { col: 20, row: 8, kind: "gate", label: "동문" },
    { col: 11, row: 12, kind: "gate", label: "남문" },
  ],
});

const changan = battleMap({
  id: "changan",
  placeId: "changan",
  note: "서도. 북쪽에 위수, 남쪽에 진령 기슭. 미앙궁은 성 서쪽.",
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~,,,,~~~~,,,,~~~~,,,,",
    "......----------........",
    "...########D#########...",
    "...#KK..............#...",
    "...#KK..............#...",
    "...#....--------....#...",
    "...D----------------D...",
    "...#................#...",
    "...#....,,,,,,,,....#...",
    "...#................#...",
    "...########D#########...",
    "......----------........",
    "............nnnnnn......",
    ".........nnnnnnnnnn.....",
    "....nnnnnnAAAAAAAAA.....",
    "nnnnnnnAAAAAAAAAAAAA....",
  ],
  markers: [
    { col: 5, row: 5, kind: "banner", faction: "han", label: "장안" },
    { col: 11, row: 4, kind: "gate", label: "북문" },
    { col: 3, row: 8, kind: "gate", label: "서문" },
    { col: 20, row: 8, kind: "gate", label: "동문" },
    { col: 11, row: 12, kind: "gate", label: "남문" },
  ],
});

const hulao = battleMap({
  id: "hulao",
  placeId: "hulao",
  note: "산 사이 좁은 협곡의 관문. 인근에 사수가 흐른다.",
  grid: [
    "AAAAAAAAAAAAAAAAAAAAAAAA",
    "AAAAAAAAAAAAAAAAAAAAAAAA",
    "AAAAAAAAnnnnnnnnAAAAAAAA",
    "AAAAAA............AAAAAA",
    "AAAAAA............AAAAAA",
    "AAAAAA.....^^.....AAAAAA",
    "AAAAAA----DDDD----AAAAAA",
    "AAAAAA----DDDD----AAAAAA",
    "AAAAAA............AAAAAA",
    "AAAAAA............AAAAAA",
    "nnnnnn~~~~~~~~~~~~nnnnnn",
    "nnnnnn~~~~~~~~~~~~nnnnnn",
    "AAAAAA............AAAAAA",
    "AAAAAAAA........AAAAAAAA",
    "AAAAAAAAAAAAAAAAAAAAAAAA",
    "AAAAAAAAAAAAAAAAAAAAAAAA",
    "AAAAAAnnnnnnnnnnAAAAAAAA",
    "AAAAAAAAAAAAAAAAAAAAAAAA",
  ],
  markers: [
    { col: 11, row: 6, kind: "gate", label: "호로관" },
    { col: 11, row: 5, kind: "beacon", label: "망루" },
    { col: 12, row: 5, kind: "beacon" },
    { col: 10, row: 6, kind: "banner", faction: "dong", label: "관문" },
  ],
});

const guandu = battleMap({
  id: "guandu",
  placeId: "guandu",
  note: "황하 남안 평지. 토성·진영. 북쪽에 원소 진, 남쪽에 조조 진.",
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~,,,,~~~~,,,,~~~~,,,,",
    "......||||||||||........",
    "......|CCCCCCCC|........",
    "......|CCCCCCCC|........",
    "......||||||||||........",
    "............--..........",
    "------------+-----------",
    "=====......--......=====",
    "=====..............=====",
    "......||||||||||........",
    "......|CCCCCCCC|........",
    "......|CCCCCCCC|........",
    "......|||||DD|||||......",
    "______.....--.....______",
    "========================",
    ",,,,,,,,,,,,,,,,,,,,,,,,",
  ],
  markers: [
    { col: 10, row: 4, kind: "tent", faction: "yuan-shao", label: "원소 진" },
    { col: 8, row: 4, kind: "banner", faction: "yuan-shao" },
    { col: 10, row: 12, kind: "tent", faction: "cao", label: "조조 진" },
    { col: 8, row: 12, kind: "banner", faction: "cao" },
    { col: 11, row: 14, kind: "gate", label: "토성 문" },
  ],
});

const chibi = battleMap({
  id: "chibi",
  placeId: "chibi",
  note: "장강이 가로지르고 남안에 절벽과 숲. 전장 위치는 학계 비정이 갈림.",
  grid: [
    ",,,,,,,,,,,,,,,,,,,,,,,,",
    "....CCCC....CCCC........",
    "....CCCC....CCCC........",
    "______..........________",
    "........------..........",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "nnnnnnnn~~~~nnnnnnnnnnnn",
    "nnnnTTTT~~~~TTTTTTTTTTTT",
    "TTTTAAAA~~~~AAAATTTTTTTT",
    "nnnnTTTT~~~~TTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTTTTTT",
    "TTTT....----....TTTTTTTT",
    "nnnnCCCCCCCCCCCC....nnnn",
    "....CCCCCCCCCCCC........",
    ",,,,,,,,,,,,,,,,,,,,,,,,",
  ],
  markers: [
    { col: 6, row: 1, kind: "tent", faction: "cao", label: "조조 수군" },
    { col: 4, row: 1, kind: "banner", faction: "cao" },
    { col: 8, row: 15, kind: "tent", faction: "sun", label: "주유 진" },
    { col: 6, row: 15, kind: "banner", faction: "sun" },
  ],
});

const xiapi = battleMap({
  id: "xiapi",
  placeId: "xiapi",
  note: "사수·기수가 성을 두른다. 조조가 물을 풀어 공성했다.",
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~..................~~",
    "~~...##############...~~",
    "~~...#............#...~~",
    "~~...#....KKKK....#...~~",
    "~~...#....KKKK....#...~~",
    "~~...#............#...~~",
    "~~...D------------D...~~",
    "~~...#............#...~~",
    "~~...#....,,,,....#...~~",
    "~~...#............#...~~",
    "~~...##############...~~",
    "~~.........--.........~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~+++~~~~~~~~~~~~~",
    "......------............",
    "..CCCCCCCC..............",
    ",,,,,,,,,,,,,,,,,,,,,,,,",
  ],
  markers: [
    { col: 10, row: 4, kind: "banner", faction: "lu-bu", label: "하비" },
    { col: 5, row: 7, kind: "gate", label: "서문" },
    { col: 18, row: 7, kind: "gate", label: "동문" },
    { col: 4, row: 16, kind: "tent", faction: "cao", label: "조조 진" },
  ],
});

const wan = battleMap({
  id: "wan",
  placeId: "wan",
  note: "남양 분지의 완. 백하가 성을 지나고 주변은 전답.",
  grid: [
    "nnnn................nnnn",
    ",,,,....----....,,,,,,,,",
    "....----------..........",
    "...########D#########...",
    "...#................#...",
    "...#.......KK.......#...",
    "...#................#...",
    "...D----------------D...",
    "...#................#...",
    "...#....,,,,,,,,....#...",
    "...#................#...",
    "...########D#########...",
    "......----------........",
    "~~~~~~~~+++~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "====-----====-----======",
    "========================",
    ",,,,====,,,,====,,,,,,,,",
  ],
  markers: [
    { col: 11, row: 5, kind: "banner", label: "완" },
    { col: 11, row: 3, kind: "gate", label: "북문" },
    { col: 3, row: 7, kind: "gate", label: "서문" },
    { col: 20, row: 7, kind: "gate", label: "동문" },
    { col: 11, row: 11, kind: "gate", label: "남문" },
  ],
});

const jianye = battleMap({
  id: "jianye",
  placeId: "jianye",
  note: "장강이 북쪽에 있고, 서쪽은 석두성 언덕, 동쪽은 종산, 남쪽에 진회하.",
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "nn....----------....TTTT",
    "nn..########D#####..TTTT",
    "nn..#....KK......#..nTTT",
    "nn..#....KK......#..nnnn",
    "nn..D------------D..nnnn",
    "nn..#............#..nnnn",
    "nn..#............#..nnnn",
    "nn..########D#####..nnnn",
    "....----~~~~----........",
    "~~~~~~~~+++~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "====-----====-----======",
    ",,,,,,,,====,,,,,,,,,,,,",
    "TTTT,,,,TTTT,,,,TTTT,,,,",
    "nnnnnnnn....nnnnnnnnnnnn",
  ],
  markers: [
    { col: 9, row: 5, kind: "banner", faction: "sun", label: "말릉" },
    { col: 12, row: 4, kind: "gate", label: "북문" },
    { col: 4, row: 7, kind: "gate", label: "서문" },
    { col: 17, row: 7, kind: "gate", label: "동문" },
    { col: 12, row: 10, kind: "gate", label: "남문" },
  ],
});

const chengdu = battleMap({
  id: "chengdu",
  placeId: "chengdu",
  note: "성도 평야. 금강이 성을 지나고 주변은 관개 전답.",
  grid: [
    "====,,,,====,,,,====,,,,",
    "====,,,,====,,,,====,,,,",
    "....----------..........",
    "...########D#########...",
    "...#................#...",
    "...#.......KK.......#...",
    "...#................#...",
    "...D----------------D...",
    "...#................#...",
    "...#....,,,,,,,,....#...",
    "...#................#...",
    "...########D#########...",
    "......----------........",
    "~~~~~~~~+++~~~~~~~~~~~~~",
    "====-----====-----======",
    "========================",
    "====,,,,====,,,,====,,,,",
    ",,,,====,,,,====,,,,,,,,",
  ],
  markers: [
    { col: 11, row: 5, kind: "banner", faction: "liu", label: "성도" },
    { col: 11, row: 3, kind: "gate", label: "북문" },
    { col: 3, row: 7, kind: "gate", label: "서문" },
    { col: 20, row: 7, kind: "gate", label: "동문" },
    { col: 11, row: 11, kind: "gate", label: "남문" },
  ],
});

const wuzhang = battleMap({
  id: "wuzhang",
  placeId: "wuzhang",
  note: "위수 북안의 대지. 제갈 진은 원 위, 사마 진은 위수 남.",
  grid: [
    "______________nn________",
    "nnnnn______________nnnnn",
    ".....nnnnnnnnnnnnn......",
    "....nnCCCCCCCCCCnn......",
    "....nnCCCCCCCCCCnn......",
    "....nn||||DD||||nn......",
    "....nnnnnnnnnnnnnn......",
    "......nnnnnnnnnn........",
    "........----............",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "....CCCCCCCCCCCC........",
    "....CCCCCCCCCCCC........",
    "nnnnnn..........nnnnnnnn",
    "AAAAAAAAAAAAAAAAAAAAAAAA",
    "AAAAAAAAAAAAAAAAAAAAAAAA",
    "AAAAAAnnnnnnnnAAAAAAAAAA",
  ],
  markers: [
    { col: 10, row: 3, kind: "tent", faction: "liu", label: "제갈 진" },
    { col: 8, row: 3, kind: "banner", faction: "liu" },
    { col: 10, row: 5, kind: "gate", label: "원 위 목책" },
    { col: 8, row: 12, kind: "tent", faction: "cao", label: "사마 진" },
    { col: 6, row: 12, kind: "banner", faction: "cao" },
  ],
});

const gongnae = battleMap({
  id: "gongnae",
  placeId: "gongnae",
  note: "고구려 도읍(3세기 전후). 압록강변 산성. 강은 남쪽, 산은 사면.",
  grid: [
    "AAAAAAAAAAAAAAAAAAAAAAAA",
    "AAAAAAAAnnnnnnAAAAAAAAAA",
    "AAAA..............AAAAAA",
    "AAA.....TTTTTT.....AAAAA",
    "AA...##############...AA",
    "AA...#............#...AA",
    "AA...#....KKKK....#...AA",
    "AA...#............#...AA",
    "AA...D------------D...AA",
    "AA...#............#...AA",
    "AA...##############...AA",
    "AAA......----......AAAAA",
    "AAAA..............AAAAAA",
    "nnnnn~~~~~~~~~~nnnnnnnnn",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "TTTT~~~~TTTT~~~~TTTT~~~~",
    "AAAAAAAAAAAAAAAAAAAAAAAA",
  ],
  markers: [
    { col: 10, row: 6, kind: "banner", faction: "goguryeo", label: "국내성" },
    { col: 5, row: 8, kind: "gate", label: "서문" },
    { col: 18, row: 8, kind: "gate", label: "동문" },
  ],
});

const lelange = battleMap({
  id: "lelange",
  placeId: "lelange",
  note: "한 군현. 정확한 치소는 토성 비정. 대동강·평야·토성만 두고, 세력 지형은 넣지 않음.",
  grid: [
    ",,,,,,,,,,,,,,,,,,,,,,,,",
    ",,,,====,,,,====,,,,,,,,",
    "......----------........",
    "....##############......",
    "....#............#......",
    "....#....KKKK....#......",
    "....#............#......",
    "....D------------D......",
    "....#............#......",
    "....##############......",
    "......----------........",
    "~~~~~~~~+++~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "====-----====-----======",
    "====,,,,,====,,,,,======",
    ",,,,nnnn,,,,nnnn,,,,,,,,",
    "nnnn....nnnn....nnnn....",
  ],
  markers: [
    { col: 10, row: 5, kind: "banner", faction: "lelange", label: "낙랑" },
    { col: 4, row: 7, kind: "gate", label: "서문" },
    { col: 17, row: 7, kind: "gate", label: "동문" },
  ],
});

export const BATTLE_MAPS: BattleMap[] = [
  luoyang,
  changan,
  hulao,
  guandu,
  chibi,
  xiapi,
  wan,
  jianye,
  chengdu,
  wuzhang,
  gongnae,
  lelange,
];

export { TERRAIN_CHAR };
export type { BattleMap, BattleMapMarker };
