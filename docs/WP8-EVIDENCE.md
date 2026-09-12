# WP8 evidence

## 1. build / lint / verify

- `npm run build` — compiled successfully, typecheck passed
- `npm run lint` — 0 errors, 0 warnings
- `npm run verify` — All verification checks passed (dev server on :3000)

## 2. Grid validation

```
rows 22
lens {32}
unknown []
ok True
ceil check 32 32 22 22   # GRID_COLS == ceil(1000/32), GRID_ROWS == ceil(700/32)
```

TERRAIN_CHAR 밖 문자 0. 각 줄 32글자, 22줄.

## 3. Playwright /world labels

Selector `[data-map-label]`, overlap = getBoundingClientRect 교차 쌍.

| viewport | labels (a) | overlap pairs (b) | hscroll (c) |
|---|---|---|---|
| 375 | 16 | 0 | no (sw=375 cw=375) |
| 768 | 26 | 0 | no (sw=768 cw=768) |
| 1440 | 31 | 0 | no (sw=1440 cw=1440) |

1440 overlap pairs = 0.

Map node buttons with aria-label: 61 at all three widths (every node remains clickable; hidden labels keep the place name on the button).

## 4. 1440 screenshot

Path: `docs/wp8-world-1440.png`

Opened and judged:

- 발해: 북해 북쪽·서쪽에 바다가 만으로 파여 요동 쪽 육지와 산둥 사이에 갇힌 물로 읽힌다.
- 산둥반도: 북해가 앉은 육지가 동쪽으로 바다에 튀어 나와 반도로 읽힌다.
- 한반도: 화면 오른쪽이 남북으로 긴 반도이고, 국내성·낙랑·사로국이 늘어서며 압록 이북은 육지로 이어진다.
- 황하: 서쪽 고지에서 북으로 올라 오르도스 굽이를 그린 뒤 동쪽으로 발해 방면을 향한다. 가로 직선 띠가 아니다.
- 장강: 성도 분지에서 동쪽으로 사행해 백제성·적벽·말릉 쪽으로 흐른다. 가로 직선 띠가 아니다.

## 5. git

This workspace already had other WP dirty files. WP8 ownership only:

```
?? src/components/StrategicMapCanvas.tsx
?? src/data/terrain/strategic-terrain.ts
```

`src/data/terrain/{types,battle-maps,strategic,index}.ts` not modified. `scripts/verify.mjs` not modified.
