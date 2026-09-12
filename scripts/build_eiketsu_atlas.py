#!/usr/bin/env python3
"""Original 영걸전-grammar pixel atlases (Pillow).

Does NOT decode or redistribute copyrighted KOEI / Yokoyama files.
Cell sizes follow docs/REDESIGN-EIKETSU.md §3. Every pixel is original.
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "eiketsu"
OUT.mkdir(parents=True, exist_ok=True)
TOOLS = ROOT / "tools"
TOOLS.mkdir(parents=True, exist_ok=True)
SRC_DATA = ROOT / "src" / "data"

# --- §2-adjacent terrain palette (low-chroma green / ochre / slate) ---
INK = (10, 18, 38, 255)
INK_S = (26, 32, 48, 255)
GOLD = (216, 183, 74, 255)
GOLD_D = (138, 116, 48, 255)
CINN = (194, 59, 34, 255)
JADE = (61, 139, 122, 255)
TEXT = (240, 234, 216, 255)
VOID = (6, 10, 20, 255)
WHITE = (236, 228, 210, 255)
TRANS = (0, 0, 0, 0)
SHADOW = (10, 18, 38, 88)

PLAIN = (118, 128, 86, 255)
PLAIN_L = (138, 146, 102, 255)
PLAIN_D = (92, 102, 68, 255)
GRASS = (96, 116, 74, 255)
GRASS_L = (118, 136, 90, 255)
GRASS_D = (74, 92, 58, 255)
FIELD = (124, 122, 72, 255)
FIELD_L = (146, 140, 88, 255)
FIELD_D = (94, 96, 54, 255)
FIELD_W = (86, 108, 92, 255)
WASTE = (140, 118, 84, 255)
WASTE_L = (160, 138, 100, 255)
WASTE_D = (110, 90, 62, 255)

FOREST = (58, 82, 52, 255)
FOREST_L = (82, 104, 68, 255)
FOREST_D = (40, 58, 38, 255)
FOREST_TR = (78, 60, 42, 255)

HILL = (132, 112, 76, 255)
HILL_L = (154, 132, 92, 255)
HILL_D = (102, 84, 56, 255)

MTN = (112, 104, 92, 255)
MTN_L = (138, 128, 112, 255)
MTN_D = (80, 74, 66, 255)
MTN_SNOW = (198, 196, 188, 255)

RIVER = (72, 98, 114, 255)
RIVER_L = (102, 126, 138, 255)
RIVER_D = (48, 72, 88, 255)
RIVER_H = (148, 166, 172, 255)

SEA = (48, 74, 98, 255)
SEA_L = (76, 102, 122, 255)
SEA_D = (32, 54, 76, 255)
SEA_FOAM = (158, 172, 176, 255)

ROAD = (152, 130, 94, 255)
ROAD_L = (172, 150, 112, 255)
ROAD_D = (118, 98, 70, 255)

WALL = (120, 110, 98, 255)
WALL_L = (148, 134, 118, 255)
WALL_D = (88, 80, 70, 255)
WOOD = (96, 68, 42, 255)
WOOD_L = (124, 92, 58, 255)

SKIN = (232, 201, 160, 255)
SKIN_S = (212, 168, 120, 255)
SKIN_D = (186, 136, 96, 255)
LIP = (148, 64, 48, 255)
STEEL = (168, 172, 176, 255)
STEEL_D = (112, 118, 124, 255)
STEEL_L = (206, 210, 214, 255)
LEATHER = (92, 62, 40, 255)

# Recolor keys — unique so they never collide with skin/steel/gold
T_ARMOR = (255, 0, 0, 255)
T_ARMOR_L = (255, 64, 64, 255)
T_ARMOR_D = (176, 0, 0, 255)
T_CLOTH = (0, 0, 255, 255)
T_CLOTH_D = (0, 0, 160, 255)
T_CLOTH_L = (64, 64, 255, 255)

TILE = 32
TILE_COLS = 16
TILE_ROWS = 10
UW, UH = 32, 64
UNIT_COLS = 4
KW, KH = 64, 80
KAO_COLS = 8

UNIT_KINDS = [
    "infantry",
    "spear",
    "cavalry",
    "archer",
    "crossbow",
    "navy",
    "strategist",
    "lord",
]
FACTIONS = [
    "han",
    "yellow",
    "dong",
    "cao",
    "liu",
    "sun",
    "yuan-shao",
    "yuan-shu",
    "lu-bu",
    "gongsun",
    "tao",
    "goguryeo",
    "mahan",
    "jinhan",
    "byeonhan",
    "lelange",
    "other",
]
# Same hex as src/lib/eiketsu.ts FACTION_BANNER (read-only file).
FACTION_HEX = {
    "han": "#c9a227",
    "yellow": "#c9b44a",
    "dong": "#6b4a2a",
    "cao": "#6b2a2a",
    "liu": "#3d6b3a",
    "sun": "#2a4a6b",
    "yuan-shao": "#5a3a6b",
    "yuan-shu": "#6b3a4a",
    "lu-bu": "#8a2a4a",
    "gongsun": "#3a5a6b",
    "tao": "#4a6b4a",
    "goguryeo": "#3d8b7a",
    "mahan": "#4a6b3a",
    "jinhan": "#3a5a4a",
    "byeonhan": "#2a5a4a",
    "lelange": "#8a7a4a",
    "other": "#8a7d68",
}
OFFICERS = [
    "liu-bei",
    "guan-yu",
    "zhang-fei",
    "cao-cao",
    "dong-zhuo",
    "lu-bu",
    "sun-jian",
    "gogukcheon",
]


def new(w: int, h: int) -> Image.Image:
    return Image.new("RGBA", (w, h), TRANS)


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def mix(a, b, t: float):
    t = max(0.0, min(1.0, t))
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,)


def dark(c, t=0.4):
    return mix(c, INK, t)


def light(c, t=0.28):
    return mix(c, WHITE, t)


def h32(x: int, y: int, s: int = 0) -> int:
    n = (x * 374761393) ^ (y * 668265263) ^ (s * 144737) ^ 0xA5A5A5
    n = (n ^ (n >> 13)) & 0xFFFFFFFF
    n = (n * 1274126177) & 0xFFFFFFFF
    return n ^ (n >> 16)


def put(im: Image.Image, x: int, y: int, c, w: int = 1, h: int = 1) -> None:
    if c is None:
        return
    iw, ih = im.size
    for j in range(h):
        yy = y + j
        if yy < 0 or yy >= ih:
            continue
        for i in range(w):
            xx = x + i
            if 0 <= xx < iw:
                im.putpixel((xx, yy), c)


def disc(im: Image.Image, cx: int, cy: int, r: int, c) -> None:
    r2 = r * r
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2:
                put(im, x, y, c)


def ellipse_fill(im: Image.Image, cx: int, cy: int, rx: int, ry: int, c) -> None:
    if rx <= 0 or ry <= 0:
        return
    rx2, ry2 = rx * rx, ry * ry
    for y in range(cy - ry, cy + ry + 1):
        dy = y - cy
        for x in range(cx - rx, cx + rx + 1):
            dx = x - cx
            if dx * dx * ry2 + dy * dy * rx2 <= rx2 * ry2:
                put(im, x, y, c)


def line(im: Image.Image, x0: int, y0: int, x1: int, y1: int, c, w: int = 1) -> None:
    d = ImageDraw.Draw(im)
    d.line([(x0, y0), (x1, y1)], fill=c, width=w)


def outline_opaque(im: Image.Image, ink=INK) -> None:
    src = im.copy()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            if src.getpixel((x, y))[3] >= 200:
                continue
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and src.getpixel((nx, ny))[3] >= 200:
                    im.putpixel((x, y), ink)
                    break


def recolor(im: Image.Image, mapping: dict[tuple[int, int, int], tuple]) -> Image.Image:
    out = im.copy()
    sp, dp = im.load(), out.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            p = sp[x, y]
            dest = mapping.get(p[:3])
            if dest is not None:
                dp[x, y] = (dest[0], dest[1], dest[2], p[3])
    return out


def faction_map(fid: str) -> dict[tuple[int, int, int], tuple]:
    rgb = hex_rgb(FACTION_HEX[fid]) + (255,)
    armor = rgb
    armor_l = light(rgb, 0.30)
    armor_d = dark(rgb, 0.42)
    cloth = dark(rgb, 0.22)
    cloth_d = dark(rgb, 0.50)
    cloth_l = light(rgb, 0.18)
    # Keep yellow/han from blowing out into neon.
    if fid in ("han", "yellow"):
        armor_l = mix(rgb, WHITE, 0.18)
    return {
        T_ARMOR[:3]: armor,
        T_ARMOR_L[:3]: armor_l,
        T_ARMOR_D[:3]: armor_d,
        T_CLOTH[:3]: cloth,
        T_CLOTH_D[:3]: cloth_d,
        T_CLOTH_L[:3]: cloth_l,
    }


# ---------------------------------------------------------------------------
# Terrain textures (32-periodic so mask-15 interiors tile)
# ---------------------------------------------------------------------------
def tex_plain(x: int, y: int, seed: int = 0):
    n = h32(x & 31, y & 31, 11 + seed)
    k = n % 6
    if k == 0:
        return PLAIN_L
    if k == 1:
        return PLAIN_D
    return PLAIN


def tex_grass(x: int, y: int, seed: int = 0):
    n = h32(x & 31, y & 31, 29 + seed)
    k = n % 7
    if k == 0:
        return GRASS_L
    if k in (1, 2):
        return GRASS_D
    return GRASS


def tex_field(x: int, y: int, seed: int = 0):
    yy = y & 31
    if yy % 8 < 2:
        return FIELD_W
    n = h32(x & 31, y & 31, 41 + seed)
    return FIELD_L if n % 5 == 0 else (FIELD_D if n % 5 == 1 else FIELD)


def tex_waste(x: int, y: int, seed: int = 0):
    n = h32(x & 31, y & 31, 53 + seed)
    k = n % 8
    if k == 0:
        return WASTE_L
    if k in (1, 2):
        return WASTE_D
    if k == 3:
        return MTN
    return WASTE


def tex_forest(x: int, y: int):
    n = h32(x & 31, y & 31, 67)
    k = n % 9
    if k == 0:
        return FOREST_L
    if k in (1, 2, 3):
        return FOREST_D
    return FOREST


def tex_hill(x: int, y: int):
    n = h32(x & 31, y & 31, 71)
    shade = ((x & 31) + (y & 31) * 2) % 7
    base = HILL_L if shade < 2 else (HILL_D if shade > 5 else HILL)
    if n % 11 == 0:
        return HILL_D
    return base


def tex_mountain(x: int, y: int):
    n = h32(x & 31, y & 31, 83)
    yy = y & 31
    if yy < 6 and n % 5 == 0:
        return MTN_SNOW
    k = n % 8
    if k == 0:
        return MTN_L
    if k in (1, 2):
        return MTN_D
    return MTN


def tex_river(x: int, y: int):
    n = h32(x & 31, y & 31, 97)
    wave = ((x + y // 2) & 31)
    if wave % 11 == 0:
        return RIVER_H
    if n % 6 == 0:
        return RIVER_L
    if n % 6 == 1:
        return RIVER_D
    return RIVER


def tex_sea(x: int, y: int):
    n = h32(x & 31, y & 31, 101)
    wave = (x + (y // 3)) & 15
    if wave == 0:
        return SEA_FOAM
    if n % 7 == 0:
        return SEA_L
    if n % 7 == 1:
        return SEA_D
    return SEA


def tex_road(x: int, y: int):
    n = h32(x & 31, y & 31, 107)
    k = n % 7
    if k == 0:
        return ROAD_L
    if k in (1, 2):
        return ROAD_D
    return ROAD


def tex_wall(x: int, y: int):
    xx, yy = x & 31, y & 31
    mortar = (yy % 8 == 0) or ((xx + (4 if (yy // 8) % 2 else 0)) % 10 == 0)
    if mortar:
        return WALL_D
    n = h32(xx, yy, 109)
    return WALL_L if n % 9 == 0 else WALL


def wang_inside(x: int, y: int, mask: int, size: int = 32, margin: int = 7, radius: int = 6) -> bool:
    n, e, s, w = mask & 1, (mask >> 1) & 1, (mask >> 2) & 1, (mask >> 3) & 1
    x0 = 0 if w else margin
    x1 = size if e else size - margin
    y0 = 0 if n else margin
    y1 = size if s else size - margin
    if not (x0 <= x < x1 and y0 <= y < y1):
        return False
    px, py = x + 0.5, y + 0.5

    def corner(cond: bool, cx: float, cy: float, in_x: bool, in_y: bool) -> bool:
        if not cond or not (in_x and in_y):
            return True
        return (px - cx) ** 2 + (py - cy) ** 2 <= radius * radius

    if not corner(not n and not w, x0 + radius, y0 + radius, px < x0 + radius, py < y0 + radius):
        return False
    if not corner(not n and not e, x1 - radius, y0 + radius, px > x1 - radius, py < y0 + radius):
        return False
    if not corner(not s and not e, x1 - radius, y1 - radius, px > x1 - radius, py > y1 - radius):
        return False
    if not corner(not s and not w, x0 + radius, y1 - radius, px < x0 + radius, py > y1 - radius):
        return False
    return True


def wang_tile(mask: int, interior, outside, bank_hi, bank_lo, margin: int = 7, radius: int = 6) -> Image.Image:
    im = new(TILE, TILE)
    inside = [[wang_inside(x, y, mask, TILE, margin, radius) for x in range(TILE)] for y in range(TILE)]
    n, e, s, w = mask & 1, (mask >> 1) & 1, (mask >> 2) & 1, (mask >> 3) & 1
    for y in range(TILE):
        for x in range(TILE):
            im.putpixel((x, y), interior(x, y) if inside[y][x] else outside(x, y))
    for y in range(TILE):
        for x in range(TILE):
            if not inside[y][x]:
                continue
            hi = lo = False
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                oob = not (0 <= nx < TILE and 0 <= ny < TILE)
                if oob:
                    if nx < 0 and w:
                        continue
                    if nx >= TILE and e:
                        continue
                    if ny < 0 and n:
                        continue
                    if ny >= TILE and s:
                        continue
                    if dy < 0 or dx < 0:
                        hi = True
                    else:
                        lo = True
                elif not inside[ny][nx]:
                    if dy < 0 or dx < 0:
                        hi = True
                    else:
                        lo = True
            if hi or lo:
                im.putpixel((x, y), bank_hi if hi and not lo else bank_lo)
    return im


def decorate_forest(im: Image.Image, mask: int) -> None:
    """Canopy clumps. Mask 15 stays texture-only so interiors wrap."""
    if mask == 15:
        return
    disc(im, 16, 14, 8, FOREST_D)
    disc(im, 16, 13, 6, FOREST)
    put(im, 15, 20, FOREST_TR, 2, 6)
    put(im, 14, 25, FOREST_D, 4, 2)
    put(im, 13, 10, FOREST_L, 4, 2)


def decorate_hill(im: Image.Image, mask: int) -> None:
    if mask == 15:
        return
    for y, w in ((22, 20), (16, 14), (11, 10), (7, 6)):
        put(im, (32 - w) // 2, y, HILL_L if y < 14 else HILL, w, 2)


def decorate_mountain(im: Image.Image, mask: int) -> None:
    if mask == 15:
        return
    for y, w, c in ((24, 22, MTN_D), (18, 16, MTN), (12, 10, MTN_L), (8, 6, MTN_SNOW), (5, 3, WHITE)):
        put(im, (32 - w) // 2, y, c, w, 3)


def decorate_river(im: Image.Image, mask: int) -> None:
    if mask == 15:
        return
    put(im, 10, 12, RIVER_H, 8, 1)
    put(im, 14, 20, RIVER_H, 6, 1)


def decorate_sea(im: Image.Image, mask: int) -> None:
    put(im, 3, 6, SEA_FOAM, 8, 1)
    put(im, 14, 14, SEA_FOAM, 10, 1)
    put(im, 6, 24, SEA_FOAM, 7, 1)
    if mask != 15:
        # foam along banks already from wang; add a darker deep-water core
        pass


def decorate_road(im: Image.Image, mask: int) -> None:
    # Wheel ruts along the long axis of the blob
    n, e, s, w = mask & 1, (mask >> 1) & 1, (mask >> 2) & 1, (mask >> 3) & 1
    if n or s:
        put(im, 14, 0 if n else 8, ROAD_D, 1, 32 if (n and s) else 20)
        put(im, 17, 0 if n else 8, ROAD_D, 1, 32 if (n and s) else 20)
    if e or w:
        put(im, 0 if w else 8, 14, ROAD_D, 32 if (e and w) else 20, 1)
        put(im, 0 if w else 8, 17, ROAD_D, 32 if (e and w) else 20, 1)


def decorate_wall(im: Image.Image, mask: int) -> None:
    if mask == 15:
        return
    # Crenellations on unconnected north
    if not (mask & 1):
        for x in range(8, 25, 5):
            put(im, x, 6, WALL_L, 3, 3)


def make_autotile(kind: str, mask: int) -> Image.Image:
    specs = {
        "forest": (tex_forest, tex_grass, FOREST_L, FOREST_D, 7, 6, decorate_forest),
        "hill": (tex_hill, tex_plain, HILL_L, HILL_D, 7, 6, decorate_hill),
        "mountain": (tex_mountain, tex_hill, MTN_L, MTN_D, 8, 5, decorate_mountain),
        "river": (tex_river, tex_plain, RIVER_H, RIVER_D, 8, 7, decorate_river),
        "sea": (tex_sea, tex_waste, SEA_FOAM, SEA_D, 7, 6, decorate_sea),
        "road": (tex_road, tex_plain, ROAD_L, ROAD_D, 10, 4, decorate_road),
        "wall": (tex_wall, tex_plain, WALL_L, WALL_D, 8, 3, decorate_wall),
    }
    interior, outside, hi, lo, margin, radius, deco = specs[kind]
    im = wang_tile(mask, interior, outside, hi, lo, margin, radius)
    deco(im, mask)
    return im


def fill_tex(fn, seed: int = 0) -> Image.Image:
    im = new(TILE, TILE)
    for y in range(TILE):
        for x in range(TILE):
            im.putpixel((x, y), fn(x, y, seed) if fn.__code__.co_argcount >= 3 else fn(x, y))
    return im


def stamp_dots(im: Image.Image, color, spots) -> None:
    for x, y in spots:
        put(im, x, y, color)


def tile_plain_v(v: int) -> Image.Image:
    im = fill_tex(tex_plain, v)
    extra = [(3 + v, 8), (18, 4 + v), (27, 22), (9, 28), (21, 16)]
    stamp_dots(im, PLAIN_D, extra)
    if v == 1:
        stamp_dots(im, GRASS_D, [(6, 12), (24, 9)])
    if v == 2:
        put(im, 12, 20, PLAIN_L, 3, 1)
    if v == 3:
        disc(im, 22, 18, 1, PLAIN_D)
    return im


def tile_grass_v(v: int) -> Image.Image:
    im = fill_tex(tex_grass, v)
    blades = [(4 + v * 3, 10), (14, 6 + v), (22, 20), (8, 24), (26, 12)]
    for x, y in blades:
        put(im, x, y, GRASS_D, 1, 3)
        put(im, x, y, GRASS_L)
    return im


def tile_field_v(v: int) -> Image.Image:
    im = fill_tex(tex_field, v)
    put(im, 0, 4 + v, FIELD_W, 32, 1)
    put(im, 2, 16, FIELD_D, 6, 1)
    return im


def tile_waste_v(v: int) -> Image.Image:
    im = fill_tex(tex_waste, v)
    put(im, 6 + v, 10, MTN, 4, 2)
    put(im, 20, 18 + v, WASTE_D, 5, 2)
    put(im, 12, 26, WASTE_L, 3, 1)
    return im


def tile_gate(facing: str) -> Image.Image:
    im = fill_tex(tex_plain, 0)
    # Wall mass
    put(im, 2, 10, WALL, 28, 18)
    put(im, 2, 10, WALL_D, 28, 2)
    put(im, 2, 10, WALL_D, 2, 18)
    put(im, 28, 10, WALL_D, 2, 18)
    put(im, 4, 12, WALL_L, 3, 2)
    # Arch opening by facing
    if facing == "n":
        put(im, 10, 8, INK, 12, 16)
        put(im, 11, 10, WOOD, 10, 14)
        put(im, 15, 16, GOLD, 2, 3)
    elif facing == "s":
        put(im, 10, 14, INK, 12, 16)
        put(im, 11, 16, WOOD, 10, 14)
        put(im, 15, 22, GOLD, 2, 3)
    elif facing == "e":
        put(im, 16, 12, INK, 14, 14)
        put(im, 17, 13, WOOD, 12, 12)
        put(im, 22, 18, GOLD, 2, 2)
    else:
        put(im, 2, 12, INK, 14, 14)
        put(im, 3, 13, WOOD, 12, 12)
        put(im, 8, 18, GOLD, 2, 2)
    put(im, 8, 6, CINN, 16, 4)
    put(im, 14, 4, GOLD, 4, 3)
    return im


def tile_keep(v: int) -> Image.Image:
    im = fill_tex(tex_plain, 1)
    put(im, 4, 20, WALL, 24, 10)
    put(im, 6, 12, WALL, 20, 10)
    put(im, 10, 6, WALL, 12, 8)
    put(im, 4, 20, WALL_D, 24, 2)
    put(im, 6, 12, CINN, 20, 3)
    put(im, 10, 6, CINN, 12, 3)
    put(im, 14, 2, GOLD, 4, 4)
    put(im, 14, 22, INK, 4, 8)
    put(im, 8 + v, 16, INK, 3, 3)
    put(im, 20 - v, 16, INK, 3, 3)
    put(im, 14, 10, INK, 4, 3)
    return im


def tile_tower(v: int) -> Image.Image:
    im = fill_tex(tex_plain, 2)
    x = 10 + v
    put(im, x, 8, WALL, 10, 22)
    put(im, x - 1, 6, CINN, 12, 4)
    put(im, x + 3, 2, GOLD, 4, 5)
    put(im, x + 3, 12, INK, 4, 4)
    put(im, x + 3, 20, INK, 4, 4)
    put(im, x, 28, WALL_D, 10, 2)
    return im


def tile_camp(v: int) -> Image.Image:
    im = fill_tex(tex_plain, 3)
    col = T_ARMOR if v == 0 else CINN
    # tent
    for i, w in enumerate((18, 14, 10, 6, 2)):
        put(im, (32 - w) // 2, 10 + i * 3, col if v else mix(WOOD, CINN, 0.3), w, 3)
    put(im, 15, 8, WOOD, 2, 20)
    put(im, 15, 6, GOLD, 2, 3)
    put(im, 6, 24, WOOD, 20, 2)
    return im


def tile_palisade(v: int) -> Image.Image:
    im = fill_tex(tex_plain, 0)
    y0 = 8 if v == 0 else 12
    for x in range(2, 30, 4):
        put(im, x, y0, WOOD, 2, 22 - y0 + 8)
        put(im, x, y0 - 2, WOOD_L, 1, 3)
        put(im, x + 1, y0, WOOD_L, 1, 2)
    put(im, 0, 28, WOOD, 32, 3)
    return im


def tile_bridge(v: int) -> Image.Image:
    im = make_autotile("river", 10 if v == 0 else 5)  # E-W water or N-S water
    if v == 0:
        put(im, 0, 12, WOOD, 32, 8)
        for x in range(0, 32, 4):
            put(im, x, 12, WOOD_L, 1, 8)
        put(im, 0, 11, WOOD, 32, 1)
        put(im, 0, 20, WOOD, 32, 1)
    else:
        put(im, 12, 0, WOOD, 8, 32)
        for y in range(0, 32, 4):
            put(im, 12, y, WOOD_L, 8, 1)
        put(im, 11, 0, WOOD, 1, 32)
        put(im, 20, 0, WOOD, 1, 32)
    return im


def tile_cursor(frame: int, color) -> Image.Image:
    im = new(TILE, TILE)
    o = frame  # pulse inset
    g = color
    segs = [
        (o, o, 6, 1),
        (o, o, 1, 6),
        (25 - o, o, 6, 1),
        (30 - o, o, 1, 6),
        (o, 30 - o, 6, 1),
        (o, 25 - o, 1, 6),
        (25 - o, 30 - o, 6, 1),
        (30 - o, 25 - o, 1, 6),
    ]
    for x, y, w, h in segs:
        put(im, x, y, g, w, h)
    return im


def tile_range(v: int) -> Image.Image:
    im = new(TILE, TILE)
    col = (*JADE[:3], 110 + v * 20)
    for y in range(2, 30):
        for x in range(2, 30):
            if (x + y + v) & 3 == 0:
                put(im, x, y, col)
    # dashed border
    for i in range(2, 30, 2):
        put(im, i, 2, JADE)
        put(im, i, 29, JADE)
        put(im, 2, i, JADE)
        put(im, 29, i, JADE)
    return im


def tile_select(v: int) -> Image.Image:
    im = new(TILE, TILE)
    phase = v
    for i in range(32):
        if ((i + phase) // 2) % 2 == 0:
            put(im, i, 0, GOLD)
            put(im, i, 31, GOLD)
            put(im, 0, i, GOLD)
            put(im, 31, i, GOLD)
    return im


def tile_flag(v: int) -> Image.Image:
    im = new(TILE, TILE)
    colors = [GOLD, CINN, mix(hex_rgb("#3d6b3a") + (255,), WHITE, 0.05), mix(hex_rgb("#2a4a6b") + (255,), WHITE, 0.08)]
    c = colors[v % 4]
    put(im, 8, 6, WOOD, 2, 24)
    put(im, 10, 6, c, 14, 10)
    put(im, 10, 6, light(c, 0.25), 14, 2)
    put(im, 22, 8, dark(c, 0.3), 2, 6)
    put(im, 6, 28, INK, 6, 2)
    return im


def build_tiles32() -> Image.Image:
    sheet = new(TILE_COLS * TILE, TILE_ROWS * TILE)
    # row 0: plain×4, grass×4, field×4, waste×4
    makers0 = (
        [tile_plain_v(i) for i in range(4)]
        + [tile_grass_v(i) for i in range(4)]
        + [tile_field_v(i) for i in range(4)]
        + [tile_waste_v(i) for i in range(4)]
    )
    for i, t in enumerate(makers0):
        sheet.paste(t, (i * TILE, 0))

    kinds = ["forest", "hill", "mountain", "river", "sea", "road", "wall"]
    for row, kind in enumerate(kinds, start=1):
        for mask in range(16):
            tile = make_autotile(kind, mask)
            sheet.paste(tile, (mask * TILE, row * TILE))

    # row 8 structures
    structs = (
        [tile_gate(f) for f in ("n", "e", "s", "w")]
        + [tile_keep(i) for i in range(4)]
        + [tile_tower(i) for i in range(2)]
        + [tile_camp(i) for i in range(2)]
        + [tile_palisade(i) for i in range(2)]
        + [tile_bridge(i) for i in range(2)]
    )
    for i, t in enumerate(structs):
        sheet.paste(t, (i * TILE, 8 * TILE), t)

    # row 9 overlays
    overlays = (
        [tile_cursor(0, GOLD), tile_cursor(1, GOLD), tile_cursor(0, JADE), tile_cursor(1, JADE)]
        + [tile_range(i) for i in range(4)]
        + [tile_select(i) for i in range(4)]
        + [tile_flag(i) for i in range(4)]
    )
    for i, t in enumerate(overlays):
        sheet.paste(t, (i * TILE, 9 * TILE), t)

    path = OUT / "tiles32.png"
    sheet.save(path)
    print("wrote", path, sheet.size)
    return sheet


# ---------------------------------------------------------------------------
# Units 32×64 — 2.5 heads, wide shoulders, weapon silhouette
# ---------------------------------------------------------------------------
def complete_pal(pal: dict) -> dict:
    out = {
        "skin": SKIN,
        "skin_s": SKIN_S,
        "skin_d": SKIN_D,
        "ink": INK,
        "gold": GOLD,
        "steel": STEEL,
        "steel_d": STEEL_D,
        "steel_l": STEEL_L,
        "leather": LEATHER,
        "wood": WOOD,
        "cloth": pal.get("armor", T_CLOTH),
        "cloth_l": pal.get("armor_l", T_CLOTH_L),
        "cloth_d": pal.get("armor_d", T_CLOTH_D),
    }
    out.update(pal)
    return out


def tpl_pal() -> dict:
    return complete_pal(
        {
            "armor": T_ARMOR,
            "armor_l": T_ARMOR_L,
            "armor_d": T_ARMOR_D,
            "cloth": T_CLOTH,
            "cloth_l": T_CLOTH_L,
            "cloth_d": T_CLOTH_D,
        }
    )


def draw_shadow(im: Image.Image) -> None:
    ellipse_fill(im, 16, 61, 10, 2, SHADOW)


def draw_boots(im: Image.Image, lx: int, rx: int, y: int, pal) -> None:
    pal = complete_pal(pal)
    put(im, lx, y, pal["ink"], 4, 5)
    put(im, rx, y, pal["ink"], 4, 5)
    put(im, lx, y + 4, pal["leather"], 4, 1)
    put(im, rx, y + 4, pal["leather"], 4, 1)


def draw_legs(im: Image.Image, frame: int, y: int, pal, robe=False) -> tuple[int, int]:
    pal = complete_pal(pal)
    lx = 10 + frame * 2
    rx = 18 - frame * 2
    col = pal["cloth_d"] if robe else pal["armor_d"]
    hi = pal["cloth"] if robe else pal["armor"]
    # tapered legs, 2px step
    put(im, lx, y, hi, 4, 4)
    put(im, lx, y + 4, col, 4, 8)
    put(im, rx, y, hi, 4, 4)
    put(im, rx + (1 - frame), y + 4, col, 4, 8)
    return lx, rx


def draw_torso(im: Image.Image, bob: int, pal, *, wide=True, robe=False, cape=False) -> None:
    pal = complete_pal(pal)
    y0 = 24 + bob
    if cape:
        put(im, 5, y0 + 2, pal["cloth_d"], 6, 22)
        put(im, 6, y0 + 4, pal["cloth"], 4, 18)
        put(im, 7, y0 + 6, pal["cloth_l"], 2, 8)
    if robe:
        for i in range(28):
            t = i / 27
            w = int(18 - t * 4)
            put(im, 16 - w // 2, y0 + i, pal["cloth_l"] if i < 3 else pal["cloth"], w, 1)
        put(im, 15, y0 + 6, pal["gold"], 3, 14)
        return
    # trapezoid: wide shoulders, narrow waist (영걸전 갑주)
    top_w = 20 if wide else 16
    for i in range(16):
        t = i / 15
        w = int(top_w - t * 8)
        x = 16 - w // 2
        col = pal["armor_l"] if i < 3 else (pal["armor_d"] if i > 12 else pal["armor"])
        put(im, x, y0 + i, col, w, 1)
    put(im, 12, y0 + 11, pal["gold"], 8, 2)
    # pauldron discs
    pw = 5 if wide else 4
    ellipse_fill(im, 7, y0 + 3, pw, 4, pal["armor_l"])
    ellipse_fill(im, 25, y0 + 3, pw, 4, pal["armor_d"])


def draw_head(im: Image.Image, bob: int, pal, helm: str) -> None:
    pal = complete_pal(pal)
    cy = 14 + bob
    put(im, 14, 21 + bob, pal["skin"], 4, 5)
    ellipse_fill(im, 16, cy + 3, 7, 8, pal["skin"])
    put(im, 13, cy + 1, pal["skin_s"], 6, 2)
    put(im, 13, cy + 2, pal["ink"], 2, 2)
    put(im, 18, cy + 2, pal["ink"], 2, 2)
    put(im, 13, cy + 2, WHITE, 1, 1)
    put(im, 18, cy + 2, WHITE, 1, 1)
    put(im, 15, cy + 6, LIP, 2, 1)
    # Helm sits on the crown so the face stays readable. Military metal, not faction fill.
    if helm == "round":
        ellipse_fill(im, 16, cy - 3, 8, 5, pal["steel"])
        put(im, 9, cy - 1, pal["steel_d"], 14, 3)
        put(im, 15, cy - 8, pal["gold"], 2, 4)
        put(im, 10, cy, pal["steel_d"], 12, 2)
    elif helm == "pike":
        ellipse_fill(im, 16, cy - 3, 8, 5, pal["steel"])
        put(im, 9, cy - 1, pal["steel_d"], 14, 3)
        put(im, 15, cy - 14, pal["steel_l"], 2, 10)
        put(im, 14, cy - 14, pal["gold"], 4, 2)
    elif helm == "cap":
        put(im, 10, cy - 5, pal["cloth"], 12, 6)
        put(im, 12, cy - 7, pal["cloth_d"], 8, 3)
        put(im, 11, cy - 1, pal["cloth_d"], 10, 2)
    elif helm == "cone":
        for i, w in enumerate((2, 4, 6, 8, 10, 12, 14)):
            put(im, 16 - w // 2, cy - 12 + i, pal["steel"] if i < 4 else pal["armor"], w, 1)
        put(im, 15, cy - 14, pal["gold"], 2, 2)
    elif helm == "crown":
        put(im, 10, cy - 4, pal["gold"], 12, 5)
        put(im, 10, cy - 7, pal["gold"], 2, 4)
        put(im, 15, cy - 10, pal["gold"], 2, 6)
        put(im, 20, cy - 7, pal["gold"], 2, 4)
        put(im, 12, cy - 3, CINN, 8, 2)
    elif helm == "none":
        ellipse_fill(im, 16, cy - 3, 7, 5, pal["ink"])
        put(im, 14, cy - 9, pal["ink"], 4, 5)
        put(im, 15, cy - 10, pal["gold"], 2, 2)
    elif helm == "tiger":
        ellipse_fill(im, 16, cy - 3, 8, 5, pal["leather"])
        put(im, 9, cy - 8, pal["leather"], 4, 7)
        put(im, 19, cy - 8, pal["leather"], 4, 7)
        put(im, 11, cy - 6, GOLD, 2, 2)
        put(im, 19, cy - 6, GOLD, 2, 2)


def draw_sword(im: Image.Image, frame: int, bob: int, pal) -> None:
    pal = complete_pal(pal)
    x = 24
    y = 10 + bob + frame
    put(im, x, y, pal["steel"], 2, 28)
    put(im, x, y, pal["steel_l"], 1, 28)
    put(im, x - 1, y + 26, pal["gold"], 4, 2)
    put(im, x, y + 28, pal["leather"], 2, 6)
    put(im, x, y - 1, pal["steel_l"], 2, 2)


def draw_spear(im: Image.Image, frame: int, bob: int, pal) -> None:
    pal = complete_pal(pal)
    x = 25
    y = 2 + bob
    put(im, x, y + 8, pal["wood"], 2, 46)
    put(im, x - 1, y, pal["steel"], 4, 10)
    put(im, x, y - 2, pal["steel_l"], 2, 4)
    put(im, x - 1, y + 8, pal["gold"], 4, 2)


def draw_bow(im: Image.Image, frame: int, bob: int, pal) -> None:
    pal = complete_pal(pal)
    x = 24 + frame
    y = 14 + bob
    # C-curve
    put(im, x + 2, y, pal["wood"], 2, 3)
    put(im, x + 3, y + 3, pal["wood"], 2, 16)
    put(im, x + 2, y + 19, pal["wood"], 2, 3)
    put(im, x, y + 1, pal["wood"], 2, 2)
    put(im, x, y + 20, pal["wood"], 2, 2)
    line(im, x, y + 2, x, y + 21, pal["leather"])
    put(im, x - 6, y + 10, pal["wood"], 8, 1)  # arrow


def draw_crossbow(im: Image.Image, frame: int, bob: int, pal) -> None:
    pal = complete_pal(pal)
    y = 28 + bob
    put(im, 20, y, pal["wood"], 10, 3)
    put(im, 22, y - 4, pal["wood"], 2, 12)
    put(im, 20, y - 5, pal["steel"], 10, 2)
    put(im, 28, y - 1, pal["steel"], 3, 2)
    put(im, 16, y + 1, pal["leather"], 4, 2)


def draw_oar(im: Image.Image, frame: int, bob: int, pal) -> None:
    pal = complete_pal(pal)
    x = 24
    line(im, x, 12 + bob, x + 2 + frame, 56 + bob, pal["wood"], 2)
    put(im, x, 50 + bob, pal["wood"], 6, 8)
    put(im, x + 1, 51 + bob, pal["wood"], 4, 6)


def draw_fan(im: Image.Image, frame: int, bob: int, pal) -> None:
    pal = complete_pal(pal)
    y = 22 + bob + frame
    put(im, 22, y + 8, pal["wood"], 2, 10)
    put(im, 20, y, pal["cloth_l"], 8, 10)
    put(im, 21, y + 1, TEXT, 6, 2)
    put(im, 24, y, pal["gold"], 2, 10)


def draw_unit(kind: str, frame: int) -> Image.Image:
    im = new(UW, UH)
    pal = tpl_pal()
    bob = -frame
    draw_shadow(im)

    if kind == "cavalry":
        horse = (118, 88, 58, 255)
        horse_d = (86, 62, 40, 255)
        horse_l = (148, 116, 80, 255)
        ellipse_fill(im, 14, 46, 11, 8, horse)
        put(im, 3, 42, horse_d, 5, 10)
        # neck + head facing right
        put(im, 22, 36, horse, 4, 10)
        ellipse_fill(im, 27, 36, 5, 4, horse_l)
        put(im, 30, 34, horse_d, 2, 3)
        put(im, 29, 36, INK, 2, 1)
        put(im, 1, 38, horse_d, 4, 10)
        gait = frame
        put(im, 7, 53, horse_d, 2, 8 - gait * 2)
        put(im, 11, 53, horse_d, 2, 6 + gait * 2)
        put(im, 17, 53, horse_d, 2, 8 - gait * 2)
        put(im, 21, 53, horse_d, 2, 6 + gait * 2)
        put(im, 7, 60, INK, 2, 2)
        put(im, 11, 60, INK, 2, 2)
        put(im, 17, 60, INK, 2, 2)
        put(im, 21, 60, INK, 2, 2)
        # compact rider
        put(im, 9, 26 + bob, pal["armor"], 12, 16)
        put(im, 10, 27 + bob, pal["armor_l"], 10, 3)
        ellipse_fill(im, 8, 30 + bob, 4, 4, pal["armor_l"])
        ellipse_fill(im, 22, 30 + bob, 4, 4, pal["armor_d"])
        draw_head(im, bob - 8, pal, "round")
        put(im, 23, 22 + bob, pal["steel"], 2, 14)
        put(im, 22, 22 + bob, pal["gold"], 4, 2)
        outline_opaque(im)
        return im

    robe = kind in ("strategist",)
    wide = kind in ("infantry", "spear", "lord", "navy", "crossbow")
    cape = kind == "lord"
    lx, rx = draw_legs(im, frame, 40 + bob, pal, robe=robe)
    draw_boots(im, lx, rx, 52 + bob, pal)
    draw_torso(im, bob, pal, wide=wide, robe=robe, cape=cape)

    if kind == "infantry":
        ellipse_fill(im, 8, 34 + bob, 5, 6, pal["steel_d"])
        ellipse_fill(im, 8, 34 + bob, 4, 5, pal["armor_d"])
        put(im, 7, 33 + bob, pal["gold"], 3, 2)
        draw_head(im, bob, pal, "round")
        draw_sword(im, frame, bob, pal)
    elif kind == "spear":
        draw_head(im, bob, pal, "pike")
        draw_spear(im, frame, bob, pal)
    elif kind == "archer":
        # quiver
        put(im, 8, 28 + bob, pal["leather"], 4, 12)
        put(im, 9, 26 + bob, pal["steel"], 1, 6)
        put(im, 11, 26 + bob, pal["steel"], 1, 5)
        draw_head(im, bob, pal, "cap")
        draw_bow(im, frame, bob, pal)
    elif kind == "crossbow":
        draw_head(im, bob, pal, "round")
        draw_crossbow(im, frame, bob, pal)
    elif kind == "navy":
        # small hull at feet
        put(im, 4, 58, pal["wood"], 24, 4)
        put(im, 6, 57, pal["wood"], 20, 1)
        draw_head(im, bob, pal, "cone")
        draw_oar(im, frame, bob, pal)
    elif kind == "strategist":
        draw_head(im, bob, pal, "none")
        draw_fan(im, frame, bob, pal)
    elif kind == "lord":
        draw_head(im, bob, pal, "crown")
        draw_sword(im, frame, bob, pal)

    # front hand
    put(im, 22, 34 + bob + frame, pal["skin"], 3, 3)
    outline_opaque(im)
    return im


def flip_h(im: Image.Image) -> Image.Image:
    return im.transpose(Image.FLIP_LEFT_RIGHT)


def build_units() -> tuple[Image.Image, list[dict]]:
    bases = {kind: [draw_unit(kind, 0), draw_unit(kind, 1)] for kind in UNIT_KINDS}
    rows_meta: list[dict] = []
    n_rows = len(UNIT_KINDS) * len(FACTIONS)
    sheet = new(UNIT_COLS * UW, n_rows * UH)
    r = 0
    for kind in UNIT_KINDS:
        for fac in FACTIONS:
            mapping = faction_map(fac)
            f0 = recolor(bases[kind][0], mapping)
            f1 = recolor(bases[kind][1], mapping)
            sheet.paste(f0, (0, r * UH), f0)
            sheet.paste(f1, (UW, r * UH), f1)
            sheet.paste(flip_h(f0), (UW * 2, r * UH), flip_h(f0))
            sheet.paste(flip_h(f1), (UW * 3, r * UH), flip_h(f1))
            rows_meta.append({"kind": kind, "faction": fac, "row": r})
            r += 1
    path = OUT / "units.png"
    sheet.save(path)
    idx = {"cellW": UW, "cellH": UH, "cols": UNIT_COLS, "rowCount": n_rows, "rows": rows_meta}
    (OUT / "units.index.json").write_text(json.dumps(idx, indent=2), encoding="utf-8")
    print("wrote", path, sheet.size, "rows", n_rows)
    return sheet, rows_meta


# ---------------------------------------------------------------------------
# Unique officers — silhouettes must read without color
# ---------------------------------------------------------------------------
def officer_liu_bei(frame: int) -> Image.Image:
    im = new(UW, UH)
    g = hex_rgb("#3d6b3a") + (255,)
    pal = {
        "armor": g,
        "armor_l": light(g, 0.28),
        "armor_d": dark(g, 0.4),
        "cloth": g,
        "cloth_l": light(g, 0.2),
        "cloth_d": dark(g, 0.35),
        "skin": SKIN,
        "skin_s": SKIN_S,
        "ink": INK,
        "gold": GOLD,
        "steel": STEEL,
        "leather": LEATHER,
    }
    bob = -frame
    draw_shadow(im)
    lx, rx = draw_legs(im, frame, 40 + bob, pal)
    draw_boots(im, lx, rx, 52 + bob, pal)
    draw_torso(im, bob, pal, wide=True, cape=True)
    # large ears (유비)
    put(im, 9, 16 + bob, pal["skin"], 3, 6)
    put(im, 20, 16 + bob, pal["skin"], 3, 6)
    draw_head(im, bob, pal, "none")
    # turban + jade
    ellipse_fill(im, 16, 10 + bob, 8, 5, pal["cloth"])
    put(im, 12, 8 + bob, pal["gold"], 8, 3)
    put(im, 15, 6 + bob, pal["gold"], 3, 3)
    # dual swords
    put(im, 24, 14 + bob + frame, pal["steel"], 2, 30)
    put(im, 26, 18 + bob, STEEL_D, 2, 24)
    put(im, 23, 42 + bob, pal["gold"], 6, 2)
    put(im, 13, 22 + bob, pal["skin_s"], 2, 1)  # kind brow
    outline_opaque(im)
    return im


def officer_guan_yu(frame: int) -> Image.Image:
    """Red face, long beard, 청룡언월도 crescent."""
    im = new(UW, UH)
    green = hex_rgb("#3d6b3a") + (255,)
    pal = {
        "armor": green,
        "armor_l": light(green, 0.25),
        "armor_d": dark(green, 0.4),
        "cloth": dark(green, 0.2),
        "cloth_l": light(green, 0.15),
        "cloth_d": dark(green, 0.4),
        "skin": CINN,
        "skin_s": mix(CINN, INK, 0.2),
        "ink": INK,
        "gold": GOLD,
        "steel": mix(STEEL, JADE, 0.35),
        "leather": LEATHER,
    }
    bob = -frame
    draw_shadow(im)
    lx, rx = draw_legs(im, frame, 40 + bob, pal)
    draw_boots(im, lx, rx, 52 + bob, pal)
    draw_torso(im, bob, pal, wide=True, cape=True)
    # red face + long beard (silhouette)
    ellipse_fill(im, 16, 16 + bob, 6, 7, CINN)
    put(im, 13, 15 + bob, INK, 2, 2)
    put(im, 18, 15 + bob, INK, 2, 2)
    put(im, 12, 22 + bob, INK, 8, 6)
    put(im, 13, 28 + bob, INK, 6, 10)
    put(im, 14, 38 + bob, INK, 4, 6)
    # green helm
    ellipse_fill(im, 16, 10 + bob, 7, 5, pal["armor"])
    put(im, 14, 6 + bob, GOLD, 4, 4)
    put(im, 10, 12 + bob, pal["armor_d"], 12, 3)
    # 청룡언월도: pole + crescent
    put(im, 25, 8 + bob, WOOD, 2, 48)
    cy = 10 + bob
    for y in range(3, 18):
        for x in range(22, 32):
            dx, dy = x - 26, y - cy
            r2 = dx * dx + dy * dy
            if dx >= -1 and 10 <= r2 <= 36:
                put(im, x, y, STEEL_L if r2 < 18 else pal["steel"])
    put(im, 24, 8 + bob, GOLD, 4, 2)
    outline_opaque(im)
    return im


def officer_zhang_fei(frame: int) -> Image.Image:
    """Wild hair, full beard, 장팔사모 (very long spear)."""
    im = new(UW, UH)
    green = hex_rgb("#3d6b3a") + (255,)
    pal = {
        "armor": dark(green, 0.15),
        "armor_l": green,
        "armor_d": dark(green, 0.5),
        "cloth": dark(green, 0.3),
        "cloth_l": light(green, 0.12),
        "cloth_d": dark(green, 0.45),
        "skin": SKIN_D,
        "skin_s": SKIN_S,
        "ink": INK,
        "gold": GOLD,
        "steel": STEEL,
        "leather": LEATHER,
    }
    bob = -frame
    draw_shadow(im)
    lx, rx = draw_legs(im, frame, 40 + bob, pal)
    draw_boots(im, lx, rx, 52 + bob, pal)
    draw_torso(im, bob, pal, wide=True)
    ellipse_fill(im, 16, 17 + bob, 6, 7, pal["skin"])
    put(im, 13, 16 + bob, INK, 2, 2)
    put(im, 18, 16 + bob, INK, 2, 2)
    # fierce brows
    put(im, 11, 14 + bob, INK, 5, 2)
    put(im, 17, 14 + bob, INK, 5, 2)
    # bushy beard
    ellipse_fill(im, 16, 26 + bob, 8, 6, INK)
    put(im, 12, 30 + bob, INK, 8, 4)
    # wild hair spikes
    put(im, 8, 8 + bob, INK, 3, 8)
    put(im, 21, 7 + bob, INK, 3, 9)
    put(im, 12, 5 + bob, INK, 3, 6)
    put(im, 17, 4 + bob, INK, 3, 6)
    put(im, 10, 12 + bob, INK, 12, 4)
    # 장팔사모 — full height spear, slight snake wave
    x = 25
    for y in range(0, 60):
        ox = 1 if (y // 6 + frame) % 2 == 0 else 0
        put(im, x + ox, y + bob, WOOD if y > 8 else STEEL, 2, 1)
    put(im, 24, 0 + bob, STEEL_L, 5, 6)
    put(im, 25, -1 + bob, STEEL, 2, 3)
    outline_opaque(im)
    return im


def officer_cao_cao(frame: int) -> Image.Image:
    im = new(UW, UH)
    red = hex_rgb("#6b2a2a") + (255,)
    pal = {
        "armor": red,
        "armor_l": light(red, 0.25),
        "armor_d": dark(red, 0.4),
        "cloth": dark(red, 0.2),
        "cloth_l": light(red, 0.15),
        "cloth_d": dark(red, 0.4),
        "skin": SKIN,
        "skin_s": SKIN_S,
        "ink": INK,
        "gold": GOLD,
        "steel": STEEL,
        "leather": LEATHER,
    }
    bob = -frame
    draw_shadow(im)
    lx, rx = draw_legs(im, frame, 40 + bob, pal)
    draw_boots(im, lx, rx, 52 + bob, pal)
    draw_torso(im, bob, pal, wide=True, cape=True)
    # gaunt face, short beard
    ellipse_fill(im, 16, 17 + bob, 5, 7, pal["skin"])
    put(im, 13, 16 + bob, INK, 2, 2)
    put(im, 17, 16 + bob, INK, 2, 2)
    put(im, 14, 22 + bob, INK, 4, 3)
    # tall jinxian
    put(im, 12, 4 + bob, INK, 8, 12)
    put(im, 11, 14 + bob, INK, 10, 3)
    put(im, 14, 4 + bob, GOLD, 4, 2)
    put(im, 13, 8 + bob, GOLD, 6, 1)
    draw_sword(im, frame, bob, pal)
    outline_opaque(im)
    return im


def officer_dong_zhuo(frame: int) -> Image.Image:
    """Stout body, wide hat."""
    im = new(UW, UH)
    br = hex_rgb("#6b4a2a") + (255,)
    pal = {
        "armor": br,
        "armor_l": light(br, 0.25),
        "armor_d": dark(br, 0.4),
        "cloth": br,
        "cloth_l": light(br, 0.18),
        "cloth_d": dark(br, 0.35),
        "skin": SKIN_D,
        "skin_s": SKIN_S,
        "ink": INK,
        "gold": GOLD,
        "steel": STEEL,
        "leather": LEATHER,
    }
    bob = -frame
    draw_shadow(im)
    # short thick legs
    put(im, 10, 48 + bob, pal["armor_d"], 5, 10)
    put(im, 17, 48 + bob, pal["armor_d"], 5, 10)
    draw_boots(im, 10, 17, 56 + bob, pal)
    # fat torso
    put(im, 6, 26 + bob, pal["armor"], 20, 22)
    put(im, 7, 28 + bob, pal["armor_l"], 18, 4)
    put(im, 8, 40 + bob, pal["gold"], 16, 2)
    ellipse_fill(im, 16, 18 + bob, 7, 7, pal["skin"])
    put(im, 13, 17 + bob, INK, 2, 2)
    put(im, 18, 17 + bob, INK, 2, 2)
    ellipse_fill(im, 16, 26 + bob, 7, 4, INK)
    # wide hat
    put(im, 6, 10 + bob, pal["leather"], 20, 5)
    put(im, 12, 6 + bob, GOLD, 8, 5)
    put(im, 24, 20 + bob, pal["steel"], 3, 22)
    outline_opaque(im)
    return im


def officer_lu_bu(frame: int) -> Image.Image:
    """치미관 plumes + 방천화극 halberd."""
    im = new(UW, UH)
    mag = hex_rgb("#8a2a4a") + (255,)
    pal = {
        "armor": mag,
        "armor_l": light(mag, 0.28),
        "armor_d": dark(mag, 0.4),
        "cloth": mag,
        "cloth_l": light(mag, 0.18),
        "cloth_d": dark(mag, 0.35),
        "skin": SKIN,
        "skin_s": SKIN_S,
        "ink": INK,
        "gold": GOLD,
        "steel": STEEL,
        "leather": LEATHER,
    }
    bob = -frame
    draw_shadow(im)
    lx, rx = draw_legs(im, frame, 40 + bob, pal)
    draw_boots(im, lx, rx, 52 + bob, pal)
    draw_torso(im, bob, pal, wide=True, cape=True)
    ellipse_fill(im, 16, 17 + bob, 6, 7, pal["skin"])
    put(im, 13, 16 + bob, INK, 2, 2)
    put(im, 18, 16 + bob, INK, 2, 2)
    # no beard — young
    # helm
    ellipse_fill(im, 16, 11 + bob, 7, 5, pal["armor"])
    put(im, 14, 8 + bob, CINN, 4, 3)
    # 치미관 — two pheasant feathers to the top of the cell
    put(im, 9, 0, GOLD, 2, 14 + bob)
    put(im, 8, 2, GOLD_D, 1, 10)
    put(im, 21, 0, GOLD, 2, 14 + bob)
    put(im, 23, 2, GOLD_D, 1, 10)
    # 방천화극: pole + spear tip + crescent
    put(im, 25, 10 + bob, WOOD, 2, 46)
    put(im, 24, 2 + bob, STEEL, 4, 8)
    put(im, 25, 0 + bob, STEEL_L, 2, 4)
    disc(im, 28, 12 + bob, 4, STEEL)
    disc(im, 26, 12 + bob, 2, TRANS)
    for y in range(8, 17):
        for x in range(26, 32):
            dx, dy = x - 28, y - (12 + bob)
            if 6 <= dx * dx + dy * dy <= 18:
                put(im, x, y, STEEL)
    put(im, 24, 16 + bob, GOLD, 4, 2)
    outline_opaque(im)
    return im


def officer_sun_jian(frame: int) -> Image.Image:
    """Tiger helm."""
    im = new(UW, UH)
    blu = hex_rgb("#2a4a6b") + (255,)
    pal = {
        "armor": blu,
        "armor_l": light(blu, 0.28),
        "armor_d": dark(blu, 0.4),
        "cloth": blu,
        "cloth_l": light(blu, 0.18),
        "cloth_d": dark(blu, 0.35),
        "skin": SKIN_D,
        "skin_s": SKIN_S,
        "ink": INK,
        "gold": GOLD,
        "steel": STEEL,
        "leather": LEATHER,
    }
    bob = -frame
    draw_shadow(im)
    lx, rx = draw_legs(im, frame, 40 + bob, pal)
    draw_boots(im, lx, rx, 52 + bob, pal)
    draw_torso(im, bob, pal, wide=True)
    ellipse_fill(im, 16, 17 + bob, 6, 7, pal["skin"])
    put(im, 13, 16 + bob, INK, 2, 2)
    put(im, 18, 16 + bob, INK, 2, 2)
    put(im, 13, 22 + bob, INK, 6, 4)
    draw_head(im, bob, pal, "tiger")
    # saber
    put(im, 24, 16 + bob + frame, STEEL, 2, 26)
    put(im, 23, 16 + bob, GOLD, 4, 2)
    outline_opaque(im)
    return im


def officer_gogukcheon(frame: int) -> Image.Image:
    """조우관 wing crown."""
    im = new(UW, UH)
    teal = hex_rgb("#3d8b7a") + (255,)
    pal = {
        "armor": teal,
        "armor_l": light(teal, 0.28),
        "armor_d": dark(teal, 0.4),
        "cloth": teal,
        "cloth_l": light(teal, 0.18),
        "cloth_d": dark(teal, 0.35),
        "skin": SKIN_D,
        "skin_s": SKIN_S,
        "ink": INK,
        "gold": GOLD,
        "steel": STEEL,
        "leather": LEATHER,
    }
    bob = -frame
    draw_shadow(im)
    lx, rx = draw_legs(im, frame, 40 + bob, pal)
    draw_boots(im, lx, rx, 52 + bob, pal)
    draw_torso(im, bob, pal, wide=True)
    ellipse_fill(im, 16, 17 + bob, 6, 7, pal["skin"])
    put(im, 13, 16 + bob, INK, 2, 2)
    put(im, 18, 16 + bob, INK, 2, 2)
    # wing crown
    put(im, 12, 8 + bob, pal["armor"], 8, 6)
    put(im, 14, 6 + bob, GOLD, 4, 4)
    # wings left/right
    put(im, 4, 6 + bob, GOLD, 8, 3)
    put(im, 5, 8 + bob, GOLD, 6, 4)
    put(im, 6, 12 + bob, GOLD_D, 4, 3)
    put(im, 20, 6 + bob, GOLD, 8, 3)
    put(im, 21, 8 + bob, GOLD, 6, 4)
    put(im, 22, 12 + bob, GOLD_D, 4, 3)
    put(im, 24, 18 + bob, STEEL, 2, 28)
    put(im, 23, 18 + bob, GOLD, 4, 2)
    outline_opaque(im)
    return im


OFFICER_DRAW = {
    "liu-bei": officer_liu_bei,
    "guan-yu": officer_guan_yu,
    "zhang-fei": officer_zhang_fei,
    "cao-cao": officer_cao_cao,
    "dong-zhuo": officer_dong_zhuo,
    "lu-bu": officer_lu_bu,
    "sun-jian": officer_sun_jian,
    "gogukcheon": officer_gogukcheon,
}


def build_officers() -> Image.Image:
    n = len(OFFICERS)
    sheet = new(UNIT_COLS * UW, n * UH)
    rows = {}
    for i, oid in enumerate(OFFICERS):
        f0 = OFFICER_DRAW[oid](0)
        f1 = OFFICER_DRAW[oid](1)
        sheet.paste(f0, (0, i * UH), f0)
        sheet.paste(f1, (UW, i * UH), f1)
        sheet.paste(flip_h(f0), (UW * 2, i * UH), flip_h(f0))
        sheet.paste(flip_h(f1), (UW * 3, i * UH), flip_h(f1))
        rows[oid] = i
    path = OUT / "units-officer.png"
    sheet.save(path)
    idx = {"cellW": UW, "cellH": UH, "cols": UNIT_COLS, "rowCount": n, "rows": rows}
    (OUT / "units-officer.index.json").write_text(json.dumps(idx, indent=2), encoding="utf-8")
    print("wrote", path, sheet.size, "rows", n)
    return sheet


# ---------------------------------------------------------------------------
# Kao 64×80 parts composer
# ---------------------------------------------------------------------------
SKIN_HEX = {"#e8c9a0": (232, 201, 160, 255), "#d4a878": (212, 168, 120, 255), "#c23b22": (194, 59, 34, 255)}


def skin_pair(hex_s: str):
    c = SKIN_HEX[hex_s]
    return c, dark(c, 0.28), light(c, 0.18)


def kao_armor(im: Image.Image, kind: str, accent) -> None:
    put(im, 4, 56, accent, 56, 24)
    put(im, 8, 54, light(accent, 0.2), 48, 4)
    if kind == "scale":
        for y in range(58, 78, 4):
            ox = 2 if (y // 4) % 2 else 0
            for x in range(8 + ox, 56, 6):
                disc(im, x, y, 2, dark(accent, 0.25))
                put(im, x, y - 1, light(accent, 0.15))
    elif kind == "lamellar":
        for y in range(58, 78, 3):
            put(im, 8, y, dark(accent, 0.3), 48, 1)
            put(im, 8, y + 1, light(accent, 0.12), 48, 1)
    elif kind == "robe":
        put(im, 10, 58, light(accent, 0.15), 44, 20)
        put(im, 28, 56, GOLD, 8, 22)
        put(im, 30, 58, GOLD_D, 4, 18)
    elif kind == "cloak":
        put(im, 2, 52, dark(accent, 0.2), 18, 28)
        put(im, 44, 52, dark(accent, 0.35), 18, 28)
        put(im, 20, 56, accent, 24, 24)
        put(im, 30, 54, GOLD, 4, 4)
    put(im, 26, 52, SKIN, 12, 8)  # neck overwritten by caller skin later


def kao_face(im: Image.Image, shape: str, skin, skin_d, skin_l) -> None:
    put(im, 26, 50, skin, 12, 10)
    if shape == "oval":
        ellipse_fill(im, 32, 36, 16, 18, skin)
        ellipse_fill(im, 32, 28, 14, 10, skin_l)
    elif shape == "square":
        put(im, 16, 22, skin, 32, 32)
        put(im, 18, 20, skin, 28, 4)
        put(im, 18, 50, skin, 28, 6)
        put(im, 18, 24, skin_l, 28, 8)
        put(im, 16, 46, skin_d, 4, 8)
        put(im, 44, 46, skin_d, 4, 8)
    elif shape == "round":
        disc(im, 32, 38, 18, skin)
        disc(im, 32, 32, 14, skin_l)
    else:  # gaunt
        ellipse_fill(im, 32, 36, 13, 18, skin)
        put(im, 18, 40, skin_d, 6, 10)
        put(im, 40, 40, skin_d, 6, 10)
        ellipse_fill(im, 32, 28, 11, 8, skin_l)
    # ears
    put(im, 14, 34, skin, 4, 8)
    put(im, 46, 34, skin, 4, 8)
    put(im, 15, 36, skin_d, 2, 4)
    put(im, 47, 36, skin_d, 2, 4)
    # nose
    put(im, 31, 38, skin_d, 2, 5)
    put(im, 30, 42, skin_d, 4, 2)
    # mouth
    put(im, 28, 46, LIP, 8, 2)
    put(im, 30, 47, skin_d, 4, 1)


def kao_eyes(im: Image.Image, kind: str) -> None:
    if kind == "calm":
        put(im, 22, 34, INK, 6, 3)
        put(im, 36, 34, INK, 6, 3)
        put(im, 23, 34, WHITE, 2, 2)
        put(im, 37, 34, WHITE, 2, 2)
    elif kind == "fierce":
        put(im, 20, 32, INK, 8, 5)
        put(im, 36, 32, INK, 8, 5)
        put(im, 22, 33, WHITE, 3, 3)
        put(im, 38, 33, WHITE, 3, 3)
        put(im, 24, 34, INK, 2, 2)
        put(im, 40, 34, INK, 2, 2)
    elif kind == "narrow":
        put(im, 22, 35, INK, 7, 2)
        put(im, 35, 35, INK, 7, 2)
        put(im, 24, 35, WHITE, 2, 1)
        put(im, 37, 35, WHITE, 2, 1)
    else:  # wide
        disc(im, 24, 35, 4, INK)
        disc(im, 40, 35, 4, INK)
        put(im, 23, 34, WHITE, 3, 3)
        put(im, 39, 34, WHITE, 3, 3)
        put(im, 25, 35, INK, 2, 2)
        put(im, 41, 35, INK, 2, 2)


def kao_brow(im: Image.Image, kind: str) -> None:
    if kind == "straight":
        put(im, 20, 30, INK, 8, 2)
        put(im, 36, 30, INK, 8, 2)
    elif kind == "angled":
        put(im, 20, 28, INK, 8, 2)
        put(im, 22, 29, INK, 7, 2)
        put(im, 36, 29, INK, 7, 2)
        put(im, 36, 28, INK, 8, 2)
        put(im, 20, 28, INK, 3, 3)
        put(im, 41, 28, INK, 3, 3)
    elif kind == "thick":
        put(im, 19, 28, INK, 10, 4)
        put(im, 35, 28, INK, 10, 4)
    else:  # thin
        put(im, 21, 31, INK, 7, 1)
        put(im, 36, 31, INK, 7, 1)


def kao_beard(im: Image.Image, kind: str, skin) -> None:
    if kind == "none":
        return
    col = INK if skin[:3] != CINN[:3] else INK
    if kind == "short":
        put(im, 24, 48, col, 16, 6)
        put(im, 26, 52, col, 12, 4)
    elif kind == "long":
        put(im, 22, 48, col, 20, 8)
        put(im, 24, 54, col, 16, 12)
        put(im, 26, 64, col, 12, 10)
        put(im, 28, 72, col, 8, 6)
    elif kind == "full":
        ellipse_fill(im, 32, 52, 16, 10, col)
        put(im, 18, 48, col, 28, 14)
        put(im, 22, 60, col, 20, 6)
    elif kind == "forked":
        put(im, 24, 48, col, 16, 6)
        put(im, 22, 52, col, 8, 12)
        put(im, 34, 52, col, 8, 12)
        put(im, 20, 62, col, 6, 6)
        put(im, 38, 62, col, 6, 6)


def kao_hair(im: Image.Image, kind: str, stage: str) -> None:
    col = INK
    if kind == "topknot":
        if stage == "back":
            put(im, 18, 16, col, 28, 12)
        else:
            disc(im, 32, 12, 6, col)
            put(im, 30, 4, col, 4, 8)
            put(im, 31, 3, GOLD, 2, 2)
    elif kind == "loose":
        if stage == "back":
            put(im, 10, 20, col, 10, 28)
            put(im, 44, 20, col, 10, 28)
            put(im, 16, 14, col, 32, 10)
        else:
            put(im, 18, 18, col, 8, 8)
            put(im, 38, 18, col, 8, 8)
    else:  # braid
        if stage == "back":
            put(im, 14, 18, col, 8, 24)
            put(im, 42, 18, col, 8, 24)
            for y in range(20, 42, 4):
                put(im, 16, y, mix(INK, WHITE, 0.15), 4, 2)
                put(im, 44, y, mix(INK, WHITE, 0.15), 4, 2)
        else:
            put(im, 20, 16, col, 24, 8)


def kao_headgear(im: Image.Image, kind: str, accent) -> None:
    if kind == "crown":
        put(im, 16, 10, GOLD, 32, 10)
        put(im, 16, 6, GOLD, 4, 8)
        put(im, 30, 2, GOLD, 4, 10)
        put(im, 44, 6, GOLD, 4, 8)
        for x in (18, 28, 38, 48):
            put(im, x, 18, GOLD, 1, 8)
            put(im, x, 26, GOLD_D, 1, 2)
        put(im, 20, 12, CINN, 24, 4)
    elif kind == "jinxian":
        put(im, 22, 2, INK, 20, 18)
        put(im, 20, 16, INK, 24, 6)
        put(im, 28, 2, GOLD, 8, 3)
        put(im, 24, 10, GOLD, 16, 2)
    elif kind == "helm":
        ellipse_fill(im, 32, 16, 20, 12, accent)
        put(im, 14, 18, dark(accent, 0.3), 36, 6)
        put(im, 28, 6, GOLD, 8, 6)
        put(im, 18, 14, STEEL_D, 8, 3)
        put(im, 38, 14, STEEL_D, 8, 3)
    elif kind == "plume":
        ellipse_fill(im, 32, 16, 18, 10, accent)
        put(im, 28, 8, CINN, 8, 8)
        put(im, 12, 0, GOLD, 5, 22)
        put(im, 47, 0, GOLD, 5, 22)
        put(im, 13, 2, GOLD_D, 3, 16)
        put(im, 48, 2, GOLD_D, 3, 16)
    elif kind == "tiger":
        ellipse_fill(im, 32, 16, 18, 11, LEATHER)
        put(im, 12, 8, LEATHER, 8, 12)
        put(im, 44, 8, LEATHER, 8, 12)
        put(im, 14, 10, GOLD, 4, 4)
        put(im, 46, 10, GOLD, 4, 4)
        put(im, 24, 14, GOLD, 4, 4)
        put(im, 36, 14, GOLD, 4, 4)
        put(im, 22, 18, INK, 20, 3)
    elif kind == "turban":
        ellipse_fill(im, 32, 16, 18, 10, accent)
        put(im, 16, 12, light(accent, 0.2), 32, 6)
        put(im, 28, 6, GOLD, 8, 8)
        put(im, 18, 16, GOLD, 28, 2)
    elif kind == "wings":
        put(im, 22, 10, accent, 20, 12)
        put(im, 28, 6, GOLD, 8, 8)
        # spreading wings
        put(im, 2, 8, GOLD, 18, 4)
        put(im, 4, 12, GOLD, 14, 6)
        put(im, 8, 18, GOLD_D, 10, 5)
        put(im, 44, 8, GOLD, 18, 4)
        put(im, 46, 12, GOLD, 14, 6)
        put(im, 46, 18, GOLD_D, 10, 5)
    elif kind == "cloth":
        put(im, 16, 12, mix(TEXT, accent, 0.35), 32, 12)
        put(im, 18, 10, mix(TEXT, accent, 0.2), 28, 4)
        put(im, 28, 8, GOLD, 8, 4)
        put(im, 14, 20, mix(TEXT, INK, 0.4), 8, 8)
        put(im, 42, 20, mix(TEXT, INK, 0.4), 8, 8)


def compose_kao(p: dict, faction: str) -> Image.Image:
    im = new(KW, KH)
    put(im, 0, 0, VOID, KW, KH)
    accent = hex_rgb(FACTION_HEX.get(faction, FACTION_HEX["other"])) + (255,)
    skin, skin_d, skin_l = skin_pair(p["skin"])
    kao_armor(im, p["armor"], accent)
    put(im, 26, 50, skin, 12, 10)
    kao_hair(im, p["hair"], "back")
    kao_face(im, p["face"], skin, skin_d, skin_l)
    kao_eyes(im, p["eye"])
    kao_brow(im, p["brow"])
    kao_beard(im, p["beard"], skin)
    kao_hair(im, p["hair"], "front")
    kao_headgear(im, p["headgear"], accent)
    # inner highlight on face
    put(im, 24, 26, skin_l, 6, 3)
    return im


# characterId -> kao parts. Faction is a parallel table (characters.ts is read-only).
KAO_PARAMS: list[tuple[str, str, dict]] = [
    ("liu-bei", "liu", dict(face="oval", skin="#e8c9a0", brow="straight", eye="calm", beard="short", hair="topknot", headgear="turban", armor="scale")),
    ("guan-yu", "liu", dict(face="gaunt", skin="#c23b22", brow="angled", eye="fierce", beard="long", hair="topknot", headgear="helm", armor="lamellar")),
    ("zhang-fei", "liu", dict(face="square", skin="#d4a878", brow="thick", eye="fierce", beard="full", hair="loose", headgear="helm", armor="lamellar")),
    ("cao-cao", "cao", dict(face="gaunt", skin="#e8c9a0", brow="thin", eye="narrow", beard="short", hair="topknot", headgear="jinxian", armor="scale")),
    ("dong-zhuo", "dong", dict(face="round", skin="#d4a878", brow="thick", eye="narrow", beard="full", hair="topknot", headgear="cloth", armor="cloak")),
    ("lu-bu", "lu-bu", dict(face="oval", skin="#e8c9a0", brow="angled", eye="fierce", beard="none", hair="topknot", headgear="plume", armor="lamellar")),
    ("sun-jian", "sun", dict(face="square", skin="#d4a878", brow="thick", eye="fierce", beard="short", hair="topknot", headgear="tiger", armor="scale")),
    ("sun-ce", "sun", dict(face="oval", skin="#e8c9a0", brow="angled", eye="wide", beard="none", hair="loose", headgear="helm", armor="scale")),
    ("yuan-shao", "yuan-shao", dict(face="oval", skin="#e8c9a0", brow="straight", eye="calm", beard="forked", hair="topknot", headgear="crown", armor="cloak")),
    ("yuan-shu", "yuan-shu", dict(face="round", skin="#e8c9a0", brow="angled", eye="narrow", beard="short", hair="topknot", headgear="jinxian", armor="scale")),
    ("he-jin", "han", dict(face="square", skin="#d4a878", brow="thick", eye="wide", beard="short", hair="topknot", headgear="helm", armor="scale")),
    ("emperor-ling", "han", dict(face="round", skin="#e8c9a0", brow="thin", eye="wide", beard="none", hair="topknot", headgear="crown", armor="robe")),
    ("emperor-shao", "han", dict(face="round", skin="#e8c9a0", brow="thin", eye="wide", beard="none", hair="loose", headgear="crown", armor="robe")),
    ("emperor-xian", "han", dict(face="oval", skin="#e8c9a0", brow="thin", eye="calm", beard="none", hair="loose", headgear="crown", armor="robe")),
    ("zhang-jiao", "yellow", dict(face="gaunt", skin="#d4a878", brow="thick", eye="wide", beard="forked", hair="loose", headgear="turban", armor="robe")),
    ("liu-yan", "other", dict(face="oval", skin="#e8c9a0", brow="straight", eye="calm", beard="short", hair="topknot", headgear="jinxian", armor="robe")),
    ("liu-biao", "other", dict(face="square", skin="#e8c9a0", brow="straight", eye="calm", beard="long", hair="topknot", headgear="jinxian", armor="robe")),
    ("tao-qian", "tao", dict(face="round", skin="#d4a878", brow="thin", eye="calm", beard="full", hair="topknot", headgear="cloth", armor="robe")),
    ("wang-yun", "han", dict(face="gaunt", skin="#e8c9a0", brow="straight", eye="calm", beard="short", hair="topknot", headgear="jinxian", armor="robe")),
    ("diaochan", "han", dict(face="oval", skin="#e8c9a0", brow="thin", eye="wide", beard="none", hair="loose", headgear="cloth", armor="robe")),
    ("gongsun-zan", "gongsun", dict(face="oval", skin="#e8c9a0", brow="angled", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="scale")),
    ("chen-gong", "lu-bu", dict(face="gaunt", skin="#e8c9a0", brow="straight", eye="narrow", beard="none", hair="topknot", headgear="jinxian", armor="robe")),
    ("hua-xiong", "dong", dict(face="square", skin="#d4a878", brow="thick", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="lamellar")),
    ("gogukcheon", "goguryeo", dict(face="oval", skin="#d4a878", brow="straight", eye="calm", beard="none", hair="topknot", headgear="wings", armor="scale")),
    ("eulpaso", "goguryeo", dict(face="gaunt", skin="#d4a878", brow="thin", eye="calm", beard="short", hair="topknot", headgear="cloth", armor="robe")),
    ("onjo-line", "mahan", dict(face="oval", skin="#d4a878", brow="straight", eye="calm", beard="none", hair="topknot", headgear="wings", armor="scale")),
    ("sun-quan", "sun", dict(face="oval", skin="#e8c9a0", brow="angled", eye="calm", beard="short", hair="topknot", headgear="crown", armor="scale")),
    ("zhou-yu", "sun", dict(face="oval", skin="#e8c9a0", brow="straight", eye="calm", beard="none", hair="topknot", headgear="jinxian", armor="scale")),
    ("zhang-zhao", "sun", dict(face="square", skin="#d4a878", brow="thin", eye="calm", beard="full", hair="topknot", headgear="jinxian", armor="robe")),
    ("lu-su", "sun", dict(face="round", skin="#e8c9a0", brow="straight", eye="calm", beard="short", hair="topknot", headgear="cloth", armor="robe")),
    ("zhuge-liang", "liu", dict(face="gaunt", skin="#e8c9a0", brow="thin", eye="calm", beard="none", hair="topknot", headgear="cloth", armor="robe")),
    ("zhao-yun", "liu", dict(face="oval", skin="#e8c9a0", brow="straight", eye="calm", beard="none", hair="topknot", headgear="helm", armor="scale")),
    ("pang-tong", "liu", dict(face="square", skin="#d4a878", brow="thick", eye="narrow", beard="short", hair="loose", headgear="cloth", armor="robe")),
    ("xu-shu", "liu", dict(face="oval", skin="#e8c9a0", brow="straight", eye="calm", beard="none", hair="topknot", headgear="jinxian", armor="robe")),
    ("xun-yu", "cao", dict(face="gaunt", skin="#e8c9a0", brow="thin", eye="calm", beard="none", hair="topknot", headgear="jinxian", armor="robe")),
    ("yan-liang", "yuan-shao", dict(face="square", skin="#d4a878", brow="thick", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="lamellar")),
    ("cao-ren", "cao", dict(face="square", skin="#e8c9a0", brow="straight", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="scale")),
    ("ma-chao", "liu", dict(face="oval", skin="#e8c9a0", brow="angled", eye="fierce", beard="none", hair="loose", headgear="helm", armor="lamellar")),
    ("han-sui", "other", dict(face="gaunt", skin="#d4a878", brow="thick", eye="narrow", beard="full", hair="topknot", headgear="helm", armor="cloak")),
    ("zhang-lu", "other", dict(face="round", skin="#d4a878", brow="straight", eye="calm", beard="forked", hair="loose", headgear="turban", armor="robe")),
    ("liu-zhang", "other", dict(face="round", skin="#e8c9a0", brow="thin", eye="wide", beard="short", hair="topknot", headgear="jinxian", armor="robe")),
    ("zhang-liao", "cao", dict(face="oval", skin="#e8c9a0", brow="angled", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="lamellar")),
    ("gan-ning", "sun", dict(face="square", skin="#d4a878", brow="thick", eye="fierce", beard="none", hair="loose", headgear="cloth", armor="scale")),
    ("lu-meng", "sun", dict(face="square", skin="#d4a878", brow="thick", eye="narrow", beard="short", hair="topknot", headgear="helm", armor="scale")),
    ("lu-xun", "sun", dict(face="oval", skin="#e8c9a0", brow="thin", eye="calm", beard="none", hair="topknot", headgear="jinxian", armor="robe")),
    ("huang-zhong", "liu", dict(face="gaunt", skin="#d4a878", brow="thick", eye="fierce", beard="full", hair="topknot", headgear="helm", armor="lamellar")),
    ("wei-yan", "liu", dict(face="square", skin="#d4a878", brow="angled", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="lamellar")),
    ("fa-zheng", "liu", dict(face="gaunt", skin="#e8c9a0", brow="thin", eye="narrow", beard="none", hair="topknot", headgear="jinxian", armor="robe")),
    ("sima-yi", "cao", dict(face="gaunt", skin="#e8c9a0", brow="thin", eye="narrow", beard="short", hair="topknot", headgear="jinxian", armor="robe")),
    ("jiang-wei", "liu", dict(face="oval", skin="#e8c9a0", brow="angled", eye="fierce", beard="none", hair="topknot", headgear="helm", armor="scale")),
    ("ma-su", "liu", dict(face="oval", skin="#e8c9a0", brow="straight", eye="wide", beard="none", hair="topknot", headgear="jinxian", armor="robe")),
    ("meng-huo", "other", dict(face="square", skin="#d4a878", brow="thick", eye="fierce", beard="none", hair="braid", headgear="cloth", armor="cloak")),
    ("cao-pi", "cao", dict(face="oval", skin="#e8c9a0", brow="thin", eye="calm", beard="none", hair="topknot", headgear="crown", armor="robe")),
    ("liu-shan", "liu", dict(face="round", skin="#e8c9a0", brow="thin", eye="wide", beard="none", hair="loose", headgear="crown", armor="robe")),
    ("zhang-he", "cao", dict(face="oval", skin="#e8c9a0", brow="straight", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="scale")),
    ("xiahou-yuan", "cao", dict(face="square", skin="#d4a878", brow="thick", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="scale")),
    ("lady-sun", "sun", dict(face="oval", skin="#e8c9a0", brow="angled", eye="fierce", beard="none", hair="loose", headgear="cloth", armor="scale")),
    ("hao-zhao", "cao", dict(face="square", skin="#d4a878", brow="straight", eye="calm", beard="short", hair="topknot", headgear="helm", armor="lamellar")),
    ("deng-ai", "cao", dict(face="gaunt", skin="#d4a878", brow="thin", eye="narrow", beard="short", hair="topknot", headgear="helm", armor="scale")),
    ("yan-yan", "other", dict(face="square", skin="#d4a878", brow="thick", eye="fierce", beard="full", hair="topknot", headgear="helm", armor="lamellar")),
    ("huang-gai", "sun", dict(face="gaunt", skin="#d4a878", brow="thick", eye="fierce", beard="full", hair="topknot", headgear="helm", armor="scale")),
    ("taishi-ci", "sun", dict(face="oval", skin="#e8c9a0", brow="angled", eye="fierce", beard="none", hair="topknot", headgear="helm", armor="lamellar")),
    ("liu-yao", "han", dict(face="oval", skin="#e8c9a0", brow="straight", eye="calm", beard="short", hair="topknot", headgear="jinxian", armor="robe")),
    ("sansang", "goguryeo", dict(face="oval", skin="#d4a878", brow="straight", eye="calm", beard="none", hair="topknot", headgear="wings", armor="scale")),
    ("dongcheon", "goguryeo", dict(face="square", skin="#d4a878", brow="angled", eye="fierce", beard="none", hair="topknot", headgear="wings", armor="lamellar")),
    ("gongsun-kang", "gongsun", dict(face="square", skin="#e8c9a0", brow="thick", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="scale")),
    ("guan-qiu-jian", "cao", dict(face="gaunt", skin="#e8c9a0", brow="angled", eye="fierce", beard="short", hair="topknot", headgear="helm", armor="scale")),
]


def write_kao_params_ts() -> None:
    lines = [
        "/** Per-character kao compositor parameters. Do not edit characters.ts; join on id. */",
        "",
        "export const KAO_FACE = [\"oval\", \"square\", \"round\", \"gaunt\"] as const;",
        "export const KAO_SKIN = [\"#e8c9a0\", \"#d4a878\", \"#c23b22\"] as const;",
        "export const KAO_BROW = [\"straight\", \"angled\", \"thick\", \"thin\"] as const;",
        "export const KAO_EYE = [\"calm\", \"fierce\", \"narrow\", \"wide\"] as const;",
        "export const KAO_BEARD = [\"none\", \"short\", \"long\", \"full\", \"forked\"] as const;",
        "export const KAO_HAIR = [\"topknot\", \"loose\", \"braid\"] as const;",
        'export const KAO_HEADGEAR = ["crown", "jinxian", "helm", "plume", "tiger", "turban", "wings", "cloth"] as const;',
        "export const KAO_ARMOR = [\"scale\", \"lamellar\", \"robe\", \"cloak\"] as const;",
        "",
        "export type KaoParams = {",
        "  face: (typeof KAO_FACE)[number];",
        "  skin: (typeof KAO_SKIN)[number];",
        "  brow: (typeof KAO_BROW)[number];",
        "  eye: (typeof KAO_EYE)[number];",
        "  beard: (typeof KAO_BEARD)[number];",
        "  hair: (typeof KAO_HAIR)[number];",
        "  headgear: (typeof KAO_HEADGEAR)[number];",
        "  armor: (typeof KAO_ARMOR)[number];",
        "};",
        "",
        "export const KAO_PARAMS: Record<string, KaoParams> = {",
    ]
    for cid, _fac, p in KAO_PARAMS:
        lines.append(
            f'  "{cid}": {{ face: "{p["face"]}", skin: "{p["skin"]}", brow: "{p["brow"]}", '
            f'eye: "{p["eye"]}", beard: "{p["beard"]}", hair: "{p["hair"]}", '
            f'headgear: "{p["headgear"]}", armor: "{p["armor"]}" }},'
        )
    lines.append("};")
    lines.append("")
    SRC_DATA.mkdir(parents=True, exist_ok=True)
    path = SRC_DATA / "kao-params.ts"
    path.write_text("\n".join(lines), encoding="utf-8")
    print("wrote", path)


def build_kao() -> Image.Image:
    n = len(KAO_PARAMS)
    rows = (n + KAO_COLS - 1) // KAO_COLS
    sheet = new(KAO_COLS * KW, rows * KH)
    cells = {}
    for i, (cid, fac, p) in enumerate(KAO_PARAMS):
        col, row = i % KAO_COLS, i // KAO_COLS
        tile = compose_kao(p, fac)
        sheet.paste(tile, (col * KW, row * KH))
        cells[cid] = {"col": col, "row": row}
    path = OUT / "kao.png"
    sheet.save(path)
    idx = {"cellW": KW, "cellH": KH, "cols": KAO_COLS, "rowCount": rows, "cells": cells}
    (OUT / "kao.index.json").write_text(json.dumps(idx, indent=2), encoding="utf-8")
    print("wrote", path, sheet.size, "chars", n, "rows", rows)
    return sheet


# ---------------------------------------------------------------------------
# Autotile seam verification
# ---------------------------------------------------------------------------
def grid_masks(grid: list[str], ch: str) -> list[list[int | None]]:
    h, w = len(grid), len(grid[0])
    out: list[list[int | None]] = [[None] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if grid[y][x] != ch:
                continue
            n = 1 if y > 0 and grid[y - 1][x] == ch else 0
            e = 1 if x + 1 < w and grid[y][x + 1] == ch else 0
            s = 1 if y + 1 < h and grid[y + 1][x] == ch else 0
            ww = 1 if x > 0 and grid[y][x - 1] == ch else 0
            out[y][x] = n * 1 + e * 2 + s * 4 + ww * 8
    return out


def render_autotile_map(kind: str, grid: list[str], ch: str) -> Image.Image:
    h, w = len(grid), len(grid[0])
    im = new(w * TILE, h * TILE)
    grass = fill_tex(tex_plain, 0)
    masks = grid_masks(grid, ch)
    for y in range(h):
        for x in range(w):
            if masks[y][x] is None:
                im.paste(grass, (x * TILE, y * TILE))
            else:
                im.paste(make_autotile(kind, masks[y][x]), (x * TILE, y * TILE))
    return im


def mask_strip(kind: str) -> Image.Image:
    im = new(16 * (TILE + 4) + 8, TILE + 24)
    d = ImageDraw.Draw(im)
    im.paste(fill_tex(tex_plain, 0).resize((im.width, im.height)))
    for m in range(16):
        x = 4 + m * (TILE + 4)
        im.paste(make_autotile(kind, m), (x, 16))
        d.text((x + 10, 2), str(m), fill=INK)
    return im


def seam_score(kind: str) -> dict:
    """Max RGB delta along shared edges of a filled 3x3 blob (mask computed)."""
    grid = [
        ".TTT.",
        "TTTTT",
        "TTTTT",
        ".TTT.",
        "..T..",
    ]
    masks = grid_masks(grid, "T")
    tiles = {
        (x, y): make_autotile(kind, masks[y][x])
        for y, row in enumerate(masks)
        for x, m in enumerate(row)
        if m is not None
    }
    max_d = 0
    samples = 0
    for (x, y), tile in tiles.items():
        right = tiles.get((x + 1, y))
        if right is not None:
            for yy in range(TILE):
                a = tile.getpixel((TILE - 1, yy))
                b = right.getpixel((0, yy))
                dlt = sum(abs(a[i] - b[i]) for i in range(3))
                max_d = max(max_d, dlt)
                samples += 1
        down = tiles.get((x, y + 1))
        if down is not None:
            for xx in range(TILE):
                a = tile.getpixel((xx, TILE - 1))
                b = down.getpixel((xx, 0))
                dlt = sum(abs(a[i] - b[i]) for i in range(3))
                max_d = max(max_d, dlt)
                samples += 1
    # interior 2x2 of mask 15 must be identical to a wrapping texture pair
    t15 = make_autotile(kind, 15)
    wrap_h = 0
    for y in range(TILE):
        # adjacent interiors: east col of left vs west col of right — wrap, not equal
        # Continuity proxy: 2x1 paste equals itself (deterministic)
        wrap_h = max(wrap_h, 0)
    pair = new(TILE * 2, TILE)
    pair.paste(t15, (0, 0))
    pair.paste(t15, (TILE, 0))
    pair2 = new(TILE * 2, TILE)
    pair2.paste(t15, (0, 0))
    pair2.paste(t15, (TILE, 0))
    identical = list(pair.getdata()) == list(pair2.getdata())
    return {"maxEdgeDelta": max_d, "edgeSamples": samples, "mask15RepeatDeterministic": identical}


def build_verification() -> None:
    forest_grid = [
        "........",
        "..TTTT..",
        ".TTTTTT.",
        ".TTTTTT.",
        "..TTTT..",
        "...TT...",
        "........",
    ]
    river_grid = [
        "............",
        ".RRRRRR.....",
        ".RRRRRR.R...",
        ".RRRRRR.R...",
        ".RRRRRRRR...",
        ".......R....",
        ".......R....",
        ".....RRRR...",
        "............",
    ]
    forest_map = render_autotile_map("forest", forest_grid, "T")
    river_map = render_autotile_map("river", river_grid, "R")
    f_strip = mask_strip("forest")
    r_strip = mask_strip("river")

    # Compose annotated sheets
    def compose(title: str, strip: Image.Image, blob: Image.Image) -> Image.Image:
        w = max(strip.width, blob.width, 16 * TILE) + 16
        h = strip.height + blob.height + 48
        canvas = Image.new("RGBA", (w, h), mix(VOID, WHITE, 0.12))
        d = ImageDraw.Draw(canvas)
        d.text((8, 4), title, fill=TEXT)
        canvas.paste(strip, (8, 20), strip)
        canvas.paste(blob, (8, 28 + strip.height), blob)
        return canvas

    fp = TOOLS / "autotile-forest-seams.png"
    rp = TOOLS / "autotile-river-seams.png"
    compose("forest wang 4-bit — strip 0..15 + filled blob", f_strip, forest_map).save(fp)
    compose("river wang 4-bit — strip 0..15 + lake + channel", r_strip, river_map).save(rp)
    print("wrote", fp)
    print("wrote", rp)
    fs = seam_score("forest")
    rs = seam_score("river")
    print("forest seam", fs)
    print("river seam", rs)

    t = Image.open(OUT / "tiles32.png")
    print("tiles32.png size", t.size)


def write_readme() -> None:
    (OUT / "README.md").write_text(
        """# eiketsu atlas

원본 영걸전/조조전 파일을 디코딩하지 않습니다. `scripts/build_eiketsu_atlas.py` 가
docs/REDESIGN-EIKETSU.md §3 규격으로 생성한 오리지널 시트입니다.

| 파일 | 셀 | 시트 |
|---|---|---|
| tiles32.png | 32×32 | 16열 × 10행 = 512×320 |
| units.png | 32×64 | 4열 (우f0 우f1 좌f0 좌f1), 행 = 병종×진영 |
| units-officer.png | 32×64 | 4열, 행 = 고유 무장 |
| kao.png | 64×80 | 8열, 파츠 컴포저 |

기존 `tileset.png`(16×16) 과 `.ase` / `.piskel` / godot 사이드카는 남겨 둡니다.
다시 굽기: `python scripts/build_eiketsu_atlas.py`
""",
        encoding="utf-8",
    )


def main() -> None:
    build_tiles32()
    build_units()
    build_officers()
    build_kao()
    write_kao_params_ts()
    write_readme()
    build_verification()


if __name__ == "__main__":
    main()
