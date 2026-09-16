#!/usr/bin/env python3
"""Compose one ¾ world map + city landmarks + matching banners. Original pixels."""
from __future__ import annotations

import math
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
    wobble = (h(int(lon * 22), int(lat * 22), 11) - 128) / 128.0 * 0.08
    return ((lon - cx) / rx) ** 2 + ((lat - cy) / ry) ** 2 <= 1.0 + wobble


def dist_seg(px: float, py: float, ax: float, ay: float, bx: float, by: float) -> float:
    vx, vy = bx - ax, by - ay
    l2 = vx * vx + vy * vy
    if l2 == 0:
        return (px - ax) ** 2 + (py - ay) ** 2
    t = max(0.0, min(1.0, ((px - ax) * vx + (py - ay) * vy) / l2))
    dx, dy = px - ax - t * vx, py - ay - t * vy
    return dx * dx + dy * dy


def near_path(lon: float, lat: float, path: list[tuple[float, float]], width: float) -> bool:
    w2 = width * width
    for i in range(len(path) - 1):
        if dist_seg(lon, lat, *path[i], *path[i + 1]) <= w2:
            return True
    return False


# Sketch polylines for paint only. Not a survey, not a border claim.
HUANGHE = [
    (110.6, 40.5),
    (110.9, 39.0),
    (110.3, 37.4),
    (110.1, 35.4),
    (111.6, 34.75),
    (113.4, 34.85),
    (114.9, 35.15),
    (117.0, 36.15),
    (118.6, 37.75),
]
YANGTZE = [
    (106.4, 31.9),
    (108.6, 30.85),
    (111.2, 30.55),
    (114.2, 30.45),
    (116.6, 31.7),
    (118.9, 32.05),
    (121.4, 31.25),
]


def in_shandong(lon: float, lat: float) -> bool:
    if ell(lon, lat, 121.25, 36.78, 1.58, 0.62):
        return True
    if ell(lon, lat, 122.4, 37.32, 0.42, 0.32):
        return True
    if 118.7 < lon < 120.5 and 36.4 < lat < 37.15:
        return True
    return False


def in_korea(lon: float, lat: float) -> bool:
    if ell(lon, lat, 126.52, 33.38, 0.38, 0.22):
        return True
    body = ell(lon, lat, 127.55, 37.45, 1.18, 4.45) or ell(lon, lat, 127.25, 41.05, 1.22, 1.85)
    if not body:
        return False
    if ell(lon, lat, 125.35, 36.9, 1.05, 1.55) and lon < 126.55:
        return False
    if ell(lon, lat, 129.55, 36.15, 0.48, 1.05) and lon > 129.2:
        return False
    return True


def in_liaodong(lon: float, lat: float) -> bool:
    return ell(lon, lat, 121.95, 40.2, 1.65, 1.35)


def china_east_coast(lat: float) -> float:
    """Mainland east-coast longitude. Sketch for the landmask, not a surveyed shore."""
    if lat < 22.0:
        return 113.4
    if lat < 25.0:
        return 113.4 + (lat - 22.0) / 3.0 * 5.4
    if lat < 30.5:
        return 118.8 + (lat - 25.0) / 5.5 * 1.5
    if lat < 35.2:
        return 120.3 - (lat - 30.5) / 4.7 * 1.6
    if lat < 38.4:
        return 118.7 - (lat - 35.2) / 3.2 * 1.05
    if lat < 41.2:
        return 117.65 + (lat - 38.4) / 2.8 * 4.4
    return 124.4


