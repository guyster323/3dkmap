#!/usr/bin/env python3
"""Refuse to invent remaining faces from templates. Masters must already exist."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHARS = ROOT / "src" / "data" / "characters.ts"
MASTER = ROOT / "public" / "assets" / "pixel-times" / "masters"


def parse_chars() -> list[str]:
    text = CHARS.read_text(encoding="utf-8")
    return re.findall(r'id: "([^"]+)"', text)


def main() -> None:
    for cid in parse_chars():
        dest = MASTER / f"{cid}.png"
        if dest.exists():
            continue
        print("skip", cid, "unique Imagine master required")


if __name__ == "__main__":
    main()
