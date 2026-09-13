# Pixel Times asset pipeline

1. **Imagine Image 2.0** paints original masters (magenta backdrop for characters; 16:9 paintings for banners/backgrounds).
2. Save masters to `public/assets/pixel-times/masters/{id}.png` and raw stills to `imagine-raw/`.
3. **Pillow** (`postprocess.py`) chroma-keys, crops, nearest-neighbor resizes, and packs atlases. Code owns final px sizes.

```
python tools/xai-assets/postprocess.py
```

Do not decode KOEI or Yokoyama files.
