#!/usr/bin/env python3
"""Check authored battle maps: 18x24 and TERRAIN_CHAR only."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHARS = set(".,=_TnA~s-+#DKC|^")
text = (ROOT / "src" / "data" / "terrain" / "battle-maps.ts").read_text(encoding="utf-8")
places = set(re.findall(r'id: "([^"]+)"', (ROOT / "src" / "data" / "places.ts").read_text(encoding="utf-8")))
blocks = re.findall(r'const (\w+) = battleMap\(\{([\s\S]*?)\n\}\);', text)
print("maps", len(blocks))
fails = 0
for name, body in blocks:
    mid = re.search(r'id: "([^"]+)"', body)
    pid = re.search(r'placeId: "([^"]+)"', body)
    grid = re.search(r"grid: \[([\s\S]*?)\],", body)
    if not mid or not pid or not grid:
        print("FAIL", name, "parse")
        fails += 1
        continue
    rows = re.findall(r'"([^"]+)"', grid.group(1))
    bad = []
    if len(rows) != 18:
        bad.append(f"rows {len(rows)}")
    for i, row in enumerate(rows):
        if len(row) != 24:
            bad.append(f"row{i} len {len(row)}")
        for ch in row:
            if ch not in CHARS:
                bad.append(f"char {ch!r}")
    if pid.group(1) not in places:
        bad.append("place missing")
    if bad:
        print("FAIL", mid.group(1), " ".join(bad))
        fails += 1
    else:
        print("OK  ", mid.group(1), "place", pid.group(1))
print("fails", fails)
raise SystemExit(fails)
