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
  "v05-e03": {
    id: "v05-e03",
    episodeId: "v05-e03",
    title: "호로관의 여포",
    background: "/assets/pixel-times/scene-backgrounds/hulao.png",
    actors: [
      { id: "lu-bu", characterId: "lu-bu", col: 12, row: 6, dir: 1 },
      { id: "zhang-fei", characterId: "zhang-fei", col: 6, row: 10, dir: 0 },
      { id: "guan-yu", characterId: "guan-yu", col: 8, row: 10, dir: 0 },
      { id: "liu-bei", characterId: "liu-bei", col: 10, row: 10, dir: 0 },
    ],
    timeline: [
      { t: "enter", actorId: "lu-bu", col: 12, row: 6, dir: 1 },
      { t: "enter", actorId: "zhang-fei", col: 6, row: 10, dir: 0 },
      { t: "enter", actorId: "guan-yu", col: 8, row: 10, dir: 0 },
      { t: "enter", actorId: "liu-bei", col: 10, row: 10, dir: 0 },
      {
        t: "speak",
        actorId: "lu-bu",
        name: "여포",
        body: "관문 앞에 누가 서든 한칼이다. 세 사람이 한꺼번에 와도 마찬가지다.",
        sources: [{ kind: "연의", ref: "제5회 삼영전여포" }],
      },
      {
        t: "speak",
        actorId: "zhang-fei",
        name: "장비",
        body: "그 말은 여기까지다. 호로관에서 네 방천극을 받아 주마.",
        sources: [{ kind: "연의", ref: "제5회" }],
      },
    ],
  },
  "v26-e01": {
    id: "v26-e01",
    episodeId: "v26-e01",
    eventId: "ev-208-chibi",
    title: "장강이 불타다",
    background: "/assets/pixel-times/scene-backgrounds/chibi.png",
    actors: [
      { id: "zhou-yu", characterId: "zhou-yu", col: 5, row: 9, dir: 0 },
      { id: "huang-gai", characterId: "huang-gai", col: 8, row: 9, dir: 0 },
      { id: "cao-cao", characterId: "cao-cao", col: 16, row: 7, dir: 1 },
    ],
    timeline: [
      { t: "enter", actorId: "zhou-yu", col: 5, row: 9, dir: 0 },
      { t: "enter", actorId: "huang-gai", col: 8, row: 9, dir: 0 },
      { t: "enter", actorId: "cao-cao", col: 16, row: 7, dir: 1 },
      {
        t: "speak",
        actorId: "zhou-yu",
        name: "주유",
        body: "바람이 동에서 온다. 화공을 쓸 자리는 여기다.",
        sources: [
          { kind: "정사", ref: "오서 주유전" },
          { kind: "자치통감", ref: "권65 적벽" },
        ],
      },
      {
        t: "speak",
        actorId: "cao-cao",
        name: "조조",
        body: "연환은 파도를 가라앉히려 한 수였다. 불이 옮으면 배가 오히려 덫이 된다.",
        sources: [{ kind: "정사", ref: "위서 무제기" }],
      },
    ],
  },
  "v01-e01": {
    id: "v01-e01",
    episodeId: "v01-e01",
    eventId: "ev-184-yellow-jizhou",
    title: "창천이 이미 죽다",
    background: "/assets/pixel-times/scene-backgrounds/yellow-turban.png",
    actors: [
      { id: "zhang-jiao", characterId: "zhang-jiao", col: 8, row: 8, dir: 0 },
      { id: "cao-cao", characterId: "cao-cao", col: 14, row: 9, dir: 1 },
    ],
    timeline: [
      { t: "enter", actorId: "zhang-jiao", col: 8, row: 8, dir: 0 },
      { t: "enter", actorId: "cao-cao", col: 14, row: 9, dir: 1 },
      {
        t: "speak",
        actorId: "zhang-jiao",
        name: "장각",
        body: "창천은 이미 죽었다. 황천이 설 것이다. 기주에서 깃발을 올린다.",
        sources: [{ kind: "후한서", ref: "효영제기" }],
      },
      {
        t: "speak",
        actorId: "cao-cao",
        name: "조조",
        body: "조정은 장군을 급히 보낸다. 누런 수건이 군현을 넘기 전에 끊어야 한다.",
        sources: [{ kind: "정사", ref: "위서 무제기" }],
      },
    ],
  },
  "v06-e01": {
    id: "v06-e01",
    episodeId: "v06-e01",
    eventId: "ev-190-burn",
    title: "낙양을 불태우다",
    background: "/assets/pixel-times/scene-backgrounds/luoyang-fire.png",
    actors: [
      { id: "dong-zhuo", characterId: "dong-zhuo", col: 10, row: 8, dir: 0 },
    ],
    timeline: [
      { t: "enter", actorId: "dong-zhuo", col: 10, row: 8, dir: 0 },
      {
        t: "speak",
        actorId: "dong-zhuo",
        name: "동탁",
        body: "천도를 명한다. 낙양은 비우고, 재는 제후에게 남겨 두라.",
        sources: [{ kind: "후한서", ref: "동탁전" }],
      },
    ],
  },
  "v16-e03": {
    id: "v16-e03",
    episodeId: "v16-e03",
    eventId: "ev-200-guandu",
    title: "오소의 불",
    background: "/assets/pixel-times/scene-backgrounds/wucao.png",
    actors: [
      { id: "cao-cao", characterId: "cao-cao", col: 7, row: 8, dir: 0 },
      { id: "yuan-shao", characterId: "yuan-shao", col: 14, row: 8, dir: 1 },
    ],
    timeline: [
      { t: "enter", actorId: "cao-cao", col: 7, row: 8, dir: 0 },
      { t: "enter", actorId: "yuan-shao", col: 14, row: 8, dir: 1 },
      {
        t: "speak",
        actorId: "cao-cao",
        name: "조조",
        body: "오소의 창고가 타면 하북의 숨이 끊긴다. 오늘 밤 기병만 데려간다.",
        sources: [{ kind: "정사", ref: "위서 무제기" }],
      },
      {
        t: "speak",
        actorId: "yuan-shao",
        name: "원소",
        body: "허유가 말을 흘렸다. 군심이 흔들리면 황하를 건너야 한다.",
        sources: [{ kind: "자치통감", ref: "권63" }],
      },
    ],
  },
  "v21-e02": {
    id: "v21-e02",
    episodeId: "v21-e02",
    eventId: "ev-207-longzhong",
    title: "융중대",
    background: "/assets/pixel-times/scene-backgrounds/longzhong.png",
    actors: [
      { id: "liu-bei", characterId: "liu-bei", col: 7, row: 9, dir: 0 },
      { id: "zhuge-liang", characterId: "zhuge-liang", col: 12, row: 9, dir: 1 },
    ],
    timeline: [
      { t: "enter", actorId: "liu-bei", col: 7, row: 9, dir: 0 },
      { t: "enter", actorId: "zhuge-liang", col: 12, row: 9, dir: 1 },
      {
        t: "speak",
        actorId: "zhuge-liang",
        name: "제갈량",
        body: "북으로 조조를 막고, 동으로 손권과 화친하며, 익주를 취하면 천하는 셋이 됩니다.",
        sources: [{ kind: "정사", ref: "촉서 제갈량전 융중대" }],
      },
    ],
  },
  "v23-e02": {
    id: "v23-e02",
    episodeId: "v23-e02",
    eventId: "ev-208-changban",
    title: "조운, 아두를 안다",
    background: "/assets/pixel-times/scene-backgrounds/hulao.png",
    actors: [
      { id: "zhao-yun", characterId: "zhao-yun", col: 10, row: 8, dir: 0 },
      { id: "liu-bei", characterId: "liu-bei", col: 15, row: 9, dir: 1 },
    ],
    timeline: [
      { t: "enter", actorId: "zhao-yun", col: 10, row: 8, dir: 0 },
      { t: "enter", actorId: "liu-bei", col: 15, row: 9, dir: 1 },
      {
        t: "speak",
        actorId: "zhao-yun",
        name: "조운",
        body: "주공의 아들을 찾았습니다. 흩어진 진을 헤치고 여기까지 왔습니다.",
        sources: [{ kind: "정사", ref: "촉서 조운전" }],
      },
    ],
  },
  "v58-e01": {
    id: "v58-e01",
    episodeId: "v58-e01",
    eventId: "ev-234-wuzhang",
    title: "오장원의 진",
    background: "/assets/pixel-times/scene-backgrounds/hulao.png",
    actors: [
      { id: "zhuge-liang", characterId: "zhuge-liang", col: 8, row: 8, dir: 0 },
      { id: "sima-yi", characterId: "sima-yi", col: 14, row: 8, dir: 1 },
    ],
    timeline: [
      { t: "enter", actorId: "zhuge-liang", col: 8, row: 8, dir: 0 },
      { t: "enter", actorId: "sima-yi", col: 14, row: 8, dir: 1 },
      {
        t: "speak",
        actorId: "sima-yi",
        name: "사마의",
        body: "위수 북에서 나가지 않는다. 기다림이 칼보다 길다.",
        sources: [{ kind: "정사", ref: "진서 선제기" }],
      },
    ],
  },
};

export function getEventScene(episodeId: string): EventScene | undefined {
  return EVENT_SCENES[episodeId];
}
