# WP1 atlas generator — acceptance evidence

## 1. Generator

`python scripts/build_eiketsu_atlas.py` exits 0.

```
wrote public/assets/eiketsu/tiles32.png (512, 320)
wrote public/assets/eiketsu/units.png (128, 8704) rows 136
wrote public/assets/eiketsu/units-officer.png (128, 512) rows 8
wrote public/assets/eiketsu/kao.png (512, 720) chars 67 rows 9
```

## 2. tiles32.png size

Pillow `Image.open(...).size` → **(512, 320)** (16×10 cells of 32px).

## 3. Autotile seams

Wrote and opened:

- `tools/autotile-forest-seams.png` — mask strip 0..15 + filled forest blob. Interior (mask 15) has no grid lines; foreign edges show a bank + canopy.
- `tools/autotile-river-seams.png` — mask strip 0..15 + lake + 1-tile channel. Lake interior is continuous water; banks appear only against grass; the outlet channel joins the lake.

Wang index: `localIndex = N*1 + E*2 + S*4 + W*8`.

## 4. Index × cellH = sheet height

| file | rowCount | cellH | image size | rowCount×cellH | match |
|---|---|---|---|---|---|
| units.index.json | 136 | 64 | 128×8704 | 8704 | yes |
| units-officer.index.json | 8 | 64 | 128×512 | 512 | yes |
| kao.index.json | 9 | 80 | 512×720 | 720 | yes |

## 5. Typecheck / lint

- `npx tsc --noEmit --incremental false` → exit 0
- `npx eslint src/lib/atlas.ts src/data/kao-params.ts` → 0 warnings
- Full `npm run lint` still reports 5 errors + 1 warning in `src/app/**` and `src/components/**` (other WP ownership). WP1 did not touch those files.

## 6. git paths this worker changed

```
public/assets/eiketsu/README.md
public/assets/eiketsu/kao.png
public/assets/eiketsu/kao.index.json
public/assets/eiketsu/tiles32.png
public/assets/eiketsu/units.png
public/assets/eiketsu/units.index.json
public/assets/eiketsu/units-officer.png
public/assets/eiketsu/units-officer.index.json
scripts/build_eiketsu_atlas.py
src/data/kao-params.ts
src/lib/atlas.ts
tools/autotile-forest-seams.png
tools/autotile-river-seams.png
tools/wp1-atlas-evidence.md
```

`tileset.png` (128×32) and `.ase` / `.piskel` / godot sidecars left in place. Checkout is shared; other WPs have dirty files outside this list.
