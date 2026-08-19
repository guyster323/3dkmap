export type EraDate = {
  year: number;
  month?: number;
  day?: number;
  season?: "spring" | "summer" | "autumn" | "winter";
  nianhao?: string;
};

export type SourceKind = "연의" | "정사" | "자치통감" | "후한서" | "삼국사기" | "삼국유사" | "주석";

export type SourceRef = {
  kind: SourceKind;
  ref: string;
};

export type RegionId =
  | "zhongyuan"
  | "hebei"
  | "jiangdong"
  | "shu"
  | "xiliang"
  | "naman"
  | "korea"
  | "other";

export type FactionId =
  | "han"
  | "yellow"
  | "dong"
  | "cao"
  | "liu"
  | "sun"
  | "yuan-shao"
  | "yuan-shu"
  | "lu-bu"
  | "gongsun"
  | "tao"
  | "goguryeo"
  | "mahan"
  | "jinhan"
  | "byeonhan"
  | "lelange"
  | "other";

export type PlaceKind = "city" | "battlefield" | "pass" | "river" | "region" | "palace";

export type Place = {
  id: string;
  nameKo: string;
  nameHanja: string;
  modernName: string;
  lon: number;
  lat: number;
  kind: PlaceKind;
  region: RegionId;
  note?: string;
};

export type Character = {
  id: string;
  nameKo: string;
  nameHanja: string;
  courtesy?: string;
  faction: FactionId;
  portrait?: string;
  bioFamily: string;
  bioFull?: string;
  firstVolume: number;
};

export type Episode = {
  id: string;
  volume: number;
  order: number;
  title: string;
  aliases: string[];
  plotFamily: string;
  plotFull?: string;
  timeStart: EraDate;
  timeEnd: EraDate;
  characterIds: string[];
  placeIds: string[];
  sources: SourceRef[];
  complete: boolean;
};

export type Volume = {
  number: number;
  title: string;
  yearStart: number;
  yearEnd: number;
  blurb: string;
  complete: boolean;
  cover?: string;
};

export type WorldEvent = {
  id: string;
  timeStart: EraDate;
  timeEnd: EraDate;
  region: RegionId;
  placeId?: string;
  headline: string;
  bodyFamily: string;
  bodyFull?: string;
  sources: SourceRef[];
  relatedEpisodeId?: string;
  importance: 1 | 2 | 3 | 4 | 5;
  estimated?: boolean;
  characterIds?: string[];
};

export type KoreaZone = {
  id: string;
  nameKo: string;
  nameHanja: string;
  regionHint: string;
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  provinces: string[];
};

export const REGION_LABEL: Record<RegionId, string> = {
  zhongyuan: "중원",
  hebei: "하북",
  jiangdong: "강동",
  shu: "서촉·익주",
  xiliang: "서량·관중",
  naman: "남만",
  korea: "한반도",
  other: "그 밖",
};

export const FACTION_LABEL: Record<FactionId, string> = {
  han: "후한",
  yellow: "황건",
  dong: "동탁",
  cao: "조조",
  liu: "유비",
  sun: "손씨",
  "yuan-shao": "원소",
  "yuan-shu": "원술",
  "lu-bu": "여포",
  gongsun: "공손찬",
  tao: "도겸",
  goguryeo: "고구려",
  mahan: "마한",
  jinhan: "진한",
  byeonhan: "변한",
  lelange: "낙랑·대방",
  other: "그 밖",
};
