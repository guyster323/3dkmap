# 남은 작업 — 영걸전 개편 후속

`docs/REDESIGN-EIKETSU.md` 계약으로 진행한 전면 개편의 후속이다.
이 문서도 계약이다. 여기 적힌 상수·키·경로를 협의 없이 바꾸지 않는다.

작성 시각 기준 상태 (전부 직접 확인함):

- `npm run build` 통과 (클린 빌드)
- `npm run lint` 문제 0
- `npm run verify` **119 OK / 0 FAIL** (phone · tablet · 375)
- 전역도 라벨 겹침 375 / 768 / 1440 모두 0쌍
- 불가침 데이터 7개 파일 수정 시각 그대로 — 워커가 손대지 않음
- 레거시 제거 완료: `WorldDashboard` · `WoodPanel` · `TileMap` · `SourceChips` 삭제,
  `wood-panel` / `wood-inlay` / `gold-btn` / `--color-wood*` 잔재 0,
  조건부로 남겨 뒀던 `buildTerrain` 스텁 · `TILE_INDEX` · `unitRow` 제거 완료

아래 넷은 **결함이 아니라 약점**이다. 지금도 동작하고 검사를 통과한다.
급한 순서가 아니라 효과 순서로 적었다.

---

## 불가침 (전 작업 공통, 개편 때와 동일)

1. KOEI 영걸전/조조전, 요코야마 만화의 **원본 파일을 디코딩·리핑·재배포하지 않는다.**
   차용하는 것은 규격(셀 크기, 창틀 구조, 화면 배치)뿐이고 모든 픽셀은
   `scripts/build_eiketsu_atlas.py` 가 생성한 오리지널이다.
2. 다음 7개 파일은 **읽기 전용**이다. 한 글자도 고치지 않는다:
   `src/data/episodes.ts`, `episodes-mid.ts`, `episodes-late.ts`,
   `events.ts`, `characters.ts`, `volumes.ts`, `places.ts`
   (새 필드가 필요하면 별도 사이드테이블에 두고 id 로 join 한다. 예: `src/data/kao-params.ts`)
3. 만화 작화·대사를 쓰지 않는다. 본문은 연의/정사/자치통감/후한서/삼국사기 레이어.
4. 기록이 없는 것을 지어내지 않는다. 특히 한반도와 세력 경계.
   근거가 없으면 비워 두는 편이 날조보다 낫다.
5. 한글 레이블을 `canvas.strokeText` 로 그리지 않는다. DOM 으로 얹는다.
6. 재생·배속 버튼을 만들지 않는다. 시계는 정지해 있다.
7. 모바일 히트 타깃 44px 이상. 375px 폭에서 가로 스크롤 없음.
8. 이모지를 쓰지 않는다. 아이콘은 인라인 SVG 16/20/24px 그리드.
9. `npm run build` · `npm run lint` 경고 0 · `npm run verify` 전 검사 통과가 완료 조건이다.
   **검사를 약화시켜 통과시키지 않는다.**

---

## RT1. 전역도 해상도 — 해안선이 거칠다

### 현상
`/world` 를 1440px 에서 열면 황하의 오르도스 굽이와 장강 사행은 알아볼 수 있지만
**산둥반도가 튀어나와 보이지 않고 발해가 만으로 파여 보이지 않는다.**
한반도도 세로로 긴 반도라기보다 뭉툭한 덩어리다.

### 원인
`src/data/terrain/strategic-terrain.ts` 의 격자가 **22행 × 32열**이다.
`GRID_COLS = ceil(LOGIC_W / ATLAS.tile) = ceil(1000 / 32) = 32`,
`GRID_ROWS = ceil(700 / 32) = 22`.
`MAP_BOUNDS` 가 경도 100–132 · 위도 21–44 이므로 **한 칸이 경도 1° × 위도 약 1.05°**,
대략 100km 다. 이 해상도로는 반도와 만을 그릴 수 없다. 데이터가 아니라 격자 크기 문제다.

### 고치는 법
격자를 키운다. 목표는 **가로 최소 56열** (한 칸 ≤ 0.57°).

