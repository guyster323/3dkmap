# WP2 evidence

## 1. Battle maps 12, grid 18×24

```
luoyang placeId=luoyang grid.length=18 all24=true OK
changan placeId=changan grid.length=18 all24=true OK
hulao placeId=hulao grid.length=18 all24=true OK
guandu placeId=guandu grid.length=18 all24=true OK
chibi placeId=chibi grid.length=18 all24=true OK
xiapi placeId=xiapi grid.length=18 all24=true OK
wan placeId=wan grid.length=18 all24=true OK
jianye placeId=jianye grid.length=18 all24=true OK
chengdu placeId=chengdu grid.length=18 all24=true OK
wuzhang placeId=wuzhang grid.length=18 all24=true OK
gongnae placeId=gongnae grid.length=18 all24=true OK
lelange placeId=lelange grid.length=18 all24=true OK
map count 12
expected 12 present true
DIMENSIONS PASS
```

## 2. placeId ∈ places.ts

```
BattleMap.placeId luoyang, changan, hulao, guandu, chibi, xiapi, wan, jianye, chengdu, wuzhang, gongnae, lelange
StrategicNode count 61
PLACE IDS PASS
```

All 12 BattleMap.placeId and all 61 StrategicNode.placeId exist in `src/data/places.ts`.

## 3. TERRAIN_CHAR charset

```
CHARSET PASS no unknown chars
```

## 4. Strategic graph

- nodes: 61
- edges: 77
- tier 1 (도읍): 7 — luoyang, changan, xuchang, ye, chengdu, jianye, gongnae
- tier 2 (주요 성·관): 34
- tier 3 (그 밖): 20
- nodes with battleMapId: 12 (the authored battle maps only)
- STRATEGIC_TERRITORIES: `[]` (연표 근거 없는 경계는 만들지 않음)

## 5. tsc / lint

```
npx tsc --noEmit --incremental false
exit 0
```

```
npx eslint --no-config-lookup -c <eslint-config-next native flat> --max-warnings 0
  src/data/terrain/types.ts
  src/data/terrain/battle-maps.ts
  src/data/terrain/strategic.ts
  src/data/terrain/index.ts
  src/lib/projection.ts
ESLINT_EXIT:0
```

`npm run lint` crashes before rules run:

```
TypeError: Converting circular structure to JSON
  at ConfigValidator.formatErrors (.../@eslint/eslintrc/lib/shared/config-validator.js)
```

Cause: repo `eslint.config.mjs` uses FlatCompat `extends("next/core-web-vitals", "next/typescript")` with `eslint-config-next@16.3.1`. That file is not WP2-owned.

## 6. git (owned paths only)

```
git diff --name-only -- src/lib/projection.ts src/data/terrain
src/lib/projection.ts

git status --porcelain -- src/lib/projection.ts src/data/terrain
 M src/lib/projection.ts
?? src/data/terrain/
```

Working tree already had other WP files dirty; those were not edited in this dispatch. `git diff src/lib/projection.ts` is only `projectStrategic`.
