#!/usr/bin/env python3
"""Unique original 320x180 banners for every WorldEvent. Does not edit events.ts."""
from __future__ import annotations

import hashlib
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
EVENTS = ROOT / "src" / "data" / "events.ts"
BG = ROOT / "public" / "assets" / "pixel-times" / "scene-backgrounds"
BANNER = ROOT / "public" / "assets" / "pixel-times" / "event-banners"
OUT_TS = ROOT / "src" / "data" / "pixel-times" / "event-visuals-generated.ts"
BANNER.mkdir(parents=True, exist_ok=True)

FAMILIES = [
    BG / "taoyuan.png",
    BG / "hulao.png",
    BG / "chibi.png",
]
PLACE_NODE = {
    "jizhou": "ye",
    "qingzhou": "beihai",
    "youzhou": "zhuo",
    "yizhou": "chengdu",
    "xiliang": "jincheng",
    "naman": "yunnan",
    "taoyuan": "zhuo",
    "dangyang": "xiangyang",
    "longzhong": "xiangyang",
}

GOLD = (216, 183, 74, 255)
INK = (10, 18, 38, 255)
NAVY = (20, 34, 74, 220)


def parse_events() -> list[dict]:
    text = EVENTS.read_text(encoding="utf-8")
    blocks = re.split(r"\n  \{\n", text)[1:]
    out = []
    for b in blocks:
        eid = re.search(r'id: "([^"]+)"', b)
        year = re.search(r"year: (\d+)", b)
        place = re.search(r'placeId: "([^"]+)"', b)
        head = re.search(r'headline: "([^"]+)"', b)
        imp = re.search(r"importance: (\d+)", b)
        if not eid:
            continue
        out.append(
            {
                "id": eid.group(1),
                "year": int(year.group(1)) if year else 184,
                "placeId": place.group(1) if place else "luoyang",
                "headline": head.group(1) if head else eid.group(1),
                "importance": int(imp.group(1)) if imp else 3,
            }
        )
    return out


def hsh(s: str) -> int:
    return int(hashlib.sha1(s.encode()).hexdigest()[:8], 16)


def paint_banner(ev: dict, families: list[Image.Image]) -> Image.Image:
    n = hsh(ev["id"])
    src = families[n % len(families)]
    w, h = src.size
    x0 = n % max(1, w - 240)
    y0 = (n // 7) % max(1, h - 140)
    crop = src.crop((x0, y0, min(w, x0 + 280), min(h, y0 + 160))).resize((320, 180), Image.Resampling.NEAREST)
    im = crop.convert("RGBA")
    # unique grade per event
    px = im.load()
    dr, dg, db = (n >> 3) & 31, (n >> 8) & 31, (n >> 13) & 31
    for y in range(180):
        for x in range(320):
            r, g, b, a = px[x, y]
            px[x, y] = (
                min(255, max(0, r + dr - 15)),
                min(255, max(0, g + dg - 15)),
                min(255, max(0, b + db - 15)),
                a,
            )
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 319, 179), outline=INK, width=3)
    d.rectangle((3, 3, 316, 176), outline=GOLD, width=1)
    d.rectangle((8, 148, 312, 172), fill=NAVY)
    title = ev["headline"].split("—")[0].strip()[:18]
    d.text((14, 152), f"{ev['year']}  {title}", fill=GOLD)
    return im


def main() -> None:
    events = parse_events()
    families = [Image.open(p).convert("RGBA") for p in FAMILIES if p.exists()]
    if not families:
        raise SystemExit("missing scene backgrounds")
    lines = [
        "/** Generated banners for every WorldEvent. Do not edit events.ts. */",
        "import type { EventVisual } from \"./event-visuals\";",
        "",
        "export const GENERATED_EVENT_VISUALS: Record<string, EventVisual> = {",
    ]
    for ev in events:
        dest = BANNER / f"{ev['id']}.png"
        paint_banner(ev, families).save(dest)
        node = PLACE_NODE.get(ev["placeId"], ev["placeId"])
        title = ev["headline"].split("—")[0].strip()
        summary = ev["headline"].replace('"', '\\"')
        lines.append(f'  "{ev["id"]}": {{')
        lines.append(f'    id: "{ev["id"]}",')
        lines.append(f'    eventId: "{ev["id"]}",')
        lines.append(f'    placeId: "{ev["placeId"]}",')
        if node != ev["placeId"]:
            lines.append(f'    mapPlaceId: "{node}",')
        lines.append(f'    dateLabel: "{ev["year"]}년",')
        lines.append(f'    title: "{title}",')
        lines.append(f'    summary: "{summary}",')
        lines.append(f'    importance: {ev["importance"]} as 1 | 2 | 3 | 4 | 5,')
        lines.append(f'    art: {{ idle: "/assets/pixel-times/event-banners/{ev["id"]}.png" }},')
        lines.append("  },")
        print("banner", ev["id"])
    lines.append("};")
    OUT_TS.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("wrote", OUT_TS, "count", len(events))


if __name__ == "__main__":
    main()
