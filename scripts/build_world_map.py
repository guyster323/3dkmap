#!/usr/bin/env python3
"""Compose one ¾ world map + city landmarks + matching banners. Original pixels."""
from __future__ import annotations

import re
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
TS = ROOT / "src" / "data" / "terrain" / "strategic-terrain.ts"
OUT = ROOT / "public" / "assets" / "pixel-times" / "terrain"
BANNER = ROOT / "public" / "assets" / "pixel-times" / "event-banners"
BG = ROOT / "public" / "assets" / "pixel-times" / "scene-backgrounds"
OUT.mkdir(parents=True, exist_ok=True)

TILE = 16
INK = (10, 18, 38, 255)
SEA = (28, 58, 92, 255)
SEA2 = (40, 78, 112, 255)
FOAM = (168, 196, 210, 255)
PLAIN = (108, 124, 72, 255)
PLAIN2 = (124, 138, 86, 255)
GRASS = (62, 96, 54, 255)
GRASS2 = (78, 114, 64, 255)
FIELD = (128, 118, 62, 255)
WASTE = (148, 124, 88, 255)
FOREST = (32, 62, 36, 255)
FOREST2 = (52, 88, 48, 255)
HILL = (132, 112, 76, 255)
MOUNT = (118, 110, 98, 255)
MOUNT2 = (86, 80, 70, 255)
RIVER = (48, 86, 112, 255)
ROAD = (156, 132, 94, 255)

KIND = {
    ".": "plain",
    ",": "grass",
    "=": "field",
    "_": "waste",
    "T": "forest",
    "n": "hill",
    "A": "mountain",
    "~": "river",
    "s": "sea",
    "-": "road",
    "+": "bridge",
    "#": "wall",
}


def parse_grid() -> list[str]:
    text = TS.read_text(encoding="utf-8")
    rows = re.findall(r'^\s+"([^"]+)",', text, re.M)
    rows = [r for r in rows if len(r) >= 32]
    if len(rows) < 22:
        raise SystemExit(f"grid parse failed: {len(rows)}")
    return rows


def h(c: int, r: int, k: int = 0) -> int:
    return (c * 73 + r * 149 + k * 19) & 255


def put(px, x, y, color, w, h):
    if x < 0 or y < 0 or x >= w or y >= h:
        return
    px[x, y] = color


def jitter(grid: list[str]) -> list[list[str]]:
    rows, cols = len(grid), len(grid[0])
    g = [list(row) for row in grid]
    for r in range(rows):
        for c in range(cols):
            nbs = []
            for dc, dr in ((0, -1), (1, 0), (0, 1), (-1, 0)):
                rr, cc = r + dr, c + dc
                if 0 <= rr < rows and 0 <= cc < cols:
                    nbs.append(g[rr][cc])
            if not nbs:
                continue
            roll = h(c, r, 7)
            if roll < 70:
                g[r][c] = nbs[roll % len(nbs)]
            if grid[r][c] == "s" and roll < 40:
                g[r][c] = "s"
    return g


def ell(lon: float, lat: float, cx: float, cy: float, rx: float, ry: float) -> bool:
    wobble = (h(int(lon * 22), int(lat * 22), 11) - 128) / 128.0 * 0.22
    return ((lon - cx) / rx) ** 2 + ((lat - cy) / ry) ** 2 <= 1.0 + wobble


def land_kind(lon: float, lat: float) -> str:
    """Soft original landmask (ellipses). Not a survey."""
    if ell(lon, lat, 127.05, 37.35, 2.35, 5.1):
        if ell(lon, lat, 124.9, 37.6, 1.35, 2.0) and not ell(lon, lat, 126.4, 37.4, 0.95, 1.7):
            return "sea"
        return "hill" if lon > 128.1 else "grass"
    if ell(lon, lat, 121.05, 36.85, 2.05, 1.18):
        return "grass"
    if ell(lon, lat, 122.15, 37.05, 2.15, 2.55):
        return "sea"
    if ell(lon, lat, 123.85, 34.05, 3.15, 2.85):
        return "sea"
    if ell(lon, lat, 121.05, 24.05, 1.05, 1.45):
        return "mountain"
    if lon > 122.0 and lat < 32.2:
        return "sea"
    if lat < 21.4 or (lat < 23.2 and lon > 113.8):
        return "sea"
    import math

    west = 103.4 + 1.1 * math.sin((lat - 30) * 0.31)
    if lon < west:
        return "mountain" if lat > 27.2 + 0.4 * math.sin(lon) else "forest"
    if lat > 41.2 + 0.5 * math.sin(lon * 0.4):
        return "waste"
    if lat < 25.8 + 0.9 * math.sin((lon - 108) * 0.45) and lon < 117.8:
        return "forest"
    if ell(lon, lat, 105.6, 30.35, 2.25, 1.65):
        return "field"
    import math

    yz = 30.55 + 0.38 * math.sin((lon - 108.0) * 0.72)
    if abs(lat - yz) < 0.42 and 106.2 < lon < 121.2:
        return "river"
    return "plain"


