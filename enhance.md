# enhance.md

Canonical direction: `docs/codex-astra-direction.md`
Source: Codex CLI **gpt-6-astra xhigh** (`ctx_8eb13562c112`, run `run_5f286003120f`).
Target: `repo/Prompt.md` + `repo/Codex 이미지 2026년 9월 12일 오후 11_01_23.png` + `...11_01_37.png`.

Older `docs/codex-ux-advice.md` is composition-only and stale for current `/world` (map-as-stage is already done).

Model id is `gpt-6-astra`, not `astra`.

## P0 implemented (HUD / camera)

1. **Map is the stage.** `/world` is `h-dvh` overflow hidden. Map `fill` covers the viewport (1000:700, no stretch). Header, trees, chronicle overlay the map at every width.
2. **Two-row rail.** Brand + chapter title + ▶ / ▶▶▶ on row 1; chapter marks, quote plate, mature toggle on row 2. No playback. No 「시계 정지」.
3. **Left trees as HUD.** Four groups, one open. Mobile: 책/지역/사건/인물 strip; panel drops over the map.
4. **Banners.** Max 1–2; primary card, secondary compact; leader in map space; no HUD-% clamp.
5. **Camera.** Cover pan clamp is ±(display-viewport)/2 so 국내성 can enter the safe area. Off-graph ids (도원, 기주) resolve to the nearest strategic node.

## Still P0 (map art)

Coast/river/city-tier density vs Codex mock; remaining unique officer faces.

## Also shipped (not from Codex)

Unique Imagine faces so 영제/헌제/초선 are not hue-shifted 조조.

## Do not

- Merge to `master`.
- Add autoplay/speed.
- Invent Korean battles.
