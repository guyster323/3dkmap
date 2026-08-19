import type { KoreaZone } from "./types";

export const KOREA_ZONES: KoreaZone[] = [
  {
    id: "goguryeo",
    nameKo: "고구려",
    nameHanja: "高句麗",
    regionHint: "압록강 중류·국내성 일대",
    bounds: { minLat: 38.5, maxLat: 43.5, minLon: 124.5, maxLon: 129.5 },
    provinces: ["평안", "자강", "양강", "함경", "강원북"],
  },
  {
    id: "lelange",
    nameKo: "낙랑·대방",
    nameHanja: "樂浪·帶方",
    regionHint: "대동강 유역 한 군현",
    bounds: { minLat: 37.6, maxLat: 39.8, minLon: 124.4, maxLon: 126.8 },
    provinces: ["평양", "황해", "남포"],
  },
  {
    id: "mahan",
    nameKo: "마한",
    nameHanja: "馬韓",
    regionHint: "한강·금강 유역, 백제 초창",
    bounds: { minLat: 34.5, maxLat: 38.2, minLon: 126.0, maxLon: 127.8 },
    provinces: [
      "서울",
      "경기",
      "인천",
      "충남",
      "충북",
      "대전",
      "세종",
      "전북",
      "광주",
      "전남",
    ],
  },
  {
    id: "jinhan",
    nameKo: "진한",
    nameHanja: "辰韓",
    regionHint: "낙동강 동쪽, 사로국 일대",
    bounds: { minLat: 35.2, maxLat: 37.2, minLon: 128.2, maxLon: 129.6 },
    provinces: ["경북", "대구", "울산"],
  },
  {
    id: "byeonhan",
    nameKo: "변한",
    nameHanja: "弁韓",
    regionHint: "낙동강 하류·김해 일대",
    bounds: { minLat: 34.6, maxLat: 35.7, minLon: 127.8, maxLon: 129.3 },
    provinces: ["경남", "부산"],
  },
];

export function zoneForCoord(lat: number, lon: number): KoreaZone | null {
  if (lat < 33 || lat > 43.8 || lon < 124 || lon > 132) return null;
  const hits = KOREA_ZONES.filter(
    (z) =>
      lat >= z.bounds.minLat &&
      lat <= z.bounds.maxLat &&
      lon >= z.bounds.minLon &&
      lon <= z.bounds.maxLon,
  );
  if (hits.length === 0) {
    if (lat >= 37.2 && lon >= 126.5 && lon <= 128.2) return KOREA_ZONES[2];
    return KOREA_ZONES[2];
  }
  return hits.sort(
    (a, b) =>
      a.bounds.maxLat -
      a.bounds.minLat +
      (a.bounds.maxLon - a.bounds.minLon) -
      (b.bounds.maxLat - b.bounds.minLat + (b.bounds.maxLon - b.bounds.minLon)),
  )[0];
}

export function zoneByProvince(label: string): KoreaZone | null {
  const hit = KOREA_ZONES.find((z) => z.provinces.some((p) => label.includes(p)));
  return hit ?? null;
}
