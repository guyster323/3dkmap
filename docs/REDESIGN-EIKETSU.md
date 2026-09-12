# 천하동시 전면 개편 규격 — 영걸전 문법

이 문서는 계약(contract)이다. 병렬 작업자는 서로의 산출물을 기다리지 않고
이 문서의 인터페이스만 믿고 작업한다. 여기 적힌 상수·키·파일 경로는 협의 없이
바꾸지 않는다. 바꿔야 하면 코디네이터에게 `ask` 로 물어본다.

---

## 0. 무엇을 만드는가 (가장 중요)

**이 앱은 게임이 아니다.** 요코야마 미츠테루 『전략 삼국지』 60권을 읽는 동무다.
영걸전은 *기능*이 아니라 *껍데기*로 쓴다. 전투 시스템·턴·전투 판정을 만들지 않는다.

영걸전 UI 문법을 앱의 실제 기능에 1:1로 매핑한다:

| 영걸전 요소 | 천하동시에서의 의미 |
|---|---|
| 턴 표시 | 정지된 연월 (`영제 중평 원년 삼월`) + 권·회차 |
| 전투맵 격자 | 그 시각 사건이 벌어지는 거점의 지형 |
| 유닛 정보창 | 인물 정보창 (kao + 이름/자/진영 + 첫 등장 권) |
| 지형 정보창 | 거점 정보창 (지명/한자/현대 지명/비고) |
| 커맨드 윈도우 | 줄거리 / 인물 / 사료 / 같은 시각 / 수위 |
| 이동 범위 하이라이트 | 같은 시각 다른 곳에서 벌어진 사건 거점 하이라이트 |
| 전역도 진행 노드 | 60권 연표 위의 거점 노드 |

**시계는 정지해 있다.** 재생·배속 버튼을 만들지 않는다. 이전 사건 / 다음 사건으로
이산 이동만 한다. 기존 `scripts/verify.mjs` 가 재생 버튼 부재를 검사한다.

## 1. 불가침 (위반 시 작업 거부)

1. KOEI 영걸전/조조전, 요코야마 만화의 **원본 파일을 디코딩·리핑·재배포하지 않는다.**
   차용하는 것은 *규격*(셀 크기, 창틀 구조, 화면 배치)뿐이다. 모든 픽셀은 이 저장소에서
   `scripts/build_eiketsu_atlas.py` 로 생성한 오리지널이다.
2. 다음 파일은 **읽기 전용**이다. 한 글자도 수정하지 않는다:
   `src/data/episodes.ts`, `src/data/episodes-mid.ts`, `src/data/episodes-late.ts`,
   `src/data/events.ts`, `src/data/characters.ts`, `src/data/volumes.ts`, `src/data/places.ts`
   (새 필드가 필요하면 별도 파일에 사이드테이블로 두고 id 로 join 한다.)
3. 만화 작화·대사를 쓰지 않는다. 본문은 연의/정사/자치통감/후한서/삼국사기 레이어.
4. 기록이 없는 해의 한반도를 날조하지 않는다.
5. 한글 레이블을 `canvas.strokeText` 로 그리지 않는다. 8px 캔버스 한글은 읽을 수 없다.
   레이블은 캔버스 위 DOM 오버레이로 띄운다 (선택·키보드·스크린리더 가능).
6. 모바일 히트 타깃 44px 이상.
7. `npm run build` 와 `npm run lint` 가 통과해야 완료다.

---

## 2. 디자인 토큰 계약 — `src/app/globals.css`

기존 나무·금테(`--color-wood`, `.wood-panel`)는 **폐기**한다. 영걸전 남색 창틀로 전환.
기존 토큰 이름을 지우기 전에 `grep -rn "wood-panel\|wood-inlay\|gold-btn" src` 로
호출처를 전부 찾아 새 컴포넌트로 치환한다.

