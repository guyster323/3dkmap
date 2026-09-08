#!/usr/bin/env python3
"""Build original 영걸전/조조전-grammar pixel atlases.

Specs from KOEI pack layout (we do NOT decode copyrighted game files):
  tiles 16x16  (HEXBCHP / HEXZCHP / SMAPBGPL)
  units 32x64  (HEXZCHR zoom characters), 2 idle frames
  kao   64x80  (FACEDAT), ~8-color KOEI face cell
Export contract:
  Aseprite: uniform cells, no divider, indexed-looking PNG
  Godot: tileset.json tile_size 16, separation 0
  Piskel: 2-frame sheets, onion-style idle
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "eiketsu"
OUT.mkdir(parents=True, exist_ok=True)

# 16-color KOEI-like master (plus transparent)
INK = (26, 18, 12, 255)
SKIN = (234, 217, 182, 255)
CINN = (194, 59, 34, 255)
GOLD = (201, 162, 39, 255)
GRASS = (107, 143, 58, 255)
GRASS_D = (61, 107, 58, 255)
WATER = (42, 90, 122, 255)
WATER_H = (122, 180, 196, 255)
ROCK = (106, 90, 58, 255)
WALL = (138, 122, 106, 255)
WOOD = (90, 58, 34, 255)
WEI = (107, 42, 42, 255)
WU = (42, 74, 107, 255)
DIRT = (74, 62, 40, 255)
LIP = (138, 42, 24, 255)
SNOW = (234, 217, 182, 255)
TRANS = (0, 0, 0, 0)

T = 16
UW, UH = 32, 64
KW, KH = 64, 80


def new(w, h):
    return Image.new("RGBA", (w, h), TRANS)


def px(im: Image.Image, x, y, c, w=1, h=1):
    draw = ImageDraw.Draw(im)
    draw.rectangle([x, y, x + w - 1, y + h - 1], fill=c)


def dither(im, x, y, size, a, b, parity=0):
    for j in range(size):
        for i in range(size):
            c = a if (i + j + parity) % 3 else b
            if 0 <= x + i < im.width and 0 <= y + j < im.height:
                im.putpixel((x + i, y + j), c)


def tile_plain(v=0):
    im = new(T, T)
    dither(im, 0, 0, T, GRASS, GRASS_D, v)
    for i, (gx, gy) in enumerate(((2, 11), (8, 13), (12, 10), (5, 14))):
        if (i + v) % 2 == 0:
            px(im, gx, gy, GRASS_D)
            px(im, gx, gy - 1, GRASS)
    return im


def tile_forest():
    im = tile_plain(1)
    px(im, 7, 10, WOOD, 2, 5)
    px(im, 4, 4, GRASS_D, 8, 7)
    px(im, 5, 3, GRASS, 6, 3)
    px(im, 6, 2, GRASS_D, 4, 2)
    return im


def tile_mountain():
    im = new(T, T)
    dither(im, 0, 0, T, DIRT, ROCK, 1)
    px(im, 2, 10, ROCK, 12, 5)
    px(im, 4, 6, WALL, 8, 5)
    px(im, 6, 3, ROCK, 4, 4)
    px(im, 7, 2, SNOW, 2, 2)
    return im


def tile_water(frame: int):
    im = new(T, T)
    dither(im, 0, 0, T, WATER, (36, 74, 106, 255), frame)
    y = 6 + frame
    px(im, 1, y, WATER_H, 6, 1)
    px(im, 9, y + 4 - frame * 2, WATER_H, 5, 1)
    px(im, 3, 13 - frame, WATER_H, 4, 1)
    return im


def tile_waste():
    im = new(T, T)
    dither(im, 0, 0, T, DIRT, ROCK, 2)
    px(im, 4, 7, WALL, 2, 1)
    px(im, 11, 12, ROCK, 2, 1)
    return im


def tile_wall():
    im = new(T, T)
    px(im, 0, 0, WALL, 16, 16)
    for y in (0, 5, 10):
        px(im, 0, y, DIRT, 16, 1)
    for x in (0, 8):
        px(im, x, 0, DIRT, 1, 16)
    px(im, 3, 2, GOLD, 1, 1)
    px(im, 11, 7, GOLD, 1, 1)
    return im


def tile_gate():
    im = tile_wall()
    px(im, 5, 6, INK, 6, 10)
    px(im, 6, 8, WOOD, 4, 8)
    px(im, 7, 4, GOLD, 2, 2)
    return im


def tile_keep():
    im = tile_plain(0)
    px(im, 2, 8, WALL, 12, 7)
    px(im, 3, 5, CINN, 10, 4)
    px(im, 5, 3, CINN, 6, 3)
    px(im, 7, 2, GOLD, 2, 2)
    px(im, 7, 10, INK, 2, 5)
    return im


def tile_camp():
    im = tile_plain(1)
    px(im, 3, 8, WOOD, 10, 6)
    px(im, 4, 5, WEI, 8, 4)
    px(im, 7, 3, GOLD, 2, 3)
    return im


def tile_palisade():
    im = tile_plain(0)
    for x in range(2, 15, 3):
        px(im, x, 6, WOOD, 2, 9)
        px(im, x, 5, DIRT, 2, 1)
    return im


def tile_cursor():
    im = new(T, T)
    g = GOLD
    px(im, 0, 0, g, 4, 1)
    px(im, 0, 0, g, 1, 4)
    px(im, 12, 0, g, 4, 1)
    px(im, 15, 0, g, 1, 4)
    px(im, 0, 15, g, 4, 1)
    px(im, 0, 12, g, 1, 4)
    px(im, 12, 15, g, 4, 1)
    px(im, 15, 12, g, 1, 4)
    return im


TILE_ORDER = [
    "plain",
    "plain2",
    "forest",
    "mountain",
    "water0",
    "water1",
    "waste",
    "wall",
    "gate",
    "keep",
    "camp",
    "palisade",
    "cursor",
]


def build_tileset():
    makers = {
        "plain": lambda: tile_plain(0),
        "plain2": lambda: tile_plain(1),
        "forest": tile_forest,
        "mountain": tile_mountain,
        "water0": lambda: tile_water(0),
        "water1": lambda: tile_water(1),
        "waste": tile_waste,
        "wall": tile_wall,
        "gate": tile_gate,
        "keep": tile_keep,
        "camp": tile_camp,
        "palisade": tile_palisade,
        "cursor": tile_cursor,
    }
    cols = 8
    rows = (len(TILE_ORDER) + cols - 1) // cols
    sheet = new(cols * T, rows * T)
    for i, name in enumerate(TILE_ORDER):
        cx, cy = i % cols, i // cols
        sheet.paste(makers[name](), (cx * T, cy * T))
    path = OUT / "tileset.png"
    sheet.save(path)
    return path


OFFICERS = [
    # id, armor, helm, beard, weapon
    ("liu-bei", GRASS_D, INK, True, GOLD),
    ("guan-yu", GRASS, CINN, True, GOLD),
    ("zhang-fei", DIRT, INK, True, WALL),
    ("cao-cao", WEI, INK, True, GOLD),
    ("dong-zhuo", WOOD, DIRT, True, ROCK),
    ("lu-bu", WEI, GOLD, False, GOLD),
    ("sun-jian", WU, WOOD, True, WALL),
    ("gogukcheon", (61, 139, 122, 255), GOLD, False, WOOD),
]


def officer(armor, helm, beard, weapon, frame: int):
    im = new(UW, UH)
    bob = -frame
    # shadow
    px(im, 8, 60, (26, 18, 12, 90), 16, 3)
    y = 8 + bob
    # legs
    px(im, 12, 48 + bob, INK, 3, 12)
    px(im, 18, 48 + bob, INK, 3, 12)
    # body
    px(im, 10, 28 + bob, armor, 12, 22)
    px(im, 11, 30 + bob, GOLD, 10, 2)
    # cape
    px(im, 8 + frame, 30 + bob, armor, 3, 16)
    # head
    px(im, 12, 14 + bob, SKIN, 8, 12)
    px(im, 13, 16 + bob, INK, 2, 2)
    px(im, 17, 16 + bob, INK, 2, 2)
    if beard:
        px(im, 13, 24 + bob, INK, 6, 4)
    # helm
    px(im, 11, 10 + bob, helm, 10, 6)
    px(im, 14, 8 + bob, GOLD, 4, 3)
    # weapon
    px(im, 24, 18 + bob + frame, weapon, 2, 28)
    px(im, 23, 18 + bob + frame, GOLD, 4, 3)
    return im


def build_units():
    cols = 2
    rows = len(OFFICERS)
    sheet = new(cols * UW, rows * UH)
    for i, (_id, armor, helm, beard, weapon) in enumerate(OFFICERS):
        sheet.paste(officer(armor, helm, beard, weapon, 0), (0, i * UH))
        sheet.paste(officer(armor, helm, beard, weapon, 1), (UW, i * UH))
    path = OUT / "units.png"
    sheet.save(path)
    return path


def kao(armor, helm, beard, accent, extra: str):
    im = new(KW, KH)
    px(im, 0, 0, INK, KW, KH)
    px(im, 8, 50, armor, 48, 30)
    px(im, 16, 16, SKIN, 32, 38)
    px(im, 14, 12, helm, 36, 12)
    px(im, 22, 8, GOLD, 20, 6)
    px(im, 24, 28, INK, 4, 4)
    px(im, 36, 28, INK, 4, 4)
    px(im, 30, 38, LIP, 4, 2)
    if beard:
        px(im, 22, 44, INK, 20, 12)
    if extra == "redface":
        px(im, 18, 22, CINN, 6, 4)
        px(im, 40, 22, CINN, 6, 4)
        px(im, 24, 46, CINN, 16, 16)
    if extra == "fierce":
        px(im, 22, 26, INK, 6, 2)
        px(im, 36, 26, INK, 6, 2)
    if extra == "plumes":
        px(im, 10, 6, GOLD, 6, 16)
        px(im, 48, 6, GOLD, 6, 16)
    if extra == "wings":
        px(im, 8, 10, GOLD, 8, 14)
        px(im, 48, 10, GOLD, 8, 14)
    px(im, 28, 18, accent, 8, 3)
    return im


KAO_EXTRA = {
    "liu-bei": "none",
    "guan-yu": "redface",
    "zhang-fei": "fierce",
    "cao-cao": "none",
    "dong-zhuo": "none",
    "lu-bu": "plumes",
    "sun-jian": "none",
    "gogukcheon": "wings",
}


def build_kao():
    cols = 4
    rows = 2
    sheet = new(cols * KW, rows * KH)
    for i, (oid, armor, helm, beard, _w) in enumerate(OFFICERS):
        cx, cy = i % cols, i // cols
        sheet.paste(kao(armor, helm, beard, GOLD, KAO_EXTRA[oid]), (cx * KW, cy * KH))
    path = OUT / "kao.png"
    sheet.save(path)
    return path


def write_godot_json():
    (OUT / "tileset.godot.json").write_text(
        """{
  "resource_type": "TileSet",
  "tile_size": [16, 16],
  "margin": 0,
  "separation": 0,
  "texture": "res://assets/eiketsu/tileset.png",
  "tiles": {
    "plain": 0, "plain2": 1, "forest": 2, "mountain": 3,
    "water0": 4, "water1": 5, "waste": 6, "wall": 7,
    "gate": 8, "keep": 9, "camp": 10, "palisade": 11, "cursor": 12
  }
}
""",
        encoding="utf-8",
    )


def write_aseprite_json():
    (OUT / "units.aseprite.json").write_text(
        """{
  "frames": {},
  "meta": {
    "app": "https://www.aseprite.org/",
    "size": {"w": 64, "h": 512},
    "scale": "1",
    "frameTags": [{"name": "idle", "from": 0, "to": 1, "direction": "forward"}],
    "slices": [],
    "grid": {"tileWidth": 32, "tileHeight": 64}
  }
}
""",
        encoding="utf-8",
    )


def write_piskel_note():
    (OUT / "README.md").write_text(
        """# eiketsu atlas