주의할 함정: 타일 아트가 32×32 픽셀이라, 논리 크기만 키우고 CSS 로 축소하면
픽셀 아트가 비정수 배율로 뭉개진다. 1440px 화면에서 지도 표면은 약 736px 인데
64열 × 32px = 2048px 를 거기 욱여넣으면 0.36배가 된다. 그러면 지금보다 나빠진다.

둘 중 하나를 고르고, 고른 이유를 보고에 적어라.

- **(A) 전역도 전용 16px 타일 행을 추가한다.** `scripts/build_eiketsu_atlas.py` 에
  16×16 축소판 지형 세트를 굽고 (`tiles16.png` 또는 `tiles32.png` 의 새 행),
  `LOGIC_W/H` 를 그대로 둔 채 `TILE` 만 16 으로 내려 62×44 격자를 얻는다.
  픽셀 배율이 정수로 유지된다. 아트 작업이 는다.
- **(B) 논리 크기를 키우고 정수 축소만 허용한다.** `LOGIC_W/H` 를 2048×1408 로 올리고
  캔버스를 2배 축소(= 정확히 0.5배)로만 그린다. 표시 폭이 1024px 아래로 내려가면
  지도를 가로 스크롤 컨테이너에 넣는다. 아트는 그대로, 좁은 폭 UX 가 는다.

어느 쪽이든:
- 격자 문자 범례는 `src/data/terrain/types.ts` 의 `TERRAIN_CHAR` 를 그대로 쓴다. 새 문자를 만들지 않는다.
- 노드 좌표(`src/data/terrain/strategic.ts`)를 바꾸지 않는다. 좌표는 `LOGIC_W/H` 비율로만 해석된다.
- 오토타일(`edgeMask` / `autoTile`)을 바꾸지 않는다.
- 라벨 충돌 회피(선택 > highlight > tier 순 솎기)를 깨뜨리지 않는다.

### 소유 파일
`src/data/terrain/strategic-terrain.ts`, `src/components/StrategicMapCanvas.tsx`
(A 를 고르면 `scripts/build_eiketsu_atlas.py`, `public/assets/eiketsu/**`, `src/lib/atlas.ts` 추가)

### 수용 기준
1. `npm run build` · `npm run lint` 0 · `npm run verify` 전 검사 통과.
2. 격자 줄 수 × 글자 수가 렌더러의 `GRID_ROWS` × `GRID_COLS` 와 정확히 일치하고,
   `TERRAIN_CHAR` 밖 문자가 0 임을 확인한 출력.
3. Playwright 로 375 / 768 / 1440 에서 `/world` 를 열어
   (a) 라벨 수 (b) `getBoundingClientRect` 교차로 잰 겹침 쌍 — **세 폭 모두 0** (c) 가로 스크롤 없음.
4. 1440 스크린샷을 저장하고 **실제로 열어 본 뒤** 산둥반도 · 발해 · 한반도 · 황하 · 장강
   각각이 알아볼 수 있는지 한 문장씩 판정. 안 보이면 안 보인다고 적는다.
5. 픽셀 배율이 비정수로 떨어지는 구간이 없음을 어떻게 보장했는지 한 문단.

---

## RT2. 저작 전투맵이 12장뿐 — 거점 76곳 중 64곳이 「약식 지형」

### 현상
`src/data/places.ts` 에 거점이 **76곳**, 저작 전투맵은 **12장**이다.
나머지 **64곳**은 `resolveBattleMap()` 의 `proceduralFallback()` 으로 돌고
화면에 「약식 지형」이라고 표시된다.
전역도 노드 61개 중 **49개**가 약식이다.

정직하게 드러내고 있으니 거짓은 아니다. 다만 주요 거점이 비어 있다:
`xuchang 허창`, `ye 업`, `zhuo 탁군`, `xuzhou 서주`, `puyang 복양`, `chenliu 진류`,
`zhongmou 중모`, `sishui 사수관`, `suanzao 산조`, `nanyang 남양`, `xiangyang 양양`,
`jiangling 강릉`, `shouchun 수춘`, `wu 오군`

### 고치는 법
`src/data/terrain/battle-maps.ts` 에 24×18 문자 그리드를 더 저작한다.
**한 번에 다 하지 말고 12장씩 끊어라.** 2차로 위 14곳 중 12곳을 권한다
(허창 · 업 · 탁군 · 서주 · 복양 · 진류 · 사수관 · 남양 · 양양 · 강릉 · 수춘 · 오군).

