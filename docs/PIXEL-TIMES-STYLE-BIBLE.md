# Pixel Times — Style Bible

Enforceable visual contract. Highest references:

- `C:\Users\windo\Pixeltimes\repo\Codex 이미지 2026년 9월 12일 오후 11_01_23.png` (product mock)
- `C:\Users\windo\Pixeltimes\repo\Codex 이미지 2026년 9월 12일 오후 11_01_37.png` (asset guide)

Current `public/assets/eiketsu/*` and `public/portraits/*.jpg` are **integration references only**, not the artistic baseline.

All pixels must be original. Borrow grammar (¾ camera, navy/gold windows, RPG dialogue). Do not rip KOEI or Yokoyama.

---

## 1. Camera

Quarter-view (¾), not true isometric, not top-down.

- Horizon ~25–35° down. South and east walls visible; north roofs dominate.
- One shared light and one shared recession across terrain, cities, units, banners, scene backgrounds.
- World map is north-up geographically, drawn in ¾ so coasts recede toward the top of the frame.

**Reject:** orthographic `tiles32.png` grass; true 2:1 isometric; mixing top-down tiles with ¾ cities.

## 2. Light

Key from upper-left (~10–11 o’clock), slightly in front of camera.

- Light faces: NW slopes, west walls, left cheeks, left roof pitches.
- Shadow: SE / right-bottom, mixed toward `#0A1226` at 35–50% — not black multiply.
- Specular only on gold, water, steel: 1–2 px `#E8E0C8`.
- World map time of day is locked to late morning / clear.
- Event banners may be dusk/night (적벽) but keep the same key direction.
- Fire is a **local** key; it does not relight the continent.

## 3. Scale (art px). Code owns final sizes.

Display uses integer scale only (`image-rendering: pixelated`). Never 1.5×.

| Layer | Art cell | Notes |
|---|---|---|
| Terrain tile (master) | 32×32 | ¾ autotile + tall overlays for mountains/trees |
| World-map display tile | 16×16 | Pillow nearest-neighbor from 32px masters |
| Battle tile | 32×32 | Keep 24×18 maps |
| Map city village | 2×2 tiles | 2–3 roofs, no curtain wall |
| Map city county | 3×3 | Low wall, one gate, keep |
| Map city major | 4×4 | Full wall, corner towers, inner ward |
| Map city capital | 5×5–6×6 | Palace, multi-court — dedicated landmark sprites, not `tiles32` structure row |
| Map army blob | 24–32 px | Several tiny soldiers + banner |
| Map ship | 32×24–48×32 | ¾ hull + sail + wake |
| Named map officer | 32×64 | Existing cell; unique hat/weapon |
| Scene actor | 48×64 | 2 dir × 2 idle frames |
| Portrait | 64×80 | ¾ bust; Pillow crop from larger master |
| Event banner | 320×180 | 16:9 painting + chrome |
| Scene background | 480×270 | Not a stretched banner |

Map sprite < scene actor < portrait in pixel budget. Same person at all three LODs, not the same crop.

## 4. Palette

### UI (already in `globals.css`)

| Token | Hex |
|---|---|
| void | `#060A14` |
| win-top / mid / bot | `#1C2F5E` / `#14224A` / `#0A1226` |
| bevel-lo / gold / gold-hi | `#04070F` / `#D8B74A` / `#F0DC8A` |
| bevel-hi | `#E8E0C8` |
| text / dim / ink | `#F0EAD8` / `#9AA8C4` / `#0A1226` |
| cinnabar / jade | `#C23B22` / `#3D8B7A` |

Wordmark gold: `#E8C878` → `#C9A227` → `#8A7018`.

### Terrain (Codex — replace current chalky olive)

Deep forest `#0F2418`–`#4A8B4A`. Plains `#6B7340`–`#D4B87A`. Sea `#0E2A4A`–`#3A7AB0`. Roofs civilian cinnabar, palace gold ridge.

Saturation: terrain 35–55%, UI gold ~70%, fire small area 80%+, skin 25–40%.

Skin: `#E8C9A0` / `#D4A878` / `#BA8860`. Guan Yu is the only extreme: `#C23B22` / `#8A2A18`. Ink outline `#0A1226`. Hair not pure black.

## 5. Outline, shadow, density