def land_kind(lon: float, lat: float) -> str:
    """Pixel landmask. Geographic skeleton, not a survey or border claim."""
    if lat < 21.15 or lat > 43.85 or lon < 100.2 or lon > 131.8:
        return "sea"
    if in_korea(lon, lat):
        if lon > 128.4 or lat > 40.4:
            return "hill"
        if lat < 35.4:
            return "plain"
        return "grass"
    if in_shandong(lon, lat):
        return "hill" if lon > 121.4 else "plain"
    if in_liaodong(lon, lat):
        return "hill"
    if ell(lon, lat, 121.02, 23.7, 0.72, 1.35):
        return "mountain"
    if lon > china_east_coast(lat) + 0.12:
        return "sea"
    if ell(lon, lat, 119.4, 38.85, 2.05, 1.22) and not in_shandong(lon, lat) and not in_liaodong(lon, lat):
        return "sea"
    if near_path(lon, lat, HUANGHE, 0.16):
        return "river"
    if near_path(lon, lat, YANGTZE, 0.20):
        return "river"
    west = 103.5 + 1.05 * math.sin((lat - 30) * 0.31)
    if lon < west:
        return "mountain" if lat > 27.0 else "forest"
    if lat > 41.3 + 0.4 * math.sin(lon * 0.35):
        return "waste"
    if lat < 26.2 + 0.7 * math.sin((lon - 108) * 0.4) and lon < 117.5:
        return "forest"
    if ell(lon, lat, 105.7, 30.4, 2.2, 1.55):
        return "field"
    if 112.2 < lon < 116.8 and 33.4 < lat < 36.2:
        return "field"
    return "plain"