지형은 실제 지리를 근거로 삼는다. `places.ts` 의 `note` 와 `lon`/`lat` 을 읽고 쓴다.
모르는 것은 지어내지 말고 평범한 지형으로 두고 `note` 에 근거 없음을 적는다.

기존 12장(`guandu`, `chibi`, `hulao`, `wuzhang`, `gongnae` 등)의 저작 방식을
먼저 읽고 같은 결로 맞춰라. 성곽 도시는 성벽·성문·성채·도로, 관문은 협곡과 관문 하나,
강변 전장은 하천과 나루·다리.

### 소유 파일
`src/data/terrain/battle-maps.ts`

### 수용 기준
1. `npm run build` · `npm run lint` 0 · `npm run verify` 전 검사 통과.
2. 추가한 맵 전부 `grid.length === 18`, 모든 줄 `length === 24`,
   `TERRAIN_CHAR` 밖 문자 0, `placeId` 가 `places.ts` 에 실존 — 스크립트로 확인한 출력.
3. `npm run dev` 로 추가한 거점을 **전부 열어 보고**, 각각 한 줄로 무엇이 보이는지 적는다.
   「약식 지형」 표시가 사라졌는지도 확인한다.
4. 남은 약식 거점 수를 세어 적는다.

---

## RT3. 전투맵 진영이 단조롭다

### 현상
`/world/guandu` 와 `/world/chibi` 를 열면 막사(`C`)가 같은 글리프로 줄지어 반복된다.
목책 안이 같은 타일로 꽉 차 있어 진영이 하나의 색 덩어리로 보인다.

### 고치는 법
둘 중 하나, 또는 둘 다.

- **데이터 쪽** — `battle-maps.ts` 에서 진영 내부를 `C` 로 꽉 채우지 말고
  막사·공터·도로·깃대를 섞어 리듬을 준다. 지휘 막사만 중앙에 두고 나머지는 성기게.
  `markers` 로 깃발과 지휘소를 얹는다. 파일 하나만 고치면 되니 싸다.
- **아트 쪽** — `build_eiketsu_atlas.py` 의 구조물 행(`TILE_ROW.structure`, idx 128–143)에
  막사 변주를 늘린다. 지금 막사는 2칸뿐이다. 큰 막사 / 작은 막사 / 빈 터 / 깃대를 나눈다.
  이 경우 `src/lib/atlas.ts` 의 구조물 인덱스 매핑과 `BattleMapCanvas` 의 blit 도 함께 본다.

어느 쪽이든 `TERRAIN_CHAR` 에 새 문자를 더해야 한다면 `types.ts` 를 고치게 되므로
**먼저 물어라.** 기존 문자 조합으로 해결되면 그게 낫다.

### 소유 파일
`src/data/terrain/battle-maps.ts`
(아트 쪽을 고르면 `scripts/build_eiketsu_atlas.py`, `public/assets/eiketsu/**`,
`src/lib/atlas.ts`, `src/components/BattleMapCanvas.tsx`)

### 수용 기준
1. `npm run build` · `npm run lint` 0 · `npm run verify` 전 검사 통과.
2. 손댄 맵의 스크린샷을 저장하고 경로를 적는다. 전후를 **실제로 열어 보고** 비교한 한 문단.
3. `TERRAIN_CHAR` 를 바꿨다면 무엇을 왜 더했는지, 그리고 기존 12장이 깨지지 않았음을 확인한 결과.

---

## RT4. kao 이목구비가 비슷하다

### 현상
`kao.png` 67면이 관·투구·수염·갑주 색으로는 갈리는데 **얼굴 자체가 비슷하다.**
멀리서 보면 같은 사람이 모자만 바꿔 쓴 것처럼 보인다.

### 원인
`scripts/build_eiketsu_atlas.py` 의 파츠 종류가 적다.
`kao_eyes()` 가 4종(`calm` / `fierce` / `narrow` / `wide`),
`kao_brow()` 가 4종(`straight` / `angled` / `thick` / `thin`).
**4 × 4 = 16 조합으로 67면을 만들고 있다.** 평균 4명이 같은 눈·눈썹을 쓴다.

