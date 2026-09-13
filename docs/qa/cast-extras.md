# Cast extras — visual QA

Isolated clone `C:\Users\windo\Pixeltimes\3dkmap`, branch `pixel-times-v2`. Inspected the PNG files on disk (masters, portraits, scene-actors f0/f1, map-sprites, packed atlases). Did not commit. Did not touch `C:\Users\windo\3KDmap` or the protected catalogs.

Pipeline: Grok Imagine Image 2.0 `image_gen` (2:3) then `image_edit` from that gen for `lu-bu`, `zhou-yu`, `sima-yi`. Idle frame-2 is a weight-shift `image_edit` of each master, saved under `imagine-raw/{id}-idle-f1.png`. `python tools/xai-assets/postprocess.py` owns final px. Actor f1 was then replaced with `fit_subject` of the idle masters so Pillow still owns 48×64.

## Postprocess declared sizes (stdout)

Every id printed `(64, 80) (48, 64) (32, 64)`:

```
wrote liu-bei (64, 80) (48, 64) (32, 64)
wrote guan-yu (64, 80) (48, 64) (32, 64)
wrote zhang-fei (64, 80) (48, 64) (32, 64)
wrote cao-cao (64, 80) (48, 64) (32, 64)
wrote sun-quan (64, 80) (48, 64) (32, 64)
wrote zhuge-liang (64, 80) (48, 64) (32, 64)
wrote lu-bu (64, 80) (48, 64) (32, 64)
wrote zhou-yu (64, 80) (48, 64) (32, 64)
wrote sima-yi (64, 80) (48, 64) (32, 64)
atlas portrait-atlas.png cells 9 size (512, 160)
atlas scene-actors.png cells 18 size (192, 320)
atlas map-characters.png cells 9 size (128, 192)
```

Corners of keyed portraits/actors are `(0,0,0,0)`.

## New officers (gen + edit)

| id | files | spec / bible | verdict |
|---|---|---|---|
| `lu-bu` | `masters/lu-bu.png` 832×1248; portrait 64×80; actor 48×64×2; map 32×64 | Unbearded oval face, tall magenta plume helm, magenta-desat lamellar, ji-halberd (spear point + side crescent, not 청룡언월), full-body ¾, flat magenta field, 1 px navy outline, UL key, no scenery/text | **PASS with defects** |
| `zhou-yu` | `masters/zhou-yu.png` 832×1248; same LOD sizes | Unbearded refined oval, jinxian with side flaps, 吳 navy scale + gold piping + amber sash, slimmer than 손권, no fan | **PASS with defects** |
| `sima-yi` | `masters/sima-yi.png` 832×1248; same LOD sizes | Gaunt elder, thin brows, narrow eyes, short greying beard, black jinxian, dark 魏 robe over muted crimson, folded hands, not armored | **PASS with defects** |

Hats-off identity (portrait atlas, row 0 cols 6–7 + row 1 col 0 vs 유비/관우/장비/조조/손권/제갈량): 여포 = plume + ji; 주유 = unbearded navy jinxian; 사마의 = grey beard + robe. Readable.

### Defects (not waived)

- **lu-bu.** Eyes larger than the bible’s small-iris rule. Magenta lamellar sits next to the magenta key, so silhouette fringe is worse than the green/crimson masters. First weapon edit grew a goatee (discarded); first idle edit grew a full beard (discarded; f1 is the unbearded retry).
- **zhou-yu.** Eyes still a bit large after the polish edit. Jinxian side flaps are chunky at map 32×64.
- **sima-yi.** Stoop is mild, not the “more stooped than 조조” silhouette note. Elder wrinkles are 1 px-scale, not heavy.

Bible score (important-character 100, inspected LODs together): 여포 ~84, 주유 ~86, 사마의 ~85. None of the three is ≥90. File existence is not a 90.

Original pixels. Not traced from KOEI / Yokoyama. Raw gens: `imagine-raw/{lu-bu,zhou-yu,sima-yi}-gen.jpg`.

## Idle frame-2 (weight shift)

| id | f0 vs f1 at 48×64 | verdict |
|---|---|---|
| `liu-bei` | Weight onto the other foot; turban / short beard / twin swords unchanged | **PASS** |
| `guan-yu` | Stance shifts left; 청룡언월 still in the same hands; red face + long beard hold | **PASS** |
| `zhang-fei` | Pose change is tiny (correct idle energy). `fit_subject` bbox on f1 is slightly tighter (file 5136→4701) | **PASS with defects** |
| `cao-cao` | More than a hip tilt — crouched step, both feet off the original plant | **PASS with defects** |
| `sun-quan` | Wider stance, jewel cap + navy + sash unchanged | **PASS** |
| `zhuge-liang` | Walking-like step; fan stays in the right hand; silk cap ribbons hold | **PASS with defects** |
| `lu-bu` | Unbearded retry; left foot forward; ji + plume hold | **PASS** |
| `zhou-yu` | Left foot forward; navy/gold/jinxian hold | **PASS** |
| `sima-yi` | Left foot forward; robe + grey beard + jinxian hold | **PASS** |

Masters for the original six were not overwritten. Idle raws live only in `imagine-raw/{id}-idle-f1.png`.

## Leftover

- `src/data/pixel-times/character-visuals.ts` `referenceAssets` for the three extras is still empty (out of ownership).
- `MASTER_IDS` / atlas dimensions were already expanded before this dispatch; this run re-baked those atlases.
- No git commit.
