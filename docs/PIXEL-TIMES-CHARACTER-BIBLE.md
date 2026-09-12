# Pixel Times — Character Bible

Named officers must look like the **same person** in three LODs. Do not generate portrait, map sprite, and scene actor from unrelated prompts.

Existing `kao.png` / `units-officer.png` / JPEG portraits are **not** the artistic baseline. Study them only for IDs, cell sizes, and fallbacks.

Protected `src/data/characters.ts` stays read-only. Visual metadata lives in `src/data/pixel-times/character-visuals.ts`.

---

## 1. Three representations

| LOD | Size | Camera | Must preserve |
|---|---|---|---|
| Portrait | 64×80 (Pillow from larger master) | ¾ bust, head ~60% of frame | skull, brow, beard, hat, armor colors |
| Scene actor | 48×64, 2 dir × 2 idle | ¾ full body | same silhouette, weapon, faction ramp |
| Map sprite | 32×64, 2 dir × 2 idle | ¾ tiny | readable hat + faction + signature prop |

Identity test: 유비 vs 조조 vs 관우 must be distinguishable **with hats cropped off**.

## 2. Body grammar

- Head/body for scene actors ~1:3.5 (not chibi 1:2, not realistic 1:7).
- Map officers may be slightly larger-headed so the hat reads at 2×.
- Feet plant on the same baseline across a sheet. No baked ground shadow in the master; Pillow may add a 1 px contact ellipse.
- Pose: idle, weight on one foot, weapon held (not floating). Map/scene: in-place bob only.

## 3. Face grammar

- Outline 1 px `#0A1226`.
- Skin 3–5 values from the style bible. Guan Yu red face is the only extreme.
- Eyes: small, dark iris, 1 px highlight max. No anime sparkle.
- Beard styles (named, not freeform): `none | stubble | short | long-goatee | full | forked | guan-yu-long`.
- Age: youth (smooth, no beard), prime, elder (wrinkle 1 px, grey streak — 황충, 사마의 later).

## 4. Costume grammar

- Headgear scale: hat/crown may be tall but must not dwarf the skull on portraits.
- Armor: scale / lamellar / robe / cloak — construction must match across LODs.
- Faction accent on trim, cape, banner — not on skin.
- Signature props stay in the **same hand** across views (관우 청룡언월, 장비 장팔사모, 유비 쌍고검).

## 5. Pipeline

```
character-visuals.ts canonicalDescription
        → Grok Imagine master (¾, flat keyable background)
        → image_edit for scene actor / map sprite (same face, change crop/pose only)
        → Pillow: crop, nearest-neighbor resize, alpha, atlas pack, dimension assert
        → visual QA on the three LODs together
```

AI must not choose final sprite sizes. Reject a generation that drifts skull, beard, or hat.

## 6. Master set (generate first)

Do not mass-produce 67 faces until ROOT and visual QA score the master set ≥ 90.

| id | name | notes |
|---|---|---|
| `liu-bei` | 유비 | oval, short beard, turban, 蜀 green, kind eyes |
| `guan-yu` | 관우 | gaunt, red skin, long beard, 청룡언월 |
| `zhang-fei` | 장비 | square, full beard, fierce, 장팔사모 |
| `cao-cao` | 조조 | gaunt, thin brow, narrow eye, 진현관, 魏 crimson |
| `sun-quan` | 손권 | oval, short beard, 吳 navy + amber |
| `zhuge-liang` | 제갈량 | gaunt, no beard, silk cap, crane-feather fan, robe |

Then: `lu-bu`, `zhou-yu`, `sima-yi`.

## 7. Score (important characters, 100)

| Criterion | Points |
|---|---|
| Identity consistency across 3 LODs | 30 |
| Pixel-art quality | 20 |
| Historical atmosphere | 15 |
| Silhouette recognition | 15 |
| Faction coherence | 10 |
| Style consistency vs bible | 10 |

Do not approve under **90** without iteration. File existence is not validation — inspect the PNGs.

## 8. Prohibited

- Independent prompts per LOD
- Using current kao/JPEG as style references
- Tracing KOEI / manga
- Same-face compositor for the master set
- Baking Hangul into portraits
- Photoreal or watercolor in product chrome
