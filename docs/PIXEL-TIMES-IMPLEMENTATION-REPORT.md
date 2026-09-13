# Pixel Times implementation report

Isolated clone `C:\Users\windo\Pixeltimes\3dkmap`, branch `pixel-times-v2`. Other checkout `C:\Users\windo\3KDmap` was not modified.

## Architecture

Next.js 15 app. `/world` is the map-first Pixel Times shell (four trees, volume timeline, discrete ▶ / ▶▶▶). Event banners overlay `StrategicMapCanvas`. `?scene=` opens `EventSceneOverlay` (deterministic `frameAtSpeak` in `src/lib/scene-engine.ts`). Catalog routes keep the eiketsu shell.

Protected catalogs (`episodes.ts`, `episodes-mid.ts`, `episodes-late.ts`, `events.ts`, `characters.ts`, `volumes.ts`, `places.ts`) stay read-only. Visual and scene data live in `src/data/pixel-times/`.

## Asset pipeline

1. Grok Imagine Image 2.0 original masters (magenta backdrop for officers; 16:9 paintings for banners/backgrounds).
2. `tools/xai-assets/postprocess.py` chroma-keys, crops, nearest-neighbor resizes, packs:
   - portraits 64×80
   - scene actors 48×64 × 2 idle frames
   - map sprites 32×64
   - banners 320×180
   - backgrounds 480×270
3. Runtime: `kaoSheet` / `officerSheet` / `ptActorCell` prefer Pixel Times atlases for the six master ids (유비·관우·장비·조조·손권·제갈량). Others keep eiketsu kao/officer fallbacks.

No KOEI ROM decode, no Yokoyama panels.

## Tests

`scripts/verify.mjs` (Playwright) is the gate: WAVE 2 chrome, WAVE 3 도원결의 scene, WAVE 4–6 호로관/적벽 scenes, PT asset HTTP 200 + declared dimensions, frozen clock, no 재생/플레이, 낙양 battle, 약식 지형, command keyboard, 375 no hscroll, catalog-check.

## Screenshots

`docs/qa/wave-0` through `docs/qa/wave-6` (and wave-3/wave-4 as generated). Honest visual score of Imagine masters after Pillow: identity is readable at atlas scale; style is mixed chibi/painterly SNES, not a locked 16-bit bible. Do not claim ≥90 for the full Codex map density.

## Limitations / next

- Remaining 61 officers still use the old kao compositor.
- World terrain is still the 22×32 top-down grid (¾ 16px rebuild deferred).
- Idle frame 1 is a 1px Pillow offset, not a second Imagine pose.
- Banner paintings are original but not yet matched to the six master faces.
- `STRATEGIC_TERRITORIES` stays empty.

## Agents

ROOT Grok 4.6 on the isolated clone. Imagine Image 2.0 for masters. No OpenAI/Anthropic/Google asset generation.
