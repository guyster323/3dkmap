# eiketsu atlas

원본 영걸전/조조전 파일을 디코딩하지 않습니다. `scripts/build_eiketsu_atlas.py` 가
docs/REDESIGN-EIKETSU.md §3 규격으로 생성한 오리지널 시트입니다.

| 파일 | 셀 | 시트 |
|---|---|---|
| tiles32.png | 32×32 | 16열 × 10행 = 512×320 |
| units.png | 32×64 | 4열 (우f0 우f1 좌f0 좌f1), 행 = 병종×진영 |
| units-officer.png | 32×64 | 4열, 행 = 고유 무장 |
| kao.png | 64×80 | 8열, 파츠 컴포저 |

기존 `tileset.png`(16×16) 과 `.ase` / `.piskel` / godot 사이드카는 남겨 둡니다.
다시 굽기: `python scripts/build_eiketsu_atlas.py`
