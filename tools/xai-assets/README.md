# Pixel Times asset pipeline

1. **Imagine Image 2.0** paints masters (in-session `image_gen` / `image_edit`, or `XAI_API_KEY` HTTP if present).
2. Prompts live in `prompts/masters.json`. `generate.py` prints the plan; it does not pick final px.
3. **Pillow** (`postprocess.py`, `scripts/build_world_map.py`) chroma-keys, crops, nearest-neighbor resizes, packs atlases, paints the world map.

```
python tools/xai-assets/generate.py
python tools/xai-assets/postprocess.py
python scripts/build_world_map.py
```

Do not decode KOEI or Yokoyama files.