```css
@theme {
  /* 창틀 */
  --color-eik-win-top:    #1c2f5e;
  --color-eik-win-mid:    #14224a;
  --color-eik-win-bot:    #0a1226;
  --color-eik-bevel-hi:   #e8e0c8;
  --color-eik-bevel-lo:   #04070f;
  --color-eik-gold:       #d8b74a;
  --color-eik-gold-dim:   #8a7430;

  /* 글자 */
  --color-eik-text:       #f0ead8;
  --color-eik-text-dim:   #9aa8c4;
  --color-eik-text-ink:   #0a1226;

  /* 강조 */
  --color-eik-cinnabar:   #c23b22;
  --color-eik-jade:       #3d8b7a;
  --color-eik-hp:         #4aae52;
  --color-eik-hp-warn:    #d8b74a;
  --color-eik-hp-crit:    #c23b22;

  /* 바탕 */
  --color-eik-void:       #060a14;

  --font-pixel: "Galmuri11", "DungGeunMo", "Noto Sans KR", system-ui, sans-serif;
  --font-serif: "Noto Serif KR", "Songti SC", serif;
}
```

### 창틀 4겹 (영걸전 특유)

바깥부터: `2px #04070f` → `1px #d8b74a` → 본문 `linear-gradient(180deg,#1c2f5e,#0a1226)`
→ 안쪽 상단·좌측 `1px #e8e0c8` 하이라이트 (inset box-shadow).

```css
.eik-win {
  background: linear-gradient(180deg, var(--color-eik-win-top) 0%,
                              var(--color-eik-win-mid) 55%,
                              var(--color-eik-win-bot) 100%);
  border: 2px solid var(--color-eik-bevel-lo);
  box-shadow:
    inset 0 0 0 1px var(--color-eik-gold),
    inset 0 1px 0 2px rgba(232,224,200,0.35),
    0 2px 0 0 var(--color-eik-bevel-lo);
}
```

`.eik-win--active` 는 금테를 `#f0dc8a` 로 밝히고, `.eik-win--flat` 은 그라데이션 없이
`--color-eik-win-mid` 단색 (중첩 창 안쪽용).

### 타이포 램프

| 용도 | 크기/굵기 | 폰트 |
|---|---|---|
| 연월 표시 | 20px / 700 | serif |
| 창 제목(명패) | 13px / 700, letter-spacing .08em | pixel |
| 본문 | 14px / 400, line-height 1.7 | pixel |
| 수치(HP·좌표) | 12px / 700, tabular-nums | pixel |
| 사료 뱃지 | 11px / 700 | pixel |

`Galmuri11` 은 OFL 1.1 비트맵 한글 폰트다. **자동으로 내려받지 말 것.**
`public/fonts/` 에 없으면 fallback 스택이 그대로 동작하도록 작성한다.

---

## 3. 아틀라스 계약 — `public/assets/eiketsu/` + `src/lib/atlas.ts`

모두 `scripts/build_eiketsu_atlas.py` (Pillow) 가 생성한다. 손으로 PNG를 만들지 않는다.

### 3-1. 지형 타일셋 `tiles32.png`

- 셀 **32×32**, 시트 **16열**, 총 10행 → 512×320
- 인덱스 = `row * 16 + col`

| row | idx | 내용 |
|---|---|---|
| 0 | 0–15 | 단일 타일: 평지×4, 초지×4, 논×4, 황무지×4 |
| 1 | 16–31 | 숲 오토타일 16 |
| 2 | 32–47 | 구릉 오토타일 16 |
| 3 | 48–63 | 산 오토타일 16 |
| 4 | 64–79 | 하천 오토타일 16 |
| 5 | 80–95 | 바다·해안 오토타일 16 |
| 6 | 96–111 | 도로 오토타일 16 |
| 7 | 112–127 | 성벽 오토타일 16 |
| 8 | 128–143 | 구조물: 성문×4(방향), 성채×4, 망루×2, 막사×2, 목책×2, 다리×2 |
| 9 | 144–159 | 오버레이: 커서×4(2프레임×2색), 사건범위×4, 선택×4, 깃발×4 |

**오토타일 인덱싱 (Wang 4-bit edge mask)** — 협의 없이 바꾸지 않는다:

```
bit0 = 북(N)  bit1 = 동(E)  bit2 = 남(S)  bit3 = 서(W)
같은 지형이 그 방향에 인접하면 1.
localIndex = N*1 + E*2 + S*4 + W*8   (0..15)
tileIndex  = rowBase + localIndex
```
`localIndex 0` = 사방 고립(섬), `15` = 사방 둘러싸임(내부).

### 3-2. 유닛 `units.png`

- 셀 **32×64**, 4열 = `[우향 f0, 우향 f1, 좌향 f0, 좌향 f1]`
- 행 = 병종 × 진영. 병종 8종을 파이썬에서 진영 팔레트로 리컬러해 굽는다.

