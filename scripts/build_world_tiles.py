#!/usr/bin/env python3
"""Original 16px ¾-lit world tiles + 64x44 strategic grid. Not KOEI."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "pixel-times" / "terrain"
OUT.mkdir(parents=True, exist_ok=True)
DATA = ROOT / "src" / "data" / "terrain" / "strategic-terrain.ts"

COLS, ROWS = 16, 10
TILE = 16
INK = (10, 18, 38, 255)
GOLD = (216, 183, 74, 255)

# ¾: UL light, SE recede
PAL = {
    "plain": [(118, 132, 78), (138, 148, 96), (92, 104, 64)],
    "grass": [(72, 108, 62), (98, 132, 78), (48, 78, 44)],
    "field": [(124, 118, 64), (146, 136, 84), (94, 92, 50)],
    "waste": [(140, 118, 84), (160, 136, 100), (110, 90, 62)],
    "forest": [(40, 72, 42), (70, 102, 58), (24, 46, 28)],
    "hill": [(132, 112, 76), (154, 132, 92), (96, 78, 52)],
    "mountain": [(112, 104, 92), (138, 128, 112), (72, 66, 58)],
    "river": [(56, 92, 118), (92, 124, 142), (36, 64, 88)],
    "sea": [(32, 62, 96), (64, 94, 124), (18, 40, 68)],
    "road": [(152, 130, 94), (172, 150, 112), (118, 98, 70)],
    "wall": [(120, 110, 98), (148, 134, 118), (80, 72, 62)],
}


def cell(kind: str, variant: int) -> Image.Image:
    im = Image.new("RGBA", (TILE, TILE), PAL[kind][0] + (255,))
    d = ImageDraw.Draw(im)
    mid, dark = PAL[kind][1], PAL[kind][2]
    # UL highlight band + SE shade (¾ cue)
    d.polygon([(0, 0), (TILE, 0), (0, TILE // 2)], fill=mid + (255,))
    d.polygon([(TILE, TILE), (TILE, TILE // 3), (TILE // 2, TILE)], fill=dark + (255,))
    if kind == "forest":
        for x, y in ((3, 6), (9, 4), (12, 9), (5, 11)):
            d.ellipse((x, y, x + 5, y + 4), fill=mid + (255,))
            d.point((x + 2, y + 4), fill=dark)
    elif kind == "mountain":
        d.polygon([(2, 14), (8, 3), (14, 14)], fill=dark + (255,))
        d.polygon([(2, 14), (8, 3), (7, 14)], fill=mid + (255,))
        d.point((8, 3), fill=(198, 196, 188, 255))
    elif kind == "hill":
        d.arc((1, 6, 15, 18), 200, 340, fill=mid)
    elif kind == "sea":
        d.line((0, 4 + (variant % 3), TILE, 6 + (variant % 3)), fill=mid)
        if variant & 1:
            d.point((4, 3), fill=(180, 196, 200, 255))
    elif kind == "river":
        d.line((0, 8, TILE, 9), fill=mid)
        d.line((0, 10, TILE, 11), fill=dark)
    elif kind == "field":
        for y in (5, 9, 13):
            d.line((1, y, 14, y), fill=dark)
    elif kind == "road":
        d.rectangle((5, 0, 10, TILE), fill=mid + (255,))
        if variant & 2:
            d.rectangle((0, 5, TILE, 10), fill=mid + (255,))
    # Wang edge darkening: bits N=1 E=2 S=4 W=8 stored in variant 0-15 for autotile rows
    return im


def sheet() -> Image.Image:
    im = Image.new("RGBA", (COLS * TILE, ROWS * TILE), (0, 0, 0, 0))
    # row 0: singles plain/grass/field/waste x4 variants
    names = ["plain", "grass", "field", "waste"]
    for i, n in enumerate(names):
        for v in range(4):
            im.paste(cell(n, v), ((i * 4 + v) * TILE, 0))
    autotile_kinds = ["forest", "hill", "mountain", "river", "sea", "road", "wall"]
    for r, n in enumerate(autotile_kinds, start=1):
        for v in range(16):
            im.paste(cell(n, v), (v * TILE, r * TILE))
    # row 8 structures reused as keep/gate stamps (simple)
    keep = cell("wall", 0)
    d = ImageDraw.Draw(keep)
    d.rectangle((4, 4, 12, 14), fill=PAL["wall"][2] + (255,))
    d.polygon([(3, 4), (8, 1), (13, 4)], fill=GOLD)
    for v in range(16):
        im.paste(keep, (v * TILE, 8 * TILE))
    # row 9 overlay: selection ring
    ov = Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    d.rectangle((1, 1, 14, 14), outline=GOLD)
    for v in range(16):
        im.paste(ov, (v * TILE, 9 * TILE))
    return im


OLD = [
    "AAAA______,,,,,,,.....nnTTTTTTTT",
    "AAAA______,,,,,,,.....nnTTTTTTss",
    "AAAA______,,,,,,,.....nn~AAAAsss",
    "AAAA,,,~~~~,,,,,.ssssnnn~AAAAsss",
    "AAAAAA~~__~,An,,.ssssnnnsnAAAsss",
    "AAAAA~~___~,An,,.ssssssss..nnsss",
    "AAAA~~n___~nAn,,~~nnnnsss..nnsss",
    "AAA~~nn.nn~~~~=~~nnnsssss..nnsss",
    "AAAAnnn===~~=~~~==.ssssss..nssss",
    "AAAAnnn===========..ssssss.sssss",
    "AAAAAA.AAA.=======...ssssnssssss",
    "AAA====n.........~~~~sssssssssss",
    "AAA====n~~~~~~~~~~==ssssssssssss",
    "AAA~~~~~~=====~~=.===sssssssssss",
    "AAAnnnnnT========TTTTsssssssssss",
    "AAATTTTTTTTTTTTTTTTTssssssssssss",
    "TTTTTTTTTTTTTTTTTTTsssssssssssss",
    "TTTTTTTTTTTTTTTTTTTsnnssssssssss",
    "TTTTTTTTTTTTTTTTTTssnnssssssssss",
    "TTTTTTTTTTTTTTTTTsssnsssssssssss",
    "TTTTTTTTTTTTTTTsssssssssssssssss",
    "TTTTTTTTTTTsssssssssssssssssssss",
]


def upsample() -> list[list[str]]:
    g = [[OLD[r // 2][c // 2] for c in range(64)] for r in range(44)]
    # Carve Korea peninsula (east, mid-lat)
    for r, c in (
        (6, 54), (6, 55), (7, 53), (7, 54), (7, 55), (8, 53), (8, 54), (8, 55),
        (9, 54), (9, 55), (10, 54), (10, 55), (11, 55), (5, 54), (4, 52), (4, 53),
        (5, 52), (5, 53), (8, 56), (9, 56), (12, 54),  # jeju-ish
    ):
        g[r][c] = "n" if r < 8 else ","
    # Bohai / Shandong: land tongue then sea
    for r in range(10, 16):
        for c in range(40, 48):
            if r == 12 and 42 <= c <= 46:
                g[r][c] = ","
            elif r in (11, 13) and 43 <= c <= 45:
                g[r][c] = ","
    for r in range(8, 14):
        for c in range(46, 52):
            if not (11 <= r <= 13 and 42 <= c <= 46):
                g[r][c] = "s"
    # Yellow sea east of shandong
    for r in range(14, 22):
        for c in range(48, 64):
            if g[r][c] not in "n,A":
                g[r][c] = "s"
    return g


def write_ts(g: list[list[str]]) -> None:
    lines = [
        "/** 전역도 바탕 지형. 44×64, 16px 타일. 원본 그림. 정확한 해안선이 아니다. */",
        'import { TERRAIN_CHAR } from "./types";',
        "",
        "export const GRID_COLS = 64;",
        "export const GRID_ROWS = 44;",
        "",
        "export const STRATEGIC_TERRAIN_GRID: string[] = [",
    ]
    for i, row in enumerate(g):
        s = "".join(row)
        lines.append(f'  "{s}", // {i}')
    lines.append("];")
    lines.append(
        """
