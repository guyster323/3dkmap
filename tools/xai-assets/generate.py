#!/usr/bin/env python3
"""Pixel Times Imagine prompt runner.

In-session Grok Imagine is the generator. This file owns prompt text and
optional HTTP fallback when XAI_API_KEY is set. It never chooses final px sizes.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PROMPTS = Path(__file__).resolve().parent / "prompts"
MANIFESTS = Path(__file__).resolve().parent / "manifests"

STYLE = (
    "Original 16-bit SNES strategy-RPG pixel art, 1-pixel navy outlines, "
    "upper-left lighting, limited muted palette, no photorealism, no anime, "
    "no text, no KOEI or manga copies."
)


def load_prompts() -> dict:
    p = PROMPTS / "masters.json"
    return json.loads(p.read_text(encoding="utf-8"))


def print_plan() -> None:
    data = load_prompts()
    print("masters", len(data.get("characters", [])))
    print("families", list(data.get("families", {}).keys()))
    print("postprocess: python tools/xai-assets/postprocess.py")
    print("world map: python scripts/build_world_map.py")
    key = os.environ.get("XAI_API_KEY")
    print("XAI_API_KEY", "set" if key else "unset (use in-session Imagine)")


def main(argv: list[str]) -> int:
    print_plan()
    MANIFESTS.mkdir(parents=True, exist_ok=True)
    (MANIFESTS / "last-plan.json").write_text(
        json.dumps({"ok": True, "api": bool(os.environ.get("XAI_API_KEY"))}, indent=2),
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