def paint_map(grid: list[str]) -> Image.Image:
    rows, cols = len(grid), len(grid[0])
    W, H = cols * TILE, rows * TILE
    im = Image.new("RGBA", (W, H), SEA)
    px = im.load()

    # Pixel landmask first (breaks 2x upsample rectangles).
    for y in range(H):
        for x in range(W):
            lon = 100.0 + (x + 0.5) / W * 32.0
            lat = 44.0 - (y + 0.5) / H * 23.0
            k = land_kind(lon, lat)
            n = h(x // 3, y // 3, x + y)
            if k == "sea":
                col = SEA
            else:
                col = {
                    "plain": PLAIN2 if n > 200 else PLAIN,
                    "grass": GRASS2 if n > 180 else GRASS,
                    "field": FIELD,
                    "waste": WASTE,
                    "forest": FOREST2 if n > 150 else FOREST,
                    "hill": HILL,
                    "mountain": MOUNT2 if n > 140 else MOUNT,
                    "river": RIVER,
                }[k]
                if k != "river" and (x % 11) + (y % 9) == 2:
                    col = tuple(min(255, v + 10) for v in col[:3]) + (255,)
                if k in ("plain", "grass") and (x + y * 3) % 17 == 0 and n > 110:
                    col = (78, 102, 58, 255) if k == "plain" else (48, 82, 44, 255)
            px[x, y] = col

    # Pixel-edge foam (not cell-snapped)
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if px[x, y][:3] != SEA[:3] and px[x, y][:3] != SEA2[:3]:
                continue
            nbs = (px[x - 1, y], px[x + 1, y], px[x, y - 1], px[x, y + 1])
            if any(p[:3] not in (SEA[:3], SEA2[:3], FOAM[:3], RIVER[:3]) for p in nbs):
                if h(x, y, 3) > 140:
                    px[x, y] = FOAM

    RAW = ROOT / "public" / "assets" / "pixel-times" / "imagine-raw"
    forest_src = RAW / "forest-crowns.jpg"
    mount_src = RAW / "mountain-ridge.jpg"
    forest_spr = fit(Image.open(forest_src), (36, 28)) if forest_src.exists() else None
    mount_spr = fit(Image.open(mount_src), (56, 36)) if mount_src.exists() else None

    def stamp(sprite: Image.Image | None, want: str, step: int, thresh: int) -> None:
        if sprite is None:
            return
        sw, sh = sprite.size
        for y in range(0, H - sh, step):
            for x in range(0, W - sw, step):
                lon = 100.0 + (x + sw / 2) / W * 32.0
                lat = 44.0 - (y + sh / 2) / H * 23.0
                if land_kind(lon, lat) != want:
                    continue
                if h(x, y, 9) < thresh:
                    continue
                ox = x + (h(x, y, 1) % (step // 2)) - step // 4
                oy = y + (h(x, y, 2) % (step // 3)) - step // 6
                im.alpha_composite(sprite, (max(0, ox), max(0, oy)))

    stamp(forest_spr, "forest", 36, 70)
    stamp(forest_spr, "grass", 64, 190)
    stamp(mount_spr, "mountain", 52, 40)
    stamp(mount_spr, "hill", 72, 210)
    return im


def chroma_key(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    corners = [px[0, 0][:3], px[w - 1, 0][:3], px[0, h - 1][:3], px[w - 1, h - 1][:3]]
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if not a:
                continue
            magenta = r >= 150 and g <= 110 and b >= 70 and r > g + 40
            keyed = magenta
            if not keyed:
                for kr, kg, kb in corners:
                    if abs(r - kr) + abs(g - kg) + abs(b - kb) < 54:
                        keyed = True
                        break
            if keyed:
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
        ("taoyuan.png", "v01-e04.png", 0),
        ("hulao.png", "v05-e03.png", 0),
        ("chibi.png", "v26-e01.png", 0),
        ("hulao.png", "v01-e01.png", 40),
        ("chibi.png", "v06-e01.png", 80),
        ("chibi.png", "v16-e03.png", 20),
        ("taoyuan.png", "v21-e02.png", 60),
        ("hulao.png", "v23-e02.png", 90),
        ("hulao.png", "v44-e01.png", 30),
        ("hulao.png", "v58-e01.png", 110),
        ("taoyuan.png", "ev-184-goguryeo.png", 100),
    ]
    BANNER.mkdir(parents=True, exist_ok=True)
    for src_name, dest_name, dx in pairs:
        src = BG / src_name
        if not src.exists():
            continue
        im = Image.open(src).convert("RGBA")
        w, h = im.size
        x0 = min(dx, max(0, w - 200))
        im.crop((x0, 0, w, h)).resize((320, 180), Image.Resampling.NEAREST).save(BANNER / dest_name)
        print("banner", dest_name)


def landmarks() -> None:
    ship = Image.new("RGBA", (48, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(ship)
    d.polygon([(4, 22), (22, 8), (44, 22)], fill=(40, 32, 28, 255))
    d.rectangle((20, 4, 24, 20), fill=(180, 48, 36, 255))
    ship.save(OUT / "landmark-ship.png")
    army = Image.new("RGBA", (40, 28), (0, 0, 0, 0))
    d = ImageDraw.Draw(army)
    d.ellipse((8, 16, 32, 26), fill=(20, 16, 12, 160))
    d.rectangle((16, 4, 20, 18), fill=(194, 59, 34, 255))
    d.polygon([(12, 18), (18, 8), (24, 18)], fill=(80, 70, 58, 255))
    army.save(OUT / "landmark-army.png")
    port = Image.new("RGBA", (40, 28), (0, 0, 0, 0))
    d = ImageDraw.Draw(port)
    d.rectangle((2, 16, 38, 26), fill=(70, 90, 110, 255))
    d.rectangle((8, 8, 20, 18), fill=(120, 80, 50, 255))
    port.save(OUT / "landmark-port.png")
    print("landmarks")


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
    county_raw = RAW / "city-county.jpg"
    if county_raw.exists():
        fit(Image.open(county_raw), (40, 32)).save(OUT / "city-county.png")
        print("city county from Imagine")
    else:
        city("county").save(OUT / "city-county.png")
    for k in ("village", "pass"):
        if not (OUT / f"city-{k}.png").exists():
            city(k).save(OUT / f"city-{k}.png")
            print("city", k)
    ship_raw = RAW / "landmark-ship.jpg"
    army_raw = RAW / "landmark-army.jpg"
    if ship_raw.exists():
        fit(Image.open(ship_raw), (48, 32)).save(OUT / "landmark-ship.png")
        print("ship from Imagine")
    if army_raw.exists():
        fit(Image.open(army_raw), (40, 28)).save(OUT / "landmark-army.png")
        print("army from Imagine")
    # Do not overwrite approved banners.


if __name__ == "__main__":
    main()