- Characters / officers / ships: **1 px** ink silhouette. No 2 px cartoon.
- Terrain: no hard outline; 1 px bank where land meets water.
- UI: 2 px void + 1 px gold (see §7). Never outline text.
- Sprite contact shadow: ellipse, `#0A1226` α 0.35, offset 1 px down-right. No CSS blur.
- Forest must read as **tree crowns**, not a green rectangle. Plains: sparse tufts, not Floyd–Steinberg haze.

## 6. City tiers

장안 / 낙양 / 국내성 must never be a single 32×32 hut.

| Tier | Footprint | Must include |
|---|---|---|
| 거점 깃발 | 1 tile | pole + faction color |
| 마을 | 2×2 | 2–3 gabled roofs |
| 군현 | 3×3 | rammed wall, one gate, keep |
| 주요 도시 | 4×4 | full wall, 4 towers, inner ward |
| 수도 | 5×5–6×6 | palace, multi-court, 6+ towers |

Specials, same camera: 요새 관문, 항구, 망루/봉화.

## 7. UI chrome

Outside → in, `border-radius: 0`:

1. 2 px `#04070F`
2. 1 px `#D8B74A`
3. Fill `linear-gradient(180deg, #1C2F5E, #14224A 55%, #0A1226)`
4. Inset highlight top/left 1 px `#E8E0C8` at 35%

Active gold `#F0DC8A`. Nested/flat fill `#14224A`. No drop-shadow blur, no rounded SaaS cards, no glass.

## 8. Typography

| Role | Face | Size |
|---|---|---|
| Pixel Times lockup | serif display, gold | art + `.pt-lockup` |
| Era / 연월 | Noto Serif KR 20/700 | `.eik-era` |
| Window title | Galmuri11 / Noto 13/700 tracking | `.eik-nameplate` |
| Body | 14/400 lh 1.7 | `.eik-body` |
| Stats | 12/700 tabular | `.eik-stat` |
| Map labels | **DOM**, 11–12px | never `canvas.strokeText` |

Hangul in UI fonts only. Sprites may carry 魏/蜀/吳 one-kanji pennants.

## 9. Faction color

Cloth/armor/banners carry faction. Faces do not (except Guan Yu).

| Id | Pin | Notes |
|---|---|---|
| cao / 魏 | `#6B2A2A` | crimson banner 魏 |
| liu / 蜀 | `#3D6B3A` | green 蜀 |
| sun / 吳 | `#2A4A6B` | navy cloth, **amber pennant** `#C47820` |
| han | `#C9A227` | gold + cinnabar trim |
| goguryeo | `#3D8B7A` | jade |

Hue-shift of one silhouette is not enough faction difference. Banner shape / helmet / shield must differ.

Keep `FACTION_BANNER` hexes in `src/lib/eiketsu.ts` as pin colors.

## 10. Animation

| FX | Frames | Timing |
|---|---|---|
| Unit / actor idle | 2 | 400–800 ms |
| Fire | 4 | 120–160 ms |
| Smoke | 4–6 | 200 ms, drift up-right |
| Water foam | 2 or 4 | 400–500 ms |
| Flag | 2 | 300 ms |

Do not animate terrain dither. Do not add a play/speed control.

## 11. Event banners and scenes

One `<EventBanner />` system: 16:9 painting, date, title, two-line body, default / hover / selected. Click opens Event Scene (background + actors + `DialogueBox`). Close restores the map. Banner art is a darker crop of the scene, not a world-map screenshot.

## 12. Prohibited

1. SaaS UI (rounded cards, Inter, blur, light mode)
2. Photoreal / ink-wash JPG portraits inside product chrome
3. Anime / big-eye / gradient hair
4. KOEI rips (영걸전 / 조조전 / RTK)
5. Yokoyama manga panels or dialogue
6. Top-down RPG Maker grass as the world language
7. Same-face 4×4 compositor as named portraits
8. 1-tile capitals
9. Neon faction fills
10. True isometric 2:1
11. Baked Hangul on canvas
12. Playback iconography

## 13. Visual fail conditions

A wave fails this bible if:

- `/world` at 1440 still looks like sparse 1-tile houses
- Two named portraits are indistinguishable with headgear hidden
- Tile camera is top-down while cities are ¾
- A SaaS card or ink-wash JPG sits inside `.eik-win`
- 장안 or 국내성 is a 32×32 hut
- Fire is a static orange square
- Faction identity is hue-shift only