def paint_map(grid: list[str]) -> Image.Image:
    cells = jitter(grid)
    rows, cols = len(cells), len(cells[0])
    W, H = cols * TILE, rows * TILE
    im = Image.new("RGBA", (W, H), SEA)
    px = im.load()

    def kind_cell(c, r):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return "sea"
        return KIND.get(cells[r][c], "plain")

    # Pixel landmask first (breaks 2x upsample rectangles).
    for y in range(H):
        for x in range(W):
            lon = 100.0 + (x + 0.5) / W * 32.0
            lat = 44.0 - (y + 0.5) / H * 23.0
            k = land_kind(lon, lat)
            n = h(x // 3, y // 3, x + y)
            col = {
                "plain": PLAIN2 if n > 200 else PLAIN,
                "grass": GRASS2 if n > 180 else GRASS,
                "field": FIELD,
                "waste": WASTE,
                "forest": FOREST2 if n > 150 else FOREST,
                "hill": HILL,
                "mountain": MOUNT2 if (y % 16) > 9 else MOUNT,
                "river": RIVER,
                "sea": SEA2 if (y + n) % 7 == 0 else SEA,
            }[k]
            if (x % 8) + (y % 8) < 3:
                col = tuple(min(255, v + 8) for v in col[:3]) + (255,)
            px[x, y] = col

    # Pixel-edge foam (not cell-snapped)
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if px[x, y][:3] != SEA[:3] and px[x, y][:3] != SEA2[:3]:
                continue
            nbs = (px[x - 1, y], px[x + 1, y], px[x, y - 1], px[x, y + 1])
            if any(p[:3] not in (SEA[:3], SEA2[:3], FOAM[:3]) for p in nbs):
                if h(x, y, 3) > 80:
                    px[x, y] = FOAM

    def kind(c, r):
        lon = 100.0 + (c + 0.5) / cols * 32.0
        lat = 44.0 - (r + 0.5) / rows * 23.0
        return land_kind(lon, lat)

    # Coast foam
    for r in range(rows):
        for c in range(cols):
            if kind(c, r) != "sea":
                continue
            land = any(kind(c + dc, r + dr) != "sea" for dc, dr in ((0, -1), (1, 0), (0, 1), (-1, 0)))
            if not land:
                continue
            for dx in range(TILE):
                x, y = c * TILE + dx, r * TILE + 2 + (h(c, r, dx) % 3)
                if 0 <= y < H:
                    px[x, y] = FOAM

    # Tree crowns (multi-pixel, not one-per-cell squares)
    d = ImageDraw.Draw(im)
    for r in range(rows):
        for c in range(cols):
            if kind(c, r) not in ("forest", "grass"):
                continue
            if kind(c, r) == "grass" and h(c, r, 3) > 50:
                continue
            ox, oy = c * TILE + (h(c, r, 1) % 5) - 2, r * TILE + (h(c, r, 2) % 4) - 1
            for i, (dx, dy) in enumerate(((3, 4), (9, 2), (6, 9), (12, 8))):
                if h(c, r, i) < 50 and kind(c, r) == "forest":
                    continue
                d.ellipse((ox + dx, oy + dy, ox + dx + 7, oy + dy + 5), fill=FOREST2)
                d.point((ox + dx + 2, oy + dy + 5), fill=(70, 52, 32, 255))

    # Mountain peaks spanning a cell
    for r in range(rows):
        for c in range(cols):
            if kind(c, r) != "mountain":
                continue
            if h(c, r, 9) < 80:
                continue
            ox = c * TILE + (h(c, r, 4) % 6) - 2
            oy = r * TILE + (h(c, r, 5) % 4) - 2
            peak = 2 + (h(c, r, 6) % 5)
            d.polygon(
                [(ox + 1, oy + 15), (ox + 8, oy + peak), (ox + 15, oy + 15)],
                fill=MOUNT2,
            )
            d.polygon(
                [(ox + 1, oy + 15), (ox + 8, oy + peak), (ox + 8, oy + 15)],
                fill=(150, 142, 128, 255),
            )
            d.point((ox + 8, oy + peak), fill=(210, 208, 200, 255))

    return im


def chroma_key(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and r >= 140 and b >= 140 and g < min(r, b) * 0.85 and g <= 200:
                px[x, y] = (0, 0, 0, 0)
    return im


def fit(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    keyed = chroma_key(im)
    box = keyed.getchannel("A").getbbox()
    if not box:
        return keyed.resize(size, Image.Resampling.NEAREST)
    crop = keyed.crop(box)
    tw, th = size
    scale = min(tw / crop.width, th / crop.height)
    nw, nh = max(1, int(crop.width * scale)), max(1, int(crop.height * scale))
    scaled = crop.resize((nw, nh), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.paste(scaled, ((tw - nw) // 2, th - nh), scaled)
    return canvas


def city(kind: str) -> Image.Image:
    sizes = {"village": (24, 20), "county": (40, 32), "major": (56, 44), "capital": (80, 64), "pass": (40, 36)}
    w, h = sizes[kind]
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    wall = (96, 78, 58, 255)
    wall_d = (64, 50, 38, 255)
    roof = (176, 52, 40, 255)
    gold = (212, 170, 64, 255)
    if kind == "village":
        d.polygon([(2, 12), (8, 4), (14, 12)], fill=roof)
        d.rectangle((3, 12, 13, 18), fill=wall)
        d.polygon([(11, 14), (17, 6), (22, 14)], fill=(156, 48, 36, 255))
        d.rectangle((12, 14, 21, 19), fill=wall_d)
        return im
    if kind == "county":
        d.rectangle((2, 14, 37, 30), outline=wall, fill=wall_d)
        d.polygon([(4, 16), (14, 6), (24, 16)], fill=roof)
        d.polygon([(20, 18), (30, 8), (38, 18)], fill=gold if False else roof)
        d.rectangle((16, 22, 22, 30), fill=(40, 28, 20, 255))
        return im
    if kind == "major":
        d.rectangle((2, 16, 53, 42), fill=wall_d, outline=INK)
        d.rectangle((48, 10, 54, 42), fill=wall)  # east ¾ wall
        d.polygon([(6, 18), (18, 6), (30, 18)], fill=roof)
        d.polygon([(26, 20), (38, 8), (50, 20)], fill=roof)
        d.rectangle((4, 8, 10, 18), fill=wall)
        d.rectangle((44, 8, 52, 18), fill=wall)
        d.rectangle((24, 28, 32, 42), fill=(36, 24, 16, 255))
        return im
    if kind == "capital":
        d.rectangle((2, 22, 76, 62), fill=wall_d, outline=INK)
        d.rectangle((70, 14, 78, 62), fill=wall)
        for x in (4, 36, 66):
            d.rectangle((x, 8, x + 10, 24), fill=wall)
            d.polygon([(x - 1, 8), (x + 5, 2), (x + 11, 8)], fill=gold)
        d.polygon([(18, 28), (40, 12), (62, 28)], fill=gold)
        d.rectangle((28, 28, 52, 42), fill=(120, 40, 32, 255))
        d.rectangle((36, 46, 46, 62), fill=(30, 20, 14, 255))
        return im
    # pass
    d.rectangle((4, 8, 36, 34), fill=wall_d, outline=INK)
    d.rectangle((14, 16, 26, 34), fill=(20, 14, 10, 255))
    d.polygon([(4, 8), (20, 2), (36, 8)], fill=roof)
    return im


def match_banners() -> None:
    pairs = [
        ("taoyuan.png", "v01-e04.png"),
        ("hulao.png", "v05-e03.png"),
        ("chibi.png", "v26-e01.png"),
    ]
    BANNER.mkdir(parents=True, exist_ok=True)
    for src_name, dest_name in pairs:
        src = BG / src_name
        if not src.exists():
            continue
        im = Image.open(src).convert("RGBA")
        im.resize((320, 180), Image.Resampling.NEAREST).save(BANNER / dest_name)
        print("banner", dest_name)


def main() -> None:
    grid = parse_grid()
    world = paint_map(grid)
    world.save(OUT / "world-map.png")
    print("world-map", world.size)
    RAW = ROOT / "public" / "assets" / "pixel-times" / "imagine-raw"
    capital_raw = RAW / "city-capital.jpg"
    major_raw = RAW / "city-major.jpg"
    if capital_raw.exists():
        fit(Image.open(capital_raw), (96, 80)).save(OUT / "city-capital.png")
        print("city capital from Imagine")
    else:
        city("capital").save(OUT / "city-capital.png")
    if major_raw.exists():
        fit(Image.open(major_raw), (64, 56)).save(OUT / "city-major.png")
        print("city major from Imagine")
    else:
        city("major").save(OUT / "city-major.png")
    for k in ("village", "county", "pass"):
        city(k).save(OUT / f"city-{k}.png")
        print("city", k)
    match_banners()


if __name__ == "__main__":
    main()