원본 영걸전/조조전 파일을 디코딩하지 않습니다.
규격만 맞춘 오리지널 시트입니다.

| 레이어 | 파일 | 셀 | 출처 규격 |
|---|---|---|---|
| 지형 | tileset.png | 16×16 | HEXBCHP / HEXZCHP / SMAP 타일 |
| 유닛 idle | units.png | 32×64 × 2프레임 | HEXZCHR 줌 캐릭터 |
| 얼굴 | kao.png | 64×80 | FACEDAT kao |

Godot: `tileset.godot.json` 을 TileSet atlas로 임포트 (tile 16, sep 0).
Aseprite: tileset.png 를 16px 그리드로 열기. units.png 는 32×64 그리드, 태그 idle 0-1.
Piskel: units 한 장수 행(32×64 두 칸)을 임포트해 2프레임 양파껍질 idle.

로컬에 Godot/Aseprite/Piskel 바이너리가 없어 이 스크립트가 시트를 생성합니다.
다시 찍으려면: `python scripts/build_eiketsu_atlas.py`
""",
        encoding="utf-8",
    )


def main():
    t = build_tileset()
    u = build_units()
    k = build_kao()
    write_godot_json()
    write_aseprite_json()
    write_piskel_note()
    print("wrote", t)
    print("wrote", u)
    print("wrote", k)


if __name__ == "__main__":
    main()