(function assertStrategicGrid() {
  if (STRATEGIC_TERRAIN_GRID.length !== GRID_ROWS) {
    throw new Error(`strategic terrain: expected ${GRID_ROWS} rows, got ${STRATEGIC_TERRAIN_GRID.length}`);
  }
  STRATEGIC_TERRAIN_GRID.forEach((row, i) => {
    if (row.length !== GRID_COLS) {
      throw new Error(`strategic terrain row ${i}: expected ${GRID_COLS} chars, got ${row.length}`);
    }
    for (const ch of row) {
      if (!(ch in TERRAIN_CHAR)) {
        throw new Error(`strategic terrain row ${i}: unknown terrain char ${JSON.stringify(ch)}`);
      }
    }
  });
})();
"""
    )
    DATA.write_text("\n".join(lines), encoding="utf-8")


def city_sheet() -> Image.Image:
    """¾ city tiers: 16, 32, 48, 64 px footprints as separate PNGs."""
    def hut(size: int, palace: bool) -> Image.Image:
        im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        wall = (90, 70, 52, 255)
        roof = (180, 48, 36, 255) if not palace else (196, 154, 48, 255)
        d.rectangle((2, size // 2, size - 3, size - 2), fill=wall)
        d.polygon([(1, size // 2), (size // 2, size // 5), (size - 2, size // 2)], fill=roof)
        d.line((1, size // 2, size - 2, size // 2), fill=INK)
        if palace:
            d.rectangle((size // 2 - 2, size - 6, size // 2 + 2, size - 2), fill=GOLD)
        return im

    OUT.mkdir(parents=True, exist_ok=True)
    hut(16, False).save(OUT / "city-village.png")
    hut(24, False).save(OUT / "city-county.png")
    hut(32, False).save(OUT / "city-major.png")
    hut(48, True).save(OUT / "city-capital.png")
    return hut(48, True)


def main() -> None:
    sh = sheet()
    sh.save(OUT / "tiles16.png")
    write_ts(upsample())
    city_sheet()
    print("wrote", OUT / "tiles16.png", sh.size)
    print("wrote", DATA)


if __name__ == "__main__":
    main()
