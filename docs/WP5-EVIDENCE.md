# WP5 화면 구조 재구성 — 증거

## 1. npm run build / npm run lint

- `npm run build` — 통과 (Next.js 15.5.23, compiled successfully). 새 라우트 `ƒ /world/[placeId]`.
- `npm run lint` — 통과, 경고 0.

선행 6건 처리:
- `layout.tsx` `no-page-custom-font` → `next/font/google` (Noto Sans KR / Noto Serif KR).
- `page.tsx` / `me/page.tsx` / `MatureContext.tsx` `set-state-in-effect` → `useSyncExternalStore` + `subscribePrefs`.
- `scan/page.tsx` 카메라 마운트는 `getUserMedia().then/.catch` 콜백에서만 setState. 재시도 버튼의 `startCamera`·OCR 로직은 유지.
- `WorldDashboard.tsx` 삭제.

## 2. npm run dev 경로 (375×812 Playwright, status=200)

| 경로 | 결과 |
|---|---|
| `/` | h1="천하동시". CommandWindow menuitem 「책 스캔」「권·제목 고르기」. canvas=0. |
| `/world` | h1=정지된 연월. canvas=1. 「시계 정지」·「◀ 이전 사건」·「다음 사건 ▶」. 한반도 스트립 aria-pressed 토글. 사건 행 클릭 → `/world/chengdu?episode=v01-e01`. |
| `/world/luoyang` | h1="낙양洛陽". canvas 있음. 「2배 확대」. 명령 줄거리. 저작맵이라 「약식 지형」 0. |
| `/world/xuchang` | h1="허창許昌". 「약식 지형」 2곳(맵 주석+TerrainPanel). |
| `/episodes/v01-e01` | h1="창천이 이미 죽다". DialogueBox + kao canvas. |
| `/episodes/v01-e04` | h1="도원결의". 「같은 시각 천하 보기」. 연의 SourceBadge class에 `cinnabar`. |
| `/characters/liu-bei` | h1="유비 劉備". UnitPanel + kao canvas. |
| `/me` | h1="지금 당신이 있는 땅에서". 서울 클릭 → 마한. `aria-label="한반도 상황도"`. GPS 로직 미변경. |
| `/volumes` | h1="목차". `main ol a` = 60. 「군웅할거」. 「촉한 그 뒤」. |
| `/volumes/1` | h1="도원결의". `a[href^="/world?year="]` 8개. |
| `/scan` | h1="책을 비추세요". 카메라·OCR 유지. |

`/world?episode=v01-e04` 계속 동작: 「시계 정지」 + 「도원결의」.

## 3. 375px 가로 스크롤

위 경로 + `/world/xuchang` 전부 `scrollWidth=375 / clientWidth=375`, `hscroll=none`.

## 4. 삭제한 파일 / wood grep

삭제한 파일:
- `src/components/WorldDashboard.tsx`
- `src/components/WoodPanel.tsx`
- `src/components/TileMap.tsx`
- `src/components/SourceChips.tsx`

코디네이터 확장 레거시 (호출처 0 확인 후 삭제):
- `src/lib/eiketsu.ts` `buildTerrain`
- `src/lib/atlas.ts` `TILE_INDEX`, `unitRow`

`grep -rn "wood-panel\|wood-inlay\|gold-btn" src` → 결과 없음.
`--color-wood*` 토큰도 `globals.css`에서 제거.

## 5. verify.mjs 보호 문자열 전후 대조

없음. 보호 목록(천하동시, 책 스캔, 권·제목 고르기, 목차, 촉한 그 뒤, 군웅할거, 도원결의, 시계 정지, ◀ 이전 사건, 2배 확대, 같은 시각 천하 보기, 본편 수위, 60권)은 그대로.

WP6 셀렉터 참고 (문자열은 안 바꿈, 위치·role만):
- 홈 「책 스캔」「권·제목 고르기」는 `CommandWindow`라 `role=menuitem` (`getByRole("link")` count=0).
- 연의 칩은 `li > span.SourceBadge` (button 아님). class에 `cinnabar` 유지.
- 「전투맵」 문구는 `/world`의 「전역도」로 화면이 갈렸고, `/world/[placeId]` 헤더에 「전투맵」이 있다. 기존 verify는 `/world`에서 `getByText("전투맵")`.
- 「2배 확대」는 `/world` TileMap이 아니라 `/world/[placeId]` `BattleMapCanvas`에 있다.

## 6. git diff --name-only

워킹트리 전체 (`git diff --name-only`; 다른 WP 미커밋 포함):

```
.gitignore
README.md
eslint.config.mjs
public/assets/eiketsu/README.md
public/assets/eiketsu/kao.png
public/assets/eiketsu/units.png
scripts/build_eiketsu_atlas.py
scripts/verify.mjs
src/app/characters/[id]/page.tsx
src/app/episodes/[id]/page.tsx
src/app/globals.css
src/app/layout.tsx
src/app/me/page.tsx
src/app/page.tsx
src/app/places/[id]/page.tsx
src/app/scan/page.tsx
src/app/volumes/[n]/page.tsx
src/app/volumes/page.tsx
src/app/world/page.tsx
src/components/AppShell.tsx
src/components/HistoricalMap.tsx
src/components/KaoPortrait.tsx
src/components/MatureContext.tsx
src/components/SourceChips.tsx
src/components/TileMap.tsx
src/components/WoodPanel.tsx
src/components/WorldDashboard.tsx
src/data/characters.ts
src/data/events.ts
src/data/places.ts
src/data/volumes.ts
src/lib/atlas.ts
src/lib/clock.ts
src/lib/content.ts
src/lib/eiketsu.ts
src/lib/projection.ts
```

WP5가 이번 디스패치에서 만진 것:
- 수정: `src/app/**/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`(레거시 제거+바탕 eik-void), `AppShell.tsx`, `KaoPortrait.tsx`, `KoreaLocator.tsx`, `HistoricalMap.tsx`, `MatureContext.tsx`, `src/lib/eiketsu.ts`(buildTerrain만), `src/lib/atlas.ts`(TILE_INDEX·unitRow만)
- 신규: `src/app/world/[placeId]/page.tsx`
- 삭제: WorldDashboard, WoodPanel, TileMap, SourceChips
- `src/data/**` 는 읽기만. 데이터 파일 diff는 선행 WP/기존 워킹트리.

## 발견한 남의 WP 버그 (고치지 않음)

- WP4 `StrategicMapCanvas`: 375px에서 44px 히트 타깃이 겹침. 「낙양」 클릭이 「허창」 스팬에 가려짐. 사건 목록 클릭으로는 `/world/[placeId]` 진입 가능.
- WP3 `CommandWindow`: `Link`에 `role="menuitem"`이라 기존 verify의 `getByRole("link")`가 홈 시작 명령을 못 찾음.

## 불가침

- `src/data/episodes*.ts, events.ts, characters.ts, volumes.ts, places.ts` 미수정.
- 재생·배속 버튼 없음.
- 이모지 없음. 하단 탭 아이콘은 인라인 SVG.
- `__gallery__` 프로덕션 라우트 없음.
