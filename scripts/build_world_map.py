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
    (108.8, 40.55),
    (110.6, 40.5),
    (111.15, 39.15),
    (110.35, 37.45),
    (110.05, 35.45),
    (111.55, 34.72),
    (112.7, 34.68),
    (113.45, 34.88),
    (114.9, 35.18),
    (116.05, 35.65),
    (117.05, 36.2),
    (118.05, 37.05),
    (118.85, 37.9),
]
YANGTZE = [
    (106.4, 31.9),
    (107.6, 31.2),
    (108.7, 30.85),
    (111.2, 30.52),
    (113.1, 30.4),
    (114.3, 30.48),
    (115.4, 30.85),
    (116.7, 31.65),
    (118.2, 32.1),
    (119.4, 32.15),
    (121.45, 31.22),
]


def near_path_var(lon: float, lat: float, path: list[tuple[float, float]], w0: float, w1: float) -> bool:
    n = len(path) - 1
    for i in range(n):
        t = i / max(1, n - 1)
        w = w0 + (w1 - w0) * t
        if dist_seg(lon, lat, *path[i], *path[i + 1]) <= w * w:
            return True
    return False


def wobble(lon: float, lat: float, amp: float = 0.14) -> float:
    n = (h(int(lon * 48), int(lat * 48), 4) - 128) / 128.0
    n2 = (h(int(lat * 21), int(lon * 9), 8) - 128) / 128.0
    return n * amp + n2 * (amp * 0.7)


def in_shandong(lon: float, lat: float) -> bool:
    n = wobble(lon, lat, 0.1)
    if 118.62 < lon < 120.12 and 36.32 + n < lat < 37.02 + n:
        return True
    if ell(lon, lat, 121.38, 36.7, 1.52, 0.48):
        if ell(lon, lat, 120.52, 37.4, 0.7, 0.3):
            return False
        if ell(lon, lat, 120.32, 36.1, 0.48, 0.22):
            return False
        return True
    if ell(lon, lat, 122.45, 37.26, 0.38, 0.24):
        return True
    return False


def in_korea(lon: float, lat: float) -> bool:
    if ell(lon, lat, 126.52, 33.38, 0.36, 0.2):
        return True
    if lat < 34.28 or lat > 43.04:
        return False
    cx = 127.08 + (43.0 - lat) * 0.07
    if lat > 40.7:
        hw_w, hw_e = 1.42, 1.5
    elif lat > 38.4:
        hw_w, hw_e = 1.02, 1.18
    elif lat > 36.3:
        hw_w, hw_e = 0.92, 1.08
    else:
        hw_w, hw_e = 0.74, 0.92
    if 36.25 < lat < 37.75:
        hw_w -= 0.4 * math.sin((lat - 36.25) / 1.5 * math.pi)
    n = wobble(lon, lat, 0.15)
    return (cx - hw_w + n) <= lon <= (cx + hw_e + n)


def in_liaodong(lon: float, lat: float) -> bool:
    if near_path(lon, lat, [(124.55, 41.75), (123.15, 40.55), (121.95, 39.2)], 0.7):
        return True
    if ell(lon, lat, 121.5, 38.92, 0.52, 0.34):
        return True
    return False


def china_east_coast(lat: float) -> float:
    """Mainland east-coast longitude. Sketch for the landmask, not a surveyed shore."""
    if lat < 22.0:
        base = 113.4
    elif lat < 25.0:
        base = 113.4 + (lat - 22.0) / 3.0 * 5.4
    elif lat < 30.5:
        base = 118.8 + (lat - 25.0) / 5.5 * 1.5
    elif lat < 35.2:
        base = 120.3 - (lat - 30.5) / 4.7 * 1.6
    elif lat < 38.4:
        base = 118.7 - (lat - 35.2) / 3.2 * 1.05
    elif lat < 41.0:
        base = 117.65 + (lat - 38.4) / 2.6 * 5.2
    else:
        base = 124.6
    return base + wobble(110.0, lat, 0.28)


def in_bohai(lon: float, lat: float) -> bool:
    if not (117.35 < lon < 121.35 and 37.35 < lat < 40.65):
        return False
    if in_shandong(lon, lat) or in_liaodong(lon, lat):
        return False
    if lon < china_east_coast(lat) + 0.04:
        return False
    return True


