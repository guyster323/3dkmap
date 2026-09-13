# Score-up — break 90

Latest honest total **96/100** (`docs/qa/scoreup/1440-world.png` after Imagine ¾ palace compounds, split Yellow Sea, keyed magenta, larger banners). Remaining 4: kao leftovers + plains density.

Target rubric (Prompt / plan):

| Criterion | Max | Now | Gap |
|---|---|---|---|
| Map dominance | 25 | 24 | 1 |
| Pixel-art consistency | 20 | 18 | 2 |
| UI chrome | 15 | 15 | 0 |
| Hierarchy | 10 | 10 | 0 |
| Character consistency | 10 | 9 | 1 |
| Event banners | 10 | 10 | 0 |
| Atmosphere | 5 | 5 | 0 |
| Mobile | 5 | 5 | 0 |
| **Total** | **100** | **96** | **4** |

## Map dominance (14 → 22+)

1. **16px world tiles, 64×44 grid** (upsample + carve Shandong / Bohai / Korea / Yangtze). Integer scale. Battle maps stay 32px.
2. **¾ lighting on tiles** (UL key, SE shadow, tree crowns, not RPG Maker top-down grass).
3. **City-tier landmarks** as overlay sprites: village 2×2, county 3×3, major 4×4, capital 5×5. 장안/낙양/국내성 must not be 1-tile huts.
4. Hide/collapse trees by default on 375; map ≥ 50% of first screen.
5. Do not invent `STRATEGIC_TERRITORIES`.

## Pixel-art consistency (12 → 18+)

1. One world tilesheet in the same navy/gold/low-chroma grammar as `.eik-win`.
2. Scene backgrounds and banners already Imagine; **crop banners from scene BGs** so they match.
3. Kill remaining chalky olive 32px world blit on `/world`.

## Character consistency (8 → 9+)

1. Master 6 already distinct; **edit-chain idle f1** — **DONE** (Orca Grok worker; `imagine-raw/{id}-idle-f1.png` + packed 48×64). Cao Cao / Zhuge Liang idle is a bit walk-like; iterate if it pops.
2. Add **여포 · 주유 · 사마의** — **DONE files**, visual ~84–86. Need another Imagine pass for eyes/stoop to hit 90.
3. Wire those ids — **DONE** (`character-visuals` + atlases).
4. Lu Bu in 호로관 — **DONE** (plume + ji, not kao compositor).

## Event banners (7 → 9+)

1. Resize Imagine scene BGs to 320×180 for banner idle (same painting).
2. Hover = brighter gold frame only (CSS), no second painting required.

## Chrome / hierarchy / atmosphere / mobile

1. Chrome: keep 4-layer windows; shrink world header padding.
2. Hierarchy: volume timeline one row; 전역도 label smaller.
3. Atmosphere: fire 4-frame on 적벽 BG optional later; smoke CSS not required for 90.
4. Mobile: trees in flow already; **default collapse tree bodies** on `<md` so map is visible without scroll.

## Rate-limit / thread strategy

- Imagine team 429 is **shared quota**, not always per-thread. Still: spawn an Orca **Grok** worker on `pixel-times-v2` for character Imagine while ROOT does tiles (no API).
- If worker also 429: **Pillow ¾ tiles + landmarks** still move map score without Imagine.
- Never stall the whole project on Imagine.

## Stop condition

Re-score from four-width screenshots of `/` and `/world` plus the three scenes. Iterate the highest-gap row until **≥ 90** or a hard external blocker (Imagine down **and** tiles already shipped).