### 고치는 법
파츠를 늘린다. 눈과 눈썹이 가장 효과가 크다.

- `kao_eyes` 를 8종 이상으로 (처진 눈, 치켜뜬 눈, 실눈, 부리부리, 삼백안 등)
- `kao_brow` 를 6종 이상으로
- 코와 얼굴 윤곽(`kao_face` 의 `shape`)에도 변주를 준다. 지금 4종이다
- 나이대를 도입해도 좋다 — 주름·흰머리로 노년을 구분하면 인물이 확 갈린다

늘린 파츠는 `src/data/kao-params.ts` 의 인물별 파라미터에 실제로 배분해야 의미가 있다.
생성기만 고치고 파라미터를 안 바꾸면 그대로다.
인물 배분은 성격에 맞춰라 — 관우는 봉의 눈, 장비는 부리부리, 제갈량은 가는 눈.

생성기가 `src/data/kao-params.ts` 의 타입(`KAO_BROW`, `KAO_EYE` 등)을 함께 출력하므로
타입과 데이터가 어긋나지 않게 한 번에 돌려라.

### 소유 파일
`scripts/build_eiketsu_atlas.py`, `public/assets/eiketsu/**`, `src/data/kao-params.ts`

### 수용 기준
1. `python scripts/build_eiketsu_atlas.py` 오류 없이 완료.
2. `npm run build` · `npm run lint` 0 · `npm run verify` 전 검사 통과.
3. 눈 / 눈썹 / 얼굴 파츠의 최종 종류 수와, 67면에 실제로 쓰인 조합의 가짓수를 세어 적는다.
   같은 (눈, 눈썹) 조합을 쓰는 인물이 최대 몇 명인지도 적는다.
4. `kao.png` 를 **실제로 열어 보고** 임의의 8인을 골라 서로 구분되는지 한 문장으로 판정.
5. `kao.index.json` 의 cells 수가 그대로 67 인지 (인물을 늘리는 작업이 아니다).

---

## 위임 방법

개편 때 쓴 방식이 잘 돌았다. 그대로 쓰면 된다.

```bash
orca orchestration run-create --objective "<목표>" --json
orca orchestration worker-start --spec "$(cat rt1.txt)" --task-title "RT1 전역도 해상도" \
  --worktree current --agent grok --json
orca orchestration check --wait --types "worker_done,escalation,question" --timeout-ms 540000 --json
```

`--agent grok` 은 `~/.grok/config.toml` 의 `default = "grok-4.6"` 과
`default_reasoning_effort = "xhigh"` 를 그대로 물려받는다.
`--model` / `--effort` 는 Claude · Codex · Cursor 전용이라 grok 에는 넘기지 않는다.

### 개편 때 배운 것

- **파일 소유권을 배타적으로 나눠라.** 같은 체크아웃에서 여러 워커를 병렬로 돌려도
  소유 파일이 겹치지 않으면 충돌하지 않는다.
- **같은 웨이브의 워커에게 `npm run build` 를 돌리게 하지 마라.** `.next/` 가 충돌한다.
  병렬 구간에서는 `npx tsc --noEmit --incremental false` 로 타입만 본다.
- **`npm run verify` 를 dev 서버와 같이 돌릴 때 `npm run build` 를 동시에 치지 마라.**
  dev 의 `.next/` 가 깨져 검사가 통째로 실패한다. 한 번 이걸로 헛다리를 짚었다.
- **워커가 되물으면 직접 재현한 뒤 답하라.** 개편 때 3번 물어왔고 전부 실제 충돌이었다.
  소유권은 필요한 파일 한 개씩만 넓혀 줬다.
- **완료 보고를 그대로 믿지 말고 검증하라.** 숫자는 스크립트로 다시 재고,
  그림은 실제로 열어 봐라. 「1440 겹침 57쌍을 기존 유지」 같은 보고는
  열어 보기 전까지 문제로 안 보인다.
- **완료 기준에 "실제로 열어 보고 판정한 결과"를 넣어라.** 안 넣으면 숫자만 맞추고 끝낸다.