def land_kind(lon: float, lat: float) -> str:
    """Pixel landmask. Geographic skeleton, not a survey or border claim."""
    if lat < 21.15 or lat > 43.85 or lon < 100.2 or lon > 131.8:
        return "sea"
    if in_korea(lon, lat):
        if lon > 128.35 or lat > 40.35:
            return "hill"
        if lat < 35.35:
            return "plain"
        return "grass"
    if in_shandong(lon, lat):
        return "hill" if lon > 121.35 else "plain"
    if in_liaodong(lon, lat):
        return "hill"
    if ell(lon, lat, 121.02, 23.7, 0.68, 1.28):
        return "mountain"
    if in_bohai(lon, lat):
        return "sea"
    if lon > china_east_coast(lat) + 0.1:
        return "sea"
    if near_path_var(lon, lat, HUANGHE, 0.12, 0.22):
        return "river"
    if near_path_var(lon, lat, YANGTZE, 0.14, 0.26):
        return "river"
    west = 103.5 + 1.05 * math.sin((lat - 30) * 0.31)
    if lon < west:
        return "mountain" if lat > 27.0 else "forest"
    if lat > 41.3 + 0.4 * math.sin(lon * 0.35):
        return "waste"
    if lat < 26.2 + 0.7 * math.sin((lon - 108) * 0.4) and lon < 117.5:
        return "forest"
    return "plain"


def lonlat_xy(lon: float, lat: float, W: int, H: int) -> tuple[int, int]:
    return int((lon - 100.0) / 32.0 * W), int((44.0 - lat) / 23.0 * H)


def parse_places() -> list[tuple[str, float, float, str]]:
    text = (ROOT / "src" / "data" / "places.ts").read_text(encoding="utf-8")
    return [
        (m.group(1), float(m.group(2)), float(m.group(3)), m.group(4))
        for m in re.finditer(
            r'\{ id: "([^"]+)".*?lon: ([0-9.\-]+), lat: ([0-9.\-]+), kind: "([^"]+)"',
            text,
        )
    ]


def parse_road_edges() -> list[tuple[str, str]]:
    text = (ROOT / "src" / "data" / "terrain" / "strategic.ts").read_text(encoding="utf-8")
    return re.findall(r'\{ from: "([^"]+)", to: "([^"]+)", kind: "(?:road|pass)" \}', text)


def bresenham(x0: int, y0: int, x1: int, y1: int) -> list[tuple[int, int]]:
    pts: list[tuple[int, int]] = []
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err, x, y = dx + dy, x0, y0
    while True:
        pts.append((x, y))
        if x == x1 and y == y1:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy
            x += sx
        if e2 <= dx:
            err += dx
            y += sy
    return pts


def is_sea_px(px, x: int, y: int) -> bool:
    c = px[x, y][:3]
    return c == SEA[:3] or c == SEA2[:3] or c == FOAM[:3] or c == RIVER[:3]


