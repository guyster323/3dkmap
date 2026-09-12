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
};

export function getEventVisual(id: string): EventVisual | undefined {
  return EVENT_VISUALS[id];
}