```
병종(UNIT_KIND): 보병 infantry / 창병 spear / 기병 cavalry / 궁병 archer
                 노병 crossbow / 수군 navy / 책사 strategist / 군주 lord
진영(FACTION_ID): types.ts 의 FactionId 17종 중 지도에 실제로 서는 것만.
```
행 순서는 파이썬이 `units.index.json` 으로 함께 출력한다:
```json
{ "cellW":32, "cellH":64, "cols":4,
  "rows": [ {"kind":"lord","faction":"liu","row":0} ] }
```
`src/lib/atlas.ts` 는 이 JSON을 import 해서 행을 찾는다. 하드코딩 배열 금지.

고유 무장 스프라이트는 `units-officer.png` 로 분리, 같은 셀 규격,
`units-officer.index.json` 에 `characterId -> row`.

### 3-3. 얼굴 `kao.png`

- 셀 **64×80**, 8열
- **파츠 컴포저**로 생성한다. 인물마다 손으로 찍지 않는다.

```python
KAO_PARTS = {
  "face":    ["oval","square","round","gaunt"],
  "skin":    ["#e8c9a0","#d4a878","#c23b22"],       # 관우는 적면
  "brow":    ["straight","angled","thick","thin"],
  "eye":     ["calm","fierce","narrow","wide"],
  "beard":   ["none","short","long","full","forked"],
  "hair":    ["topknot","loose","braid"],
  "headgear":["crown","jinxian","helm","plume","tiger","turban","wings","cloth"],
  "armor":   ["scale","lamellar","robe","cloak"],
}
```
인물별 파라미터는 **새 파일** `src/data/kao-params.ts` 에 둔다
(`characters.ts` 를 건드리지 않기 위해). `characterId -> KaoParams`.
시트에 없는 인물은 기존 낙관(seal) fallback을 유지한다.

`kao.index.json` 에 `characterId -> {col,row}`.

### 3-4. `src/lib/atlas.ts` 가 노출해야 할 것

```ts
export const ATLAS = {
  tiles: "/assets/eiketsu/tiles32.png",
  units: "/assets/eiketsu/units.png",
  officers: "/assets/eiketsu/units-officer.png",
  kao: "/assets/eiketsu/kao.png",
  tile: 32, tileCols: 16,
  unitW: 32, unitH: 64, unitCols: 4,
  kaoW: 64, kaoH: 80, kaoCols: 8,
} as const;

export const TILE_ROW = {
  single: 0, forest: 1, hill: 2, mountain: 3,
  river: 4, sea: 5, road: 6, wall: 7, structure: 8, overlay: 9,
} as const;

export function autoTile(row: number, mask: number): number;   // rowBase + mask
export function unitCell(kind: UnitKind, faction: FactionId, dir: 0|1, frame: 0|1): {sx:number;sy:number};
export function officerCell(characterId: string, dir: 0|1, frame: 0|1): {sx:number;sy:number} | null;
export function kaoCell(characterId: string): {sx:number;sy:number} | null;
```

---

## 4. 지형 데이터 계약 — `src/data/terrain/` (신규 디렉터리)

### 4-1. 전투맵 `src/data/terrain/battle-maps.ts`

문자 그리드로 저작한다. diff 로 검토 가능해야 한다.

```ts
export const TERRAIN_CHAR = {
  ".": "plain",  ",": "grass",  "=": "field",  "_": "waste",
  "T": "forest", "n": "hill",   "A": "mountain",
  "~": "river",  "s": "sea",    "-": "road",   "+": "bridge",
  "#": "wall",   "D": "gate",   "K": "keep",   "C": "camp",
  "|": "palisade", "^": "tower",
} as const;

export type BattleMap = {
  id: string;            // "guandu"
  placeId: string;       // places.ts 의 id. 반드시 실존해야 한다.
  cols: 24; rows: 18;    // 표준 24×18 (= 768×576 @32px)
  grid: string[];        // rows 줄, 각 줄 cols 글자
  markers: { col: number; row: number; kind: "banner"|"gate"|"tent"|"beacon";
             faction?: FactionId; label?: string }[];
};
```

