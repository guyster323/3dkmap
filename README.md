# Pixel Times

인터랙티브 역사 시각 연표. 요코야마 미츠테루 『전략 삼국지』가 다루는 시대를, 오리지널 픽셀 아트와 사료 레이어로 봅니다. 턴제 전투 게임이 아닙니다. **지도가 주인공**입니다.

이전 작업 제목 천하동시는 이 앱의 전신입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000

- 시작: 책 스캔 또는 권 고르기
- 세계: 정지된 에피소드 시각의 동시 전장 (재생·배속 없음). ▶ 다음 장, ▶▶▶ 다음 권
- 사건 배너: 클릭하면 이벤트 장면 (대사·제자리 동작). 닫으면 지도로 복귀
- 내 위치: GPS 또는 도시 선택 → 동시대 한반도
- 목차: 60권 Plot·인물·동시 사건

## 원칙

- 만화 작화·대사, KOEI 영걸전/조조전 원본 픽셀을 쓰지 않음
- 본문은 연의 / 정사 / 자치통감 / 후한서 / 삼국사기 레이어
- 기본은 가족용 요약, 「본편 수위」에서만 잔혹 기록
- 기록이 없는 해의 한반도는 날조하지 않음
- 보호 카탈로그 7개 파일은 읽기 전용. 시각 데이터는 `src/data/pixel-times/` 사이드카

## 에셋 파이프라인

Grok Imagine Image 2.0이 원화를 그리고, `tools/xai-assets/postprocess.py`(Pillow, nearest-neighbor)가 최종 크기를 고정합니다.

```bash
python tools/xai-assets/postprocess.py
npm run build
npm run lint
npm run verify   # localhost:3000 이 떠 있어야 함
```

자세한 구현은 `docs/PIXEL-TIMES-IMPLEMENTATION-REPORT.md`.
