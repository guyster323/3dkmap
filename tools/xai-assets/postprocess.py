#!/usr/bin/env python3
"""Pixel Times postprocess: chroma-key, crop, nearest-neighbor resize, atlas pack.

AI paints. This file owns final dimensions.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PT = ROOT / "public" / "assets" / "pixel-times"
MASTER_DIR = PT / "masters"
PORTRAIT_DIR = PT / "portraits"
ACTOR_DIR = PT / "scene-actors"
MAP_DIR = PT / "map-sprites"
BANNER_DIR = PT / "event-banners"
BG_DIR = PT / "scene-backgrounds"

SIZE = {
    "portrait": (64, 80),
    "sceneActor": (48, 64),
    "mapOfficer": (32, 64),
    "eventBanner": (320, 180),
    "sceneBackground": (480, 270),
}

MASTER_IDS = [
    "liu-bei",
    "guan-yu",
    "zhang-fei",
    "cao-cao",
    "sun-quan",
    "zhuge-liang",
    "lu-bu",
    "zhou-yu",
    "sima-yi",
]
MAGENTA = (255, 0, 255, 255)


def nn(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    return im.convert("RGBA").resize(size, Image.Resampling.NEAREST)


def chroma_key(im: Image.Image, thresh: int = 72) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # Magenta / hot-pink JPEG backdrop (lossy).
            if r >= 180 and b >= 180 and g <= r - 40 and g <= 170:
                px[x, y] = (0, 0, 0, 0)
    return im


def bbox_opaque(im: Image.Image) -> tuple[int, int, int, int] | None:
    alpha = im.getchannel("A")
    box = alpha.getbbox()
    return box


def fit_subject(im: Image.Image, size: tuple[int, int], headroom: float = 0.08) -> Image.Image:
    keyed = chroma_key(im)
    box = bbox_opaque(keyed)
    if not box:
        return nn(keyed, size)
    x0, y0, x1, y1 = box
    pad = int(max(x1 - x0, y1 - y0) * headroom)
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(keyed.width, x1 + pad)
    y1 = min(keyed.height, y1 + pad)
    crop = keyed.crop((x0, y0, x1, y1))
    tw, th = size
    scale = min(tw / crop.width, th / crop.height)
    nw = max(1, int(crop.width * scale))
    nh = max(1, int(crop.height * scale))
    scaled = nn(crop, (nw, nh))
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.paste(scaled, ((tw - nw) // 2, th - nh), scaled)
    return canvas


def portrait_from_master(im: Image.Image) -> Image.Image:
    keyed = chroma_key(im)
    box = bbox_opaque(keyed)
    if not box:
        return nn(keyed, SIZE["portrait"])
    x0, y0, x1, y1 = box
    h = y1 - y0
    # Upper 55% of the subject (bust).
    y1b = min(keyed.height, y0 + int(h * 0.58))
    pad = int((x1 - x0) * 0.08)
    crop = keyed.crop((max(0, x0 - pad), max(0, y0 - pad), min(keyed.width, x1 + pad), y1b))
    return nn(crop, SIZE["portrait"])


def pack_atlas(cells: list[tuple[str, Image.Image]], cell: tuple[int, int], cols: int, out_png: Path, out_json: Path) -> None:
    cw, ch = cell
    rows = (len(cells) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * cw, rows * ch), (0, 0, 0, 0))
    index: dict = {"cellW": cw, "cellH": ch, "cols": cols, "rowCount": rows, "cells": {}}
    for i, (cid, im) in enumerate(cells):
        col, row = i % cols, i // cols
        sheet.paste(im, (col * cw, row * ch), im)
        index["cells"][cid] = {"col": col, "row": row}
    out_png.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_png)
    out_json.write_text(json.dumps(index, indent=2), encoding="utf-8")
    print("atlas", out_png, "cells", len(cells), "size", sheet.size)


def process_character(cid: str) -> dict[str, Path]:
    src = MASTER_DIR / f"{cid}.png"
    if not src.exists():
        raise FileNotFoundError(src)
    master = Image.open(src)
    PORTRAIT_DIR.mkdir(parents=True, exist_ok=True)
    ACTOR_DIR.mkdir(parents=True, exist_ok=True)
    MAP_DIR.mkdir(parents=True, exist_ok=True)
    portrait = portrait_from_master(master)
    actor = fit_subject(master, SIZE["sceneActor"], 0.06)
    mapping = fit_subject(master, SIZE["mapOfficer"], 0.04)
    actor2 = Image.new("RGBA", SIZE["sceneActor"], (0, 0, 0, 0))
    actor2.paste(actor, (0, -1), actor)
    p_path = PORTRAIT_DIR / f"{cid}.png"
    a0 = ACTOR_DIR / f"{cid}-f0.png"
    a1 = ACTOR_DIR / f"{cid}-f1.png"
    m_path = MAP_DIR / f"{cid}.png"
    portrait.save(p_path)
    actor.save(a0)
    actor2.save(a1)
    mapping.save(m_path)
    print("wrote", cid, portrait.size, actor.size, mapping.size)
    return {"portrait": p_path, "actor0": a0, "actor1": a1, "map": m_path}


def process_still(src: Path, dest: Path, kind: str) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGBA")
    nn(im, SIZE[kind]).save(dest)
    print("still", dest, SIZE[kind])


def main(argv: list[str]) -> int:
    MASTER_DIR.mkdir(parents=True, exist_ok=True)
    portraits: list[tuple[str, Image.Image]] = []
    actors: list[tuple[str, Image.Image]] = []
    maps: list[tuple[str, Image.Image]] = []
    for cid in MASTER_IDS:
        src = MASTER_DIR / f"{cid}.png"
        if not src.exists():
            print("skip missing master", cid, file=sys.stderr)
            continue
        paths = process_character(cid)
        portraits.append((cid, Image.open(paths["portrait"])))
        actors.append((f"{cid}:0", Image.open(paths["actor0"])))
        actors.append((f"{cid}:1", Image.open(paths["actor1"])))
        maps.append((cid, Image.open(paths["map"])))
    if portraits:
        pack_atlas(portraits, SIZE["portrait"], 8, PT / "portrait-atlas.png", PT / "portrait-atlas.index.json")
    if actors:
        pack_atlas(actors, SIZE["sceneActor"], 4, PT / "scene-actors.png", PT / "scene-actors.index.json")
    if maps:
        pack_atlas(maps, SIZE["mapOfficer"], 4, PT / "map-characters.png", PT / "map-characters.index.json")
    raw = PT / "imagine-raw"
    stills = [
        (raw / "v01-e04-banner.jpg", BANNER_DIR / "v01-e04.png", "eventBanner"),
        (raw / "v05-e03-banner.jpg", BANNER_DIR / "v05-e03.png", "eventBanner"),
        (raw / "v26-e01-banner.jpg", BANNER_DIR / "v26-e01.png", "eventBanner"),
        (raw / "taoyuan-bg.jpg", BG_DIR / "taoyuan.png", "sceneBackground"),
        (raw / "hulao-bg.jpg", BG_DIR / "hulao.png", "sceneBackground"),
        (raw / "chibi-bg.jpg", BG_DIR / "chibi.png", "sceneBackground"),
    ]
    for src, dest, kind in stills:
        if src.exists():
            process_still(src, dest, kind)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
