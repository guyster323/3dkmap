# Codex UX Advice: Pixel Times `/world`

Scope: compare current `/world` against `Prompt.md` sections 5-8 and 15, plus the two target screenshots in `C:\Users\windo\Pixeltimes\repo`. This is direction only; no app code was changed.

## Target Read

The target product mockup is a dense strategy-game atlas, not a web dashboard. The first read is the illustrated world map: recognizable coastlines, rivers, seas, mountain ranges, cities, armies, ships, faction banners, and event callouts all live in one continuous playfield. UI chrome frames the world, but it does not become the subject.

Key target traits:

- Left side: a branded `Pixel Times` lockup and four compact expandable trees: book, region, event, people. Only the active tree opens deep enough to navigate.
- Top: volume title on the left and a thin episode rail on the right. The timeline reads like chapter marks, not like large cards.
- Map: dominant, geographically legible, richly populated, with Korean peninsula and sea routes visible.
- Event banners: anchored to map locations as story cards with image, date, title, and short summary. They should feel like in-world dispatches, not generic content cards.
- Lower layer: selected-place stats, chronological event list, scene preview, mini-map, and quote panels support the map instead of replacing it.
- Style guide screenshot reinforces square gold/void chrome, 3/4 pixel assets, controlled palette, consistent scale, and a strict ban on SaaS/glass/mobile-game gloss.

## Current `/world` Read

Observed with Playwright at 1440x900 and 375x812 on September 13, 2026.

The current page has the right pieces: left tree dock, top timeline, strategic map canvas, event banners, and a lower-right chronicle. The problem is hierarchy. At desktop size, the top header becomes a large navy slab before the map, the map is boxed as another window, and the left tree plus event list compete with the map instead of acting like HUD chrome. At mobile width, the user sees header controls, timeline, and the full tree stack before the map; once the map appears, the event banner covers a large portion of it.

The visual gap is not only asset quality. It is also composition: the target compresses chrome around a map-first stage, while the current layout stacks interface regions in document order and lets panels consume the first read.

## Priorities

### P0: Make The Map The Stage

Direction:

- Treat the map as the first viewport surface. Remove the map's feeling of being a card inside the page; chrome should float on top of or around the map.
- Preserve a visible map center even when every panel is open. On 1440px desktop, target at least 70% of the viewport as uninterrupted map/art field.
- Keep the header, tree dock, banners, chronicle, and selected-place panels as overlays with reserved collision zones, not stacked blocks that push the map down.
- Use the target composition as the test: the map should still be visually dominant if a screenshot is viewed as a thumbnail.

Current symptoms to fix:

- Header height is too dominant relative to the map.
- The map's outer `.eik-win` frame makes it feel like one panel among many.
- The lower-right chronicle and map banners read as UI blocks laid over the map, not integrated dispatches.

### P0: Compress The Top Timeline

Direction:

- Replace the current large date-centered header feeling with a target-like rail: volume title block at left, thin chapter path across the top, transport controls at far right.
- Keep chapter nodes small and regular. Avoid button-card sizing for every episode; use small markers, labels, and a single active highlight.
- Navigation should remain discrete: previous/next chapter and next volume. Do not add global autoplay, speed, scrubber, or continuous playback semantics.
- Move secondary controls such as family/full text toggles out of the primary timeline row or make them visibly subordinate.

Acceptance heuristic:

- At desktop width, the top band should look closer to a game HUD strip than a web page header.
- At mobile width, the timeline should not occupy the first several scroll heights before the map.

### P0: Rebuild Left Trees As Compact Navigation Chrome

Direction:

- Keep the four tree groups required by `Prompt.md` section 5: `전략 삼국지 책`, `주요 지역`, `주요 사건`, `주요 인물`.
- Use the target's accordion behavior: one expanded tree, compact rows, visible hierarchy, and minimal height.
- The left tree should be a navigation dock over the map, not a full-width content block on mobile by default.
- On desktop, reserve a fixed left rail width similar to the target. On mobile, collapse to a small drawer/tab strip over the map with one-tap access to the four trees.

Current symptoms to fix:

- Mobile shows all four top-level tree headers before the map, which delays the core experience.
- The tree dock uses large 44px rows everywhere; keep touch targets, but reduce visual mass with icon/indent hierarchy and tighter nested rows.

### P1: Make Event Banners Feel Anchored And Valuable

Direction:

- Keep event cards anchored to their map location, but avoid stacking them in ways that cover strategic geography.
- Use a collision strategy: active/nearest event gets full card; secondary events collapse to small flags, date chips, or image thumbnails until selected.
- Match the target banner grammar: image left, date/title/body right, square gold border, dark interior, clear hover/selected state.
- Banner art should read as a scene crop or historical dispatch. Avoid generic or flat-looking crops that do not explain why the event matters.
- When a banner opens a scene, the scene overlay should feel like the target lower scene frame: large enough for characters and dialogue, but still visually connected to the map.

Current symptoms to fix:

- Desktop has one large banner floating near the top center; mobile lets the banner obscure much of the map.
- The banner position algorithm should understand viewport and panel zones, not just clamp by map percentages.

### P1: Add Supporting Panels Without Stealing First Read

Direction:

- Selected place details should behave like the target bottom-left panel: compact title, thumbnail/mini scene, faction/terrain/stat rows, and a short historical note.
- Chronological event list should be a low, compact bottom panel or docked list, not a tall card that competes with the map.
- Consider a mini-map/inset only after the main map is visually strong. It should reinforce geographic orientation, not become another dashboard widget.
- Quote/character panels should appear near the relevant event or scene, not as generic header decoration.

Information hierarchy:

1. World map and current episode context.
2. Current chapter/event highlight.
3. Selected place or active event.
4. Source citations, mature/full-text controls, and secondary metadata.

### P1: Strengthen Pixel-Art Consistency

Direction:

- Keep `imageSmoothingEnabled = false`, DOM map labels, deterministic tile rendering, and integer pixel scaling.
- The current map is geographically useful but visually sparse compared with the target. Increase terrain texture density, forests as crowns, mountain variation, city tier footprints, coast detail, ship routes, and army clusters.
- Capitals and major cities must be visibly larger than minor sites. The target style guide shows city tiers as a core readability device.
- Avoid flat green/brown territory fills that make the map read like a tactical schematic. Territory ownership should be a subtle layer over rich terrain.

Do not solve this by adding more panels. The missing target feel comes from map richness and composition first.

### P2: Mobile Should Start In Map Mode

Direction:

- The first mobile viewport should include the current episode title and an immediate map view.
- Collapse the tree dock and event list by default. Expose them as bottom/side drawers, tabs, or compact icon buttons over the map.
- Make the active event banner selectable but not permanently wide. Use a small anchored marker first; expand to a card or scene only after tap.
- Keep top controls to one compact row: title/current chapter, previous/next, next volume.
- Verify at 375px that text does not force horizontal scrolling, banners do not cover the selected map node, and the user can return to the map after opening a drawer.

Current mobile failure:

- The first screen is mostly header/timeline/tree chrome. The map arrives late and is partly covered by the event banner.

## What To Stop Doing

- Stop treating `/world` as a vertical web document. It should be a map stage with HUD chrome.
- Stop using large window cards for every control. The target uses bordered panels, but their scale is disciplined.
- Stop letting support UI push the map below the fold, especially on mobile.
- Stop adding playback/speed/autoplay concepts. The prompt explicitly wants discrete global map states.
- Stop placing full event cards wherever percentage math happens to land. Banners need collision rules and collapsed states.
- Stop allowing the navy/gold chrome to become the dominant color mass. The target has navy UI, but the dominant palette is terrain, sea, city, fire, banners, and sky/cloud edges.
- Stop using source citations and text toggles as primary controls. They are trust/support layers, not first-read UI.

## Suggested Next Visual QA Gate

Use the `Prompt.md` section 15 rubric after the next visual pass. Capture at 375, 768, 1440, and 1920. Inspect screenshots against the two Pixel Times references before accepting the milestone.

Suggested threshold for the next pass:

- Map dominance: must be the strongest thumbnail read at every width.
- UI chrome consistency: square, gold/void, no glass, no rounded SaaS cards.
- Information hierarchy: user can identify current volume/chapter/event without the header swallowing the map.
- Mobile readability: first viewport includes meaningful map, not only controls.

Rough current risk areas against that rubric:

- Map dominance: medium-low, mostly due to chrome height and sparse terrain.
- UI chrome consistency: medium, stylistically aligned but too heavy in composition.
- Information hierarchy: medium-low, because controls and support text compete with current event/map state.
- Event banner quality: medium-low, because placement and scale obscure the map and do not yet match the target dispatch feel.
- Mobile readability: low, because the map is delayed and occluded.