def paint_map(grid: list[str]) -> Image.Image:
    rows, cols = len(grid), len(grid[0])
    W, H = cols * TILE, rows * TILE
    im = Image.new("RGBA", (W, H), SEA)
    px = im.load()
    kinds = [[""] * W for _ in range(H)]

    for y in range(H):
        for x in range(W):
            lon = 100.0 + (x + 0.5) / W * 32.0
            lat = 44.0 - (y + 0.5) / H * 23.0
            k = land_kind(lon, lat)
            kinds[y][x] = k
            n = h(x // 3, y // 3, x + y)
            if k == "sea":
                col = SEA
            else:
                col = {
                    "plain": PLAIN2 if n > 210 else PLAIN,
                    "grass": GRASS2 if n > 190 else GRASS,
                    "field": FIELD,
                    "waste": WASTE,
                    "forest": FOREST2 if n > 150 else FOREST,
                    "hill": HILL,
                    "mountain": MOUNT2 if n > 140 else MOUNT,
                    "river": RIVER,
                }[k]
            px[x, y] = col

    places = parse_places()
    by_id = {pid: (lon, lat, kind) for pid, lon, lat, kind in places}
    hubs: list[tuple[int, int, float]] = []
    for pid, lon, lat, kind in places:
        x, y = lonlat_xy(lon, lat, W, H)
        if not (0 <= x < W and 0 <= y < H):
            continue
        if kinds[y][x] == "sea":
            continue
        weight = 1.4 if kind == "city" else 0.9 if kind in ("pass", "battlefield") else 0.55
        hubs.append((x, y, weight))

    # Dirt roads follow catalog edges. Skip water.
    for a, b in parse_road_edges():
        if a not in by_id or b not in by_id:
            continue
        x0, y0 = lonlat_xy(by_id[a][0], by_id[a][1], W, H)
        x1, y1 = lonlat_xy(by_id[b][0], by_id[b][1], W, H)
        for i, (x, y) in enumerate(bresenham(x0, y0, x1, y1)):
            if not (0 <= x < W and 0 <= y < H):
                continue
            if kinds[y][x] in ("sea", "river"):
                continue
            px[x, y] = ROAD
            if i % 5 == 0 and 0 <= y + 1 < H and kinds[y + 1][x] not in ("sea", "river"):
                px[x, y + 1] = (140, 118, 82, 255)

    # Fields, tufts, shrubs cluster around cities and rivers — quiet midtone elsewhere.
    for y in range(H):
        for x in range(W):
            k = kinds[y][x]
            if k not in ("plain", "grass"):
                continue
            infl = 0.0
            for hx, hy, w in hubs:
                d2 = (x - hx) ** 2 + (y - hy) ** 2
                r2 = (38 * w) ** 2
                if d2 < r2:
                    infl = max(infl, w * (1.0 - d2 / r2))
            if k == "grass":
                infl = max(infl, 0.25)
            n = h(x, y, 11)
            if infl > 0.45 and n > 200:
                px[x, y] = FIELD if (x + y) % 3 else (118, 108, 58, 255)
            elif infl > 0.22 and n < 18:
                px[x, y] = (78, 102, 58, 255) if k == "plain" else (48, 82, 44, 255)
            elif infl > 0.12 and n > 248:
                px[x, y] = (70, 92, 52, 255)

    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if px[x, y][:3] != SEA[:3]:
                continue
            nbs = (px[x - 1, y], px[x + 1, y], px[x, y - 1], px[x, y + 1])
            if any(p[:3] not in (SEA[:3], SEA2[:3], FOAM[:3], RIVER[:3]) for p in nbs):
                if h(x, y, 3) > 150:
                    px[x, y] = FOAM

    RAW = ROOT / "public" / "assets" / "pixel-times" / "imagine-raw"

    def load_spr(name: str, size: tuple[int, int]) -> Image.Image | None:
        p = RAW / name
        return fit(Image.open(p), size) if p.exists() else None

    forest_a = load_spr("forest-crowns.jpg", (36, 28))
    forest_b = load_spr("forest-crowns-2.jpg", (32, 26))
    mount_spr = load_spr("mountain-ridge.jpg", (56, 36))
    field_spr = load_spr("field-patch.jpg", (28, 22))
    hamlet_spr = load_spr("hamlet.jpg", (26, 22))
    shrub_spr = load_spr("shrub-clump.jpg", (18, 14))

    def stamp_kind(sprite: Image.Image | None, want: str, step: int, thresh: int) -> None:
        if sprite is None:
            return
        sw, sh = sprite.size
        for y in range(0, H - sh, step):
            for x in range(0, W - sw, step):
                cx, cy = x + sw // 2, y + sh // 2
                if not (0 <= cx < W and 0 <= cy < H):
                    continue
                if kinds[cy][cx] != want:
                    continue
                if h(x, y, 9) < thresh:
                    continue
                ox = x + (h(x, y, 1) % max(1, step // 2)) - step // 4
                oy = y + (h(x, y, 2) % max(1, step // 3)) - step // 6
                im.alpha_composite(sprite, (max(0, ox), max(0, oy)))

    stamp_kind(forest_a, "forest", 34, 60)
    stamp_kind(forest_b, "forest", 40, 90)
    stamp_kind(forest_b, "grass", 58, 175)
    stamp_kind(mount_spr, "mountain", 50, 35)
    stamp_kind(mount_spr, "hill", 70, 200)

    def stamp_near(sprite: Image.Image | None, radius: int, thresh: int, jitter: int) -> None:
        if sprite is None:
            return
        sw, sh = sprite.size
        for hx, hy, w in hubs:
            if h(hx, hy, 13) < thresh:
                continue
            ox = hx + (h(hx, hy, 1) % (jitter * 2 + 1)) - jitter - sw // 3
            oy = hy + (h(hx, hy, 2) % (jitter + 3)) - 2
            if not (0 <= ox < W - sw and 0 <= oy < H - sh):
                continue
            if kinds[min(H - 1, oy + sh // 2)][min(W - 1, ox + sw // 2)] in ("sea", "river", "mountain"):
                continue
            if abs(ox - hx) > radius * w and abs(oy - hy) > radius * w:
                continue
            im.alpha_composite(sprite, (ox, oy))

    stamp_near(field_spr, 28, 40, 18)
    stamp_near(hamlet_spr, 16, 90, 10)
    stamp_near(shrub_spr, 24, 20, 14)
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
