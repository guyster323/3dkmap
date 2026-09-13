# Pixel Times implementation report

Isolated clone `C:\Users\windo\Pixeltimes\3dkmap`, branch `pixel-times-v2`. Other checkout `C:\Users\windo\3KDmap` was not modified. Protected catalogs were not edited.

## Architecture

Next.js 15. `/world` is the map-first Pixel Times shell: four trees, volume timeline, discrete ▶ / ▶▶▶, event banners, `?scene=` overlay. Catalog routes keep the eiketsu shell. Sidecar data: `src/data/pixel-times/`. Scene stepper: `src/lib/scene-engine.ts`. World paint: `scripts/build_world_map.py` → `world-map.png` (1024×704).

## Asset pipeline

1. Grok Imagine Image 2.0 (in-session; `tools/xai-assets/generate.py` + `prompts/masters.json`).
2. Pillow: `postprocess.py` (64×80 / 48×64×2 / 32×64 atlases), `build_world_map.py` (landmask, palaces, banners, ships/armies).
3. Runtime prefers Pixel Times atlases for named masters (유비·관우·장비·조조·손권·제갈량·여포·주유·사마의·조운·원소·동탁·장각). Others keep eiketsu kao fallbacks.

No KOEI decode, no Yokoyama panels. Dialogue is original paraphrase with 연의/정사/자치통감/후한서/삼국사기 chips.

## Tests

`npm run build` / `lint` / `verify`. Playwright covers Pixel Times title, four trees, tree ArrowDown, episode/volume step, 도원·호로관·적벽 scenes, asset dimensions, frozen clock, no 재생, 낙양 battle, 375 no hscroll.

## Screenshots

`docs/qa/wave-0` … `wave-6`, `docs/qa/scoreup/`. Visual score **96/100** (`scoreup.md`). Remaining: unnamed kao officers, plains vegetation vs Codex.

## Agents

ROOT Grok 4.6. Orca Grok worker `ctx_ab0011be992b` for idle f1 (released). Imagine Image 2.0 for masters and palaces.

## Recommended next

Replace remaining kao; denser plains; more episode banners beyond the current sidecar set; optional 4-frame fire on 적벽.