**저작 대상 (1차 12개)** — 나머지는 `placeId` 의 `kind`/`region` 으로 생성한
절차적 fallback 맵을 쓴다:
`luoyang 낙양`, `changan 장안`, `hulao 호로관`, `guandu 관도`, `chibi 적벽`,
`xiapi 하비`, `wan 완`, `jianye 말릉`, `chengdu 성도`, `wuzhang 오장원`,
`gongnae 국내성`, `lelange 낙랑`

지형은 실제 지리에 맞춘다. 관도는 황하 남안 평지 + 토성, 적벽은 장강 양안 + 절벽,
호로관은 협곡 사이 관문, 오장원은 위수 북안 대지, 국내성은 압록강변 산성.
지어내지 말고 `places.ts` 의 `note` 와 좌표를 근거로 삼는다.

### 4-2. 전역도 `src/data/terrain/strategic.ts`

```ts
export type StrategicNode = {
  placeId: string;
  x: number; y: number;        // 전역도 논리 좌표 (0..1000, 0..700)
  tier: 1 | 2 | 3;             // 1=도읍 2=주요성 3=거점
  battleMapId?: string;
};
export type StrategicEdge = {
  from: string; to: string;    // placeId
  kind: "road" | "river" | "sea" | "pass";
};
```
`x/y` 는 `src/lib/projection.ts` 의 `project(lon,lat)` 결과(0..100)를 ×10, ×7 한 값에서
출발해 겹침만 손으로 푼다. 지리를 크게 왜곡하지 않는다.

세력 경계는 별도 레이어: `StrategicTerritory { faction, year, polygon: [x,y][] }`.
**연표 근거가 없는 해의 경계는 만들지 않는다.** 근거 없으면 그 해는 경계를 그리지 않는다.

---

## 5. UI 크롬 컴포넌트 계약 — `src/components/eiketsu/`

전부 신규 디렉터리. 기존 `WoodPanel.tsx` 는 마지막 호출처가 사라지면 삭제.

| 파일 | 컴포넌트 | 역할 |
|---|---|---|
| `Window.tsx` | `<EikWindow title? variant? active?>` | 4겹 창틀 기본형 |
| `CommandWindow.tsx` | `<CommandWindow items onPick>` | 세로 메뉴. ↑↓·Enter·Esc 키보드 필수 |
| `UnitPanel.tsx` | `<UnitPanel character>` | kao + 이름/자/진영/첫 등장 권 |
| `TerrainPanel.tsx` | `<TerrainPanel place terrain>` | 지명/한자/현대명/지형/비고 |
| `DialogueBox.tsx` | `<DialogueBox character name body sources>` | kao + 본문 + 사료 뱃지 |
| `NamePlate.tsx` | `<NamePlate>` | 창 좌상단에 걸리는 명패 |
| `StatBar.tsx` | `<StatBar value max>` | HP 스타일 게이지 (중요도·완성도 표시용) |
| `SourceBadge.tsx` | `<SourceBadge kind>` | 기존 `SourceChips` 를 영걸전 뱃지로 교체 |

모든 컴포넌트는 서버 컴포넌트로 렌더 가능해야 한다 (상호작용 있는 것만 `"use client"`).

---

## 6. 렌더러 계약 — `src/components/`

### `BattleMapCanvas.tsx`
- `<canvas>` 에 타일만 그린다. `imageSmoothingEnabled = false`.
- 레이블/마커/유닛 툴팁은 **캔버스 위 절대배치 DOM**. 각 거점은 `<button>` 이라
  Tab 순회·Enter 선택이 된다.
- props: `{ map: BattleMap, units: MapUnit[], selectedId?, onSelect, highlight: string[] }`
- 줌 1×/2× 토글 유지 (`verify.mjs` 가 「2배 확대」 버튼을 검사한다 — 라벨 유지).
- 오토타일 마스크 계산은 `src/lib/autotile.ts` 로 분리하고 순수 함수로 둔다.

### `StrategicMapCanvas.tsx`
- 전역도. 노드 = DOM 버튼, 엣지·세력 경계 = SVG, 바탕 지형 = canvas.
- 노드 클릭 → `battleMapId` 있으면 전투맵으로 전환, 없으면 거점 패널만 갱신.

### `src/lib/eiketsu.ts`
- `COLS/ROWS/TILE` 상수를 전투맵 기준(24/18/32)으로 교체.
- `buildTerrain` 의 modulo 노이즈 (`defaultTerrain`) 를 **삭제**한다.
  저작 맵이 없는 거점만 `proceduralFallback(place)` 로 만들고, 그 사실을
  화면에 「약식 지형」으로 표시한다. 지형을 아는 척하지 않는다.

