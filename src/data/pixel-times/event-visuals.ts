/** Banner / overlay visuals. Join on episode.id or event.id. */

export type EventBannerStateArt = {
  idle: string;
  hover?: string;
};

export type EventVisual = {
  id: string;
  episodeId?: string;
  eventId?: string;
  placeId: string;
  /** Strategic-node id when placeId is not on the world graph (e.g. taoyuan → zhuo). */
  mapPlaceId?: string;
  dateLabel: string;
  title: string;
  summary: string;
  importance: 1 | 2 | 3 | 4 | 5;
  art: EventBannerStateArt;
};

export const EVENT_VISUALS: Record<string, EventVisual> = {
  "v01-e04": {
    id: "v01-e04",
    episodeId: "v01-e04",
    placeId: "taoyuan",
    mapPlaceId: "zhuo",
    dateLabel: "184년 봄",
    title: "도원결의",
    summary: "탁현 복숭아밭에서 세 사람이 형제를 맺는다. 의식은 연의의 무대다.",
    importance: 5,
    art: { idle: "/assets/pixel-times/event-banners/v01-e04.png" },
  },
  "v05-e03": {
    id: "v05-e03",
    episodeId: "v05-e03",
    placeId: "hulao",
    dateLabel: "190년 봄",
    title: "호로관의 여포",
    summary: "호로관 앞 일기토. 정사에는 이 한판이 없다.",
    importance: 5,
    art: { idle: "/assets/pixel-times/event-banners/v05-e03.png" },
  },
  "v26-e01": {
    id: "v26-e01",
    episodeId: "v26-e01",
    eventId: "ev-208-chibi",
    placeId: "chibi",
    dateLabel: "208년 겨울",
    title: "적벽 대전",
    summary: "장강이 불타고 조조가 북으로 물러난다.",
    importance: 5,
    art: { idle: "/assets/pixel-times/event-banners/v26-e01.png" },
  },
  "v01-e01": {
    id: "v01-e01",
    episodeId: "v01-e01",
    eventId: "ev-184-yellow-jizhou",
    placeId: "jizhou",
    mapPlaceId: "ye",
    dateLabel: "184년 봄",
    title: "창천이 이미 죽다",
    summary: "기주에서 황건이 일어선다. 정사·후한서가 본기다.",
    importance: 5,
    art: { idle: "/assets/pixel-times/event-banners/v01-e01.png" },
  },
  "v06-e01": {
    id: "v06-e01",
    episodeId: "v06-e01",
    eventId: "ev-190-burn",
    placeId: "luoyang",
    dateLabel: "190년",
    title: "낙양을 불태우다",
    summary: "동탁이 천도를 명하고 낙양이 탄다.",
    importance: 5,
    art: { idle: "/assets/pixel-times/event-banners/v06-e01.png" },
  },
  "v16-e03": {
    id: "v16-e03",
    episodeId: "v16-e03",
    eventId: "ev-200-guandu",
    placeId: "guandu",
    dateLabel: "200년 가을",
    title: "오소의 불",
    summary: "관도에서 조조가 원소의 군량을 태운다.",
    importance: 5,
    art: { idle: "/assets/pixel-times/event-banners/v16-e03.png" },
  },
  "v21-e02": {
    id: "v21-e02",
    episodeId: "v21-e02",
    eventId: "ev-207-longzhong",
    placeId: "xiangyang",
    dateLabel: "207년",
    title: "융중대",
    summary: "유비가 공명의 초옥에서 천하삼분을 듣는다.",
    importance: 5,
    art: { idle: "/assets/pixel-times/event-banners/v21-e02.png" },
  },
  "v23-e02": {
    id: "v23-e02",
    episodeId: "v23-e02",
    eventId: "ev-208-changban",
    placeId: "dangyang",
    mapPlaceId: "xiangyang",
    dateLabel: "208년 가을",
    title: "조운, 아두를 안다",
    summary: "장판에서 조운이 유선을 품에 안는다. 정사도 구원을 적는다.",
    importance: 5,
    art: { idle: "/assets/pixel-times/event-banners/v23-e02.png" },
  },
  "v44-e01": {
    id: "v44-e01",
    episodeId: "v44-e01",
    eventId: "ev-222-yiling",
    placeId: "yiling",
    dateLabel: "222년",
    title: "이릉으로",
    summary: "유비가 오를 치러 三峡으로 내려간다.",
    importance: 4,
    art: { idle: "/assets/pixel-times/event-banners/v44-e01.png" },
  },
  "v58-e01": {
    id: "v58-e01",
    episodeId: "v58-e01",
    eventId: "ev-234-wuzhang",
    placeId: "wuzhang",
    dateLabel: "234년",
    title: "오장원의 진",
    summary: "공명이 오장원에 진을 치고 사마의는 위수 북에서 나가지 않는다.",
    importance: 5,
    art: { idle: "/assets/pixel-times/event-banners/v58-e01.png" },
  },
  "ev-184-goguryeo": {
    id: "ev-184-goguryeo",
    eventId: "ev-184-goguryeo",
    placeId: "gongnae",
    dateLabel: "184년",
    title: "국내성의 고국천왕",
    summary: "중원 황건과 같은 구체 교전은 삼국사기에 없다. 왕위만 기록된다.",
    importance: 3,
    art: { idle: "/assets/pixel-times/event-banners/ev-184-goguryeo.png" },
  },
};

export function getEventVisual(id: string): EventVisual | undefined {
  return EVENT_VISUALS[id];
}

export function eventVisualsForEpisode(episodeId: string): EventVisual[] {
  return Object.values(EVENT_VISUALS).filter((v) => v.episodeId === episodeId);
}

export function eventVisualsOnMap(episodeId: string, liveEventIds: string[]): EventVisual[] {
  const ep = eventVisualsForEpisode(episodeId);
  if (ep.length) return ep.slice(0, 2);
  const out: EventVisual[] = [];
  const seen = new Set<string>();
  for (const evId of liveEventIds) {
    const v = Object.values(EVENT_VISUALS).find((x) => x.eventId === evId);
    if (v && !seen.has(v.id)) {
      seen.add(v.id);
      out.push(v);
    }
  }
  return out.sort((a, b) => b.importance - a.importance).slice(0, 2);
}
