# eiketsu atlas

원본 영걸전/조조전 파일을 디코딩하지 않습니다.
규격만 맞춘 오리지널 시트입니다.

| 레이어 | 파일 | 셀 | 출처 규격 |
|---|---|---|---|
| 지형 | tileset.png | 16×16 | HEXBCHP / HEXZCHP / SMAP 타일 |
| 유닛 idle | units.png | 32×64 × 2프레임 | HEXZCHR 줌 캐릭터 |
| 얼굴 | kao.png | 64×80 | FACEDAT kao |

Godot: `tileset.godot.json` 을 TileSet atlas로 임포트 (tile 16, sep 0).
Aseprite: tileset.png 를 16px 그리드로 열기. units.png 는 32×64 그리드, 태그 idle 0-1.
Piskel: units 한 장수 행(32×64 두 칸)을 임포트해 2프레임 양파껍질 idle.

로컬에 Godot/Aseprite/Piskel 바이너리가 없어 이 스크립트가 시트를 생성합니다.
다시 찍으려면: `python scripts/build_eiketsu_atlas.py`
