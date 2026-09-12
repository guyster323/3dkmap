/** Event-scene sidecar. Join on episode.id first (도원결의 has no ev-*). Do not edit episodes.ts. */

import type { SourceRef } from "@/lib/types";

export type SceneOp =
  | { t: "wait"; ms: number }
  | { t: "enter"; actorId: string; col: number; row: number; dir?: 0 | 1 }
  | { t: "exit"; actorId: string }
  | { t: "move"; actorId: string; col: number; row: number }
  | { t: "face"; actorId: string; dir: 0 | 1 }
  | { t: "effect"; kind: "fire" | "smoke" | "banner"; at?: { col: number; row: number } }
  | { t: "speak"; actorId: string; name: string; body: string; sources: SourceRef[] };

export type SceneActor = {
  id: string;
  characterId: string;
  col: number;
  row: number;
  dir: 0 | 1;
};

export type EventScene = {
  id: string;
  episodeId: string;
  eventId?: string;
  title: string;
  background: string;
  actors: SceneActor[];
  timeline: SceneOp[];
};

export const EVENT_SCENES: Record<string, EventScene> = {
  "v01-e04": {
    id: "v01-e04",
    episodeId: "v01-e04",
    title: "도원결의",
    background: "/assets/pixel-times/scene-backgrounds/taoyuan.png",
    actors: [
      { id: "liu-bei", characterId: "liu-bei", col: 6, row: 8, dir: 0 },
      { id: "guan-yu", characterId: "guan-yu", col: 10, row: 8, dir: 1 },
      { id: "zhang-fei", characterId: "zhang-fei", col: 14, row: 8, dir: 1 },
    ],
    timeline: [
      { t: "enter", actorId: "liu-bei", col: 6, row: 8, dir: 0 },
      { t: "enter", actorId: "guan-yu", col: 10, row: 8, dir: 1 },
      { t: "enter", actorId: "zhang-fei", col: 14, row: 8, dir: 1 },
      {
        t: "speak",
        actorId: "liu-bei",
        name: "유비",
        body: "성은 달라도, 죽기는 같은 해 같은 날로 하자. 오늘 이 복숭아밭에서 형제를 맺는다.",
        sources: [{ kind: "연의", ref: "제1회 도원결의" }],
      },
      {
        t: "speak",
        actorId: "guan-yu",
        name: "관우",
        body: "형님을 형으로 모시겠습니다. 한 침상에서 자고 한 상에서 먹던 사이, 이제 이름을 걸겠습니다.",
        sources: [
          { kind: "연의", ref: "제1회" },
          { kind: "정사", ref: "촉서 관우전 — 선주와 침식을 같이하다" },
        ],
      },
      {
        t: "speak",
        actorId: "zhang-fei",
        name: "장비",
        body: "마을 청년들을 모으자. 유주목이 의병을 부르면, 우리 셋이 맨 앞에 선다.",
        sources: [{ kind: "연의", ref: "제1회" }],
      },
      { t: "wait", ms: 400 },
    ],
  },
};

export function getEventScene(episodeId: string): EventScene | undefined {
  return EVENT_SCENES[episodeId];
}