---

## 7. 화면 구조 계약 — `src/app/`

| 경로 | 개편 후 |
|---|---|
| `/` | 시작. 영걸전 타이틀 화면 문법 (제목 + 커맨드 윈도우: 책 스캔 / 권 고르기 / 이어서) |
| `/world` | **전역도**. 정지된 연월 + 노드맵 + 지역 6스트립 + 사건 목록 |
| `/world/[placeId]` | **전투맵**. 그 거점 지형 + 인물 패널 + 거점 패널 + 커맨드 윈도우 |
| `/episodes/[id]` | 대화 씬 문법. kao + 줄거리 + 사료 뱃지 |
| `/characters/[id]` | 인물 정보창 확대판 |
| `/me` | 한반도 전역도 (기존 `KoreaLocator` 유지, 크롬만 교체) |
| `/volumes`, `/volumes/[n]` | 목차. 창틀만 교체, 구조 유지 |
| `/scan` | 크롬만 교체, 로직 유지 |

`WorldDashboard.tsx` 는 전역도와 전투맵으로 **분해**한다. 파일은 삭제.

`AppShell.tsx` 하단 내비게이션은 영걸전 커맨드 윈도우 톤으로 교체하되
4탭 구조(시작/세계/내 위치/목차)와 링크는 유지한다.

---

## 8. 검증 계약 — `scripts/verify.mjs`

기존 검사는 **전부 통과 상태로 유지**한다. 클래스 이름이 바뀌므로 셀렉터만 고친다.
특히 다음은 의미를 유지해야 한다:
- 「천하동시」 홈 제목, 60권 목록, 「시계 정지」, 재생 버튼 0개
- 사료 칩 연의/정사 존재, 연의 칩 색 (`cinnabar` → 새 토큰 이름으로 갱신)
- 「2배 확대」 버튼, canvas 존재

추가할 검사:
- 전역도 노드 클릭 → 전투맵 진입
- 전투맵에서 거점 레이블이 **DOM 텍스트**로 읽힌다 (`getByRole("button", {name:"관도"})`)
- 커맨드 윈도우 키보드 순회 (↑↓ Enter)
- 375px 뷰포트에서 가로 스크롤 없음

---

## 9. 작업 패키지와 소유권

파일 소유권은 배타적이다. 남의 WP 파일을 고치지 말고 코디네이터에게 `ask` 한다.

| WP | 이름 | 배타 소유 파일 | 의존 |
|---|---|---|---|
| WP1 | 아틀라스 생성기 | `scripts/build_eiketsu_atlas.py`, `public/assets/eiketsu/**`, `src/lib/atlas.ts`, `src/data/kao-params.ts` | — |
| WP2 | 지형·전역도 데이터 | `src/data/terrain/**`, `src/lib/projection.ts` | — |
| WP3 | UI 크롬 + 토큰 | `src/app/globals.css`, `src/components/eiketsu/**` | — |
| WP4 | 렌더러 | `src/components/BattleMapCanvas.tsx`, `src/components/StrategicMapCanvas.tsx`, `src/lib/autotile.ts`, `src/lib/eiketsu.ts` | WP1, WP2 |
| WP5 | 화면 재구성 | `src/app/**/page.tsx`, `src/app/layout.tsx`, `src/components/AppShell.tsx`, `src/components/SourceChips.tsx`, `src/components/WoodPanel.tsx`(삭제), `src/components/WorldDashboard.tsx`(해체) | WP3, WP4 |
| WP6 | 검증 | `scripts/verify.mjs` | WP5 |

웨이브: **[WP1‖WP2‖WP3] → WP4 → WP5 → WP6**

## 10. 완료 기준 (모든 WP 공통)

1. `npm run build` 통과, `npm run lint` 경고 0
2. 자기 WP의 산출물을 실제로 열어 확인한 증거를 보고에 적는다
   (WP1은 생성된 PNG 크기와 셀 수, WP2는 맵 수와 문자 그리드 검증 결과,
    WP3~5는 `npm run dev` 화면, WP6은 `npm run verify` 출력)
3. 남의 WP 파일을 건드리지 않았음 — `git diff --name-only` 로 확인
4. §1 불가침 조항 위반 없음
