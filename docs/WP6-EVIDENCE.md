# WP6 회귀 검증 갱신 — 증거

이 디스패치가 편집한 파일은 `scripts/verify.mjs` 하나. 앱 쪽은 고치지 않았다.

## 1. `npm run verify` 전체 출력

`npm run dev` (Next.js 15.5.23 turbopack, http://localhost:3000 Ready) 상태에서 실행. exit 0. OK/FAIL 한 줄도 빼지 않은 원문:

```
> 3kdmap@0.1.0 verify
> node scripts/verify.mjs

OK   phone home title
OK   phone scan start
OK   phone volumes
OK   phone vol60
OK   phone vol count 60
OK   phone era tab
OK   phone no stub jargon
OK   phone vol next
OK   phone vol event link
OK   phone plot
OK   phone chip yeonui
OK   phone chip jeongsa
OK   phone chip yeonui color
OK   phone mature hint
OK   phone no playback
OK   phone world
OK   phone frozen
OK   phone tiles
OK   phone prev event
OK   phone chip samguk
OK   phone mature
OK   phone region filter
OK   phone battle map
OK   phone zoom
OK   phone tiles battle
OK   phone place label
OK   phone command menu
OK   phone command keys move
OK   phone command keys pick
OK   phone approx terrain
OK   phone me korea
OK   phone seoul
OK   phone seoul selected
OK   phone korea map
OK   phone busan
OK   phone year step
OK   phone scan heading
OK   phone scan match
OK   phone scan badge
OK   phone scan late
OK   phone scan empty
OK   phone catalog
OK   phone atlas tiles
OK   phone atlas units
OK   phone atlas kao
OK   phone vol11
OK   phone vol26
OK   phone vol59
OK   phone character
OK   phone kao fallback
OK   phone kao canvas
OK   phone place map
OK   phone pinch zoom
OK   tablet home title
OK   tablet scan start
OK   tablet volumes
OK   tablet vol60
OK   tablet vol count 60
OK   tablet era tab
OK   tablet no stub jargon
OK   tablet vol next
OK   tablet vol event link
OK   tablet plot
OK   tablet chip yeonui
OK   tablet chip jeongsa
OK   tablet chip yeonui color
OK   tablet mature hint
OK   tablet no playback
OK   tablet world
OK   tablet frozen
OK   tablet tiles
OK   tablet prev event
OK   tablet chip samguk
OK   tablet mature
OK   tablet region filter
OK   tablet battle from node
OK   tablet battle map
OK   tablet zoom
OK   tablet tiles battle
OK   tablet place label
OK   tablet command menu
OK   tablet command keys move
OK   tablet command keys pick
OK   tablet approx terrain
OK   tablet me korea
OK   tablet seoul
OK   tablet seoul selected
OK   tablet korea map
OK   tablet busan
OK   tablet year step
OK   tablet scan heading
OK   tablet scan match
OK   tablet scan badge
OK   tablet scan late
OK   tablet scan empty
OK   tablet catalog
OK   tablet atlas tiles
OK   tablet atlas units
OK   tablet atlas kao
OK   tablet vol11
OK   tablet vol26
OK   tablet vol59
OK   tablet character
OK   tablet kao fallback
OK   tablet kao canvas
OK   tablet place map
OK   tablet pinch zoom
OK   375 no hscroll /
OK   375 no hscroll /world
OK   375 no hscroll /world/luoyang
OK   375 no hscroll /world/xuchang
OK   375 no hscroll /episodes/v01-e04
OK   375 no hscroll /characters/liu-bei
OK   375 no hscroll /characters/zhuge-liang
OK   375 no hscroll /me
OK   375 no hscroll /volumes
OK   375 no hscroll /volumes/1
OK   375 no hscroll /scan
OK   375 no hscroll /places/luoyang

All verification checks passed.
```

## 2. FAIL

없음. 검사를 지우거나 약화시켜 통과시키지 않았다.

- `no playback`: `getByRole("button", { name: /재생|플레이/ }).count() === 0` 유지.
- `place label`: `getByRole("button", { name: "낙양" })` DOM 접근성 이름. 캔버스 존재 검사로 바꾸지 않음 (`tiles battle`은 별도).

## 3. 셀렉터 교정 (의미 유지)

WP5 대조표와 코디네이터 전달을 근거로 셀렉터만 고쳤다.

| 검사 | 이전 | 이후 |
|---|---|---|
| home scan start / 권·제목 고르기 | `role=link` | `role=menuitem` (CommandWindow) |
| chip yeonui color | `li > button` class에 `cinnabar` | `li > span` class에 `cinnabar` (SourceBadge). 토큰 이름 `cinnabar` 유지 |
| world (「같은 시각 천하 보기」 직후) | `getByText("전투맵")` | `getByText("전역도")`. 「전투맵」은 `/world/[placeId]`에서 `battle map`으로 유지 |
| zoom 「2배 확대」 | `/world` | `/world/[placeId]` BattleMapCanvas |
| atlas tiles | `/assets/eiketsu/tileset.png` | `/assets/eiketsu/tiles32.png` (앱이 실제로 로드하는 시트) |

보호 문자열은 화면에서 확인했다: 천하동시, 촉한 그 뒤, 군웅할거, 시계 정지, 본편 수위, 같은 시각 천하 보기, 2배 확대, 도원결의, ◀ 이전 사건, 60권.

전역도 노드 클릭은 코디네이터 지시대로 tablet(1024px)에서만 건다. 375px는 가로 스크롤만 검사하고 특정 노드 라벨 가시성은 걸지 않았다 (WP7이 `StrategicMapCanvas.tsx` 겹침을 고치는 중).

## 4. 추가한 검사

- `battle from node` — 전역도 `getByRole("button", { name: "낙양", exact: true })` 클릭 후 URL `/world/luoyang` (1024px)
- `battle map` — `/world/[placeId]` 헤더 「전투맵」
- `place label` — `getByRole("button", { name: "낙양" })` DOM 텍스트
- `command menu` / `command keys move` / `command keys pick` — CommandWindow 포커스 → ArrowDown 두 번(`aria-activedescendant` 변경) → Enter 로 `/episodes/` 선택
- `approx terrain` — `/world/xuchang`에서 「약식 지형」
- `375 no hscroll <path>` — 375×812에서 `document.scrollingElement.scrollWidth <= clientWidth`. 경로: `/`, `/world`, `/world/luoyang`, `/world/xuchang`, `/episodes/v01-e04`, `/characters/liu-bei`, `/characters/zhuge-liang`, `/me`, `/volumes`, `/volumes/1`, `/scan`, `/places/luoyang`
- `tiles battle` — 전투맵 canvas (전역도 canvas와 분리)

## 5. `git diff --name-only`

이 디스패치가 만진 파일:

```
scripts/verify.mjs
```

워킹트리 전체 `git diff --name-only` (선행 WP1–WP5 미커밋 포함, WP6이 만지지 않음):

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

## 6. 앱 버그

이 런에서 재현된 FAIL/앱 버그 없음. WP7 전역도 375px 라벨 겹침은 지시대로 검사하지 않았다.
