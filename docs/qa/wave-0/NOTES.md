# WAVE 0 visual baseline

Inspected 16 Playwright PNGs in this folder (375/768/1440/1920 × home, world, luoyang, episode).
Production `next start` at `f8ccf1b` (pre–Pixel Times chrome). `npm run verify`: 119 OK / 0 FAIL.

## Score (honest, against Codex reference)

| Criterion | Score | Note |
|---|---|---|
| Map dominance | 8/25 | Right-hand event column and six region strips steal the map. `max-w-[1400px]` letterboxes 1920. |
| Pixel-art consistency | 6/20 | Top-down 32px grass, 1-tile hut cities, hashed water. Not ¾ Codex density. |
| UI chrome consistency | 12/15 | Navy/gold 4-layer frames match the mock grammar. Title is still 천하동시. |
| Information hierarchy | 6/10 | Date header is the hero; book timeline and trees are missing. |
| Character consistency | 3/10 | kao compositor: same face, hat/beard swaps. 유비/관우/장비 are not distinct with hats cropped. |
| Event banner quality | 0/10 | No banners. List rows only. |
| Historical atmosphere | 3/5 | Source chips and frozen clock are correct; map does not feel like a chronicle painting. |
| Mobile readability | 3/5 | 375 no-hscroll passes; bottom tab bar covers the map; no Pixel Times trees. |
| **Total** | **41/100** | Fail (&lt; 90). Tests passing is not visual success. |

## Confirmed defects in screenshots

- World clock shows **2월 16일** (eraToAbsDays round-trip). Episode page using raw `timeStart` shows 4월.
- Cities are single gold-roof tiles.
- Battle 낙양 is a flat rectangle of grass + wall, generic units.
- No ▶ / ▶▶▶, no four trees, no event scene overlay.

Screenshots are the artistic **before**. Do not treat them as the style bible.
