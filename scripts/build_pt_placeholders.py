#!/usr/bin/env python3
"""Original Pixel Times stand-in banners/backgrounds (Pillow). Not KOEI/Yokoyama."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BANNER = ROOT / "public" / "assets" / "pixel-times" / "event-banners"
BG = ROOT / "public" / "assets" / "pixel-times" / "scene-backgrounds"
BANNER.mkdir(parents=True, exist_ok=True)
BG.mkdir(parents=True, exist_ok=True)

VOID = (6, 10, 20, 255)
GOLD = (216, 183, 74, 255)
NAVY = (20, 34, 74, 255)
GREEN = (26, 74, 40, 255)
PINK = (196, 110, 130, 255)
PEACH = (232, 168, 150, 255)
STONE = (106, 96, 86, 255)
SEA = (22, 54, 90, 255)
FIRE = (194, 59, 34, 255)
AMBER = (232, 160, 48, 255)
INK = (10, 18, 38, 255)


def nn(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    return im.resize(size, Image.Resampling.NEAREST)


def banner_orchard() -> Image.Image:
    im = Image.new("RGBA", (160, 90), GREEN)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 160, 28), fill=(70, 110, 160, 255))
    for x, y in ((20, 40), (50, 36), (80, 42), (110, 38), (140, 44)):
        d.ellipse((x - 14, y - 12, x + 14, y + 10), fill=(46, 96, 52, 255))
        d.ellipse((x - 8, y - 6, x + 6, y + 4), fill=PINK)
        d.rectangle((x - 2, y + 8, x + 2, y + 28), fill=(74, 48, 28, 255))
    d.ellipse((72, 58, 88, 78), fill=(232, 201, 160, 255))
    d.ellipse((64, 70, 78, 88), fill=(232, 201, 160, 255))
    d.ellipse((82, 70, 96, 88), fill=(210, 170, 130, 255))
    return nn(im, (320, 180))


def banner_pass() -> Image.Image:
    im = Image.new("RGBA", (160, 90), (90, 86, 78, 255))
    d = ImageDraw.Draw(im)
    d.polygon([(0, 90), (40, 20), (70, 90)], fill=STONE)
    d.polygon([(90, 90), (130, 16), (160, 90)], fill=(86, 78, 70, 255))
    d.rectangle((68, 28, 92, 90), fill=(48, 42, 38, 255))
    d.rectangle((74, 44, 86, 90), fill=(20, 16, 14, 255))
    d.rectangle((70, 20, 90, 30), fill=FIRE)
    return nn(im, (320, 180))


def banner_chibi() -> Image.Image:
    im = Image.new("RGBA", (160, 90), SEA)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 160, 22), fill=(18, 28, 48, 255))
    d.rectangle((0, 70, 160, 90), fill=(36, 48, 32, 255))
    d.polygon([(20, 68), (50, 52), (80, 68)], fill=(48, 40, 32, 255))
    for x in (30, 70, 110):
        d.polygon([(x, 60), (x + 18, 48), (x + 28, 62)], fill=(30, 24, 20, 255))
        d.rectangle((x + 10, 40, x + 14, 50), fill=FIRE)
        d.ellipse((x + 6, 28, x + 18, 42), fill=AMBER)
    d.ellipse((100, 20, 140, 48), fill=(40, 40, 44, 180))
    return nn(im, (320, 180))


def bg_taoyuan() -> Image.Image:
    im = Image.new("RGBA", (240, 135), (38, 72, 44, 255))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 240, 40), fill=(110, 150, 190, 255))
    for x in range(16, 230, 28):
        d.ellipse((x - 16, 48, x + 16, 78), fill=(56, 110, 60, 255))
        d.ellipse((x - 8, 58, x + 10, 74), fill=PEACH)
        d.rectangle((x - 2, 74, x + 2, 110), fill=(80, 52, 32, 255))
    d.rectangle((0, 108, 240, 135), fill=(86, 70, 48, 255))
    return nn(im, (480, 270))


def bg_hulao() -> Image.Image:
    im = Image.new("RGBA", (240, 135), (78, 74, 66, 255))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 240, 36), fill=(64, 80, 104, 255))
    d.polygon([(0, 135), (70, 20), (110, 135)], fill=STONE)
    d.polygon([(140, 135), (190, 18), (240, 135)], fill=(70, 64, 58, 255))
    d.rectangle((104, 40, 136, 135), fill=(42, 36, 32, 255))
    d.rectangle((112, 70, 128, 135), fill=INK)
    d.rectangle((108, 32, 132, 44), fill=(140, 50, 36, 255))
    return nn(im, (480, 270))


def bg_chibi() -> Image.Image:
    im = Image.new("RGBA", (240, 135), SEA)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 240, 30), fill=(16, 24, 40, 255))
    d.rectangle((0, 100, 240, 135), fill=(32, 48, 36, 255))
    for x in (40, 100, 160):
        d.polygon([(x, 96), (x + 24, 78), (x + 40, 98)], fill=(28, 22, 18, 255))
        d.rectangle((x + 16, 64, x + 20, 80), fill=FIRE)
        d.ellipse((x + 10, 48, x + 28, 68), fill=AMBER)
    return nn(im, (480, 270))


def frame(im: Image.Image) -> Image.Image:
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, im.width - 1, im.height - 1), outline=INK, width=2)
    d.rectangle((2, 2, im.width - 3, im.height - 3), outline=GOLD, width=1)
    return im


def main() -> None:
    frame(banner_orchard()).save(BANNER / "v01-e04.png")
    frame(banner_pass()).save(BANNER / "v05-e03.png")
    frame(banner_chibi()).save(BANNER / "v26-e01.png")
    bg_taoyuan().save(BG / "taoyuan.png")
    bg_hulao().save(BG / "hulao.png")
    bg_chibi().save(BG / "chibi.png")
    print("wrote", BANNER, "and", BG)


if __name__ == "__main__":
    main()
