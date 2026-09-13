#!/usr/bin/env python3
"""Give every remaining character a Pixel Times portrait/actor/map cell.

Uses faction template masters + unique hash recolor/stamp. Not the old kao compositor.
"""
from __future__ import annotations

import hashlib
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
CHARS = ROOT / "src" / "data" / "characters.ts"
PT = ROOT / "public" / "assets" / "pixel-times"
MASTER = PT / "masters"

TEMPLATE = {
    "liu": "liu-bei",
    "cao": "cao-cao",
    "sun": "sun-quan",
    "han": "cao-cao",
    "dong": "dong-zhuo",
    "lu-bu": "lu-bu",
    "yuan-shao": "yuan-shao",
    "yuan-shu": "yuan-shao",
    "yellow": "zhang-jiao",
    "goguryeo": "sima-yi",
    "other": "zhuge-liang",
}


def parse_chars() -> list[tuple[str, str]]:
    text = CHARS.read_text(encoding="utf-8")
    ids = re.findall(r'id: "([^"]+)"', text)
    factions = re.findall(r'faction: "([^"]+)"', text)
    return list(zip(ids, factions))


def hsh(s: str) -> int:
    return int(hashlib.sha1(s.encode()).hexdigest()[:8], 16)


def variant(cid: str, faction: str) -> None:
    dest = MASTER / f"{cid}.png"
    if dest.exists():
        return
    base_id = TEMPLATE.get(faction, "zhuge-liang")
    src = MASTER / f"{base_id}.png"
    if not src.exists():
        print("skip no template", cid)
        return
    im = Image.open(src).convert("RGBA")
    n = hsh(cid)
    hue = ImageEnhance.Color(im).enhance(0.85 + (n % 40) / 100)
    bright = ImageEnhance.Brightness(hue).enhance(0.9 + (n % 25) / 100)
    out = bright
    if n & 1:
        r, g, b, a = out.split()
        out = Image.merge("RGBA", (g, r, b, a))
    d = ImageDraw.Draw(out)
    # unique headgear tick so they are not identical copies
    d.rectangle((8 + n % 12, 8, 20 + n % 12, 14), fill=(216, 183, 74, 255))
    out.save(dest)
    print("variant", cid, "from", base_id)


def main() -> None:
    for cid, fac in parse_chars():
        variant(cid, fac)


if __name__ == "__main__":
    main()
