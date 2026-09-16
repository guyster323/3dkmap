import { PLACES } from "@/data/places";
import { projectStrategic } from "@/lib/projection";
import type { StrategicEdge, StrategicNode, StrategicTerritory } from "./types";

type NodeSpec = {
  placeId: string;
  tier: 1 | 2 | 3;
  battleMapId?: string;
  /** `projectStrategic` 결과에 더하는 손 보정. 겹침만 푼다. */
  nudge?: readonly [number, number];
};

const NODE_SPECS: NodeSpec[] = [
  { placeId: "luoyang", tier: 1, battleMapId: "luoyang" },
  { placeId: "changan", tier: 1, battleMapId: "changan" },
  { placeId: "xuchang", tier: 1, battleMapId: "xuchang" },
  { placeId: "ye", tier: 1, battleMapId: "ye" },
  { placeId: "zhuo", tier: 2, battleMapId: "zhuo" },
  { placeId: "xuzhou", tier: 2, battleMapId: "xuzhou" },
  { placeId: "xiapi", tier: 2, battleMapId: "xiapi" },
  { placeId: "puyang", tier: 2, battleMapId: "puyang" },
  { placeId: "chenliu", tier: 3, battleMapId: "chenliu" },
  { placeId: "zhongmou", tier: 3 },
  { placeId: "hulao", tier: 2, battleMapId: "hulao" },
  { placeId: "sishui", tier: 3, battleMapId: "sishui", nudge: [16, -8] },
  { placeId: "suanzao", tier: 3, battleMapId: "suanzao", nudge: [8, 0] },
  { placeId: "nanyang", tier: 2, battleMapId: "nanyang", nudge: [-12, -2] },
  { placeId: "wan", tier: 2, battleMapId: "wan", nudge: [14, 2] },
  { placeId: "xiangyang", tier: 2, battleMapId: "xiangyang", nudge: [0, 12] },
  { placeId: "jiangling", tier: 2, battleMapId: "jiangling" },
  { placeId: "chibi", tier: 3, battleMapId: "chibi" },
  { placeId: "jianye", tier: 1, battleMapId: "jianye" },
  { placeId: "shouchun", tier: 2, battleMapId: "shouchun" },
  { placeId: "wu", tier: 2, battleMapId: "wu" },
  { placeId: "kuaiji", tier: 2 },
  { placeId: "changsha", tier: 2, battleMapId: "changsha" },
  { placeId: "chengdu", tier: 1, battleMapId: "chengdu" },
  { placeId: "hanzhong", tier: 2, battleMapId: "hanzhong" },
  { placeId: "jincheng", tier: 2 },
  { placeId: "beihai", tier: 2 },
  { placeId: "pingyuan", tier: 2 },
  { placeId: "guandu", tier: 3, battleMapId: "guandu", nudge: [0, -14] },
  { placeId: "wuzhang", tier: 3, battleMapId: "wuzhang" },
  { placeId: "gongnae", tier: 1, battleMapId: "gongnae" },
  { placeId: "lelange", tier: 2, battleMapId: "lelange" },
  { placeId: "saroguk", tier: 2 },
  { placeId: "geumgwan", tier: 2 },
  { placeId: "que", tier: 3 },
  { placeId: "chaisang", tier: 2 },
  { placeId: "lujiang", tier: 3 },
  { placeId: "xinye", tier: 2, battleMapId: "xinye", nudge: [12, 0] },
  { placeId: "bowang", tier: 3, nudge: [-6, -2] },
  { placeId: "dangyang", tier: 3, battleMapId: "dangyang" },
  { placeId: "xiaopei", tier: 3, battleMapId: "xiaopei" },
  { placeId: "hefei", tier: 2, battleMapId: "hefei", nudge: [-2, 4] },
  { placeId: "xiaoyaojin", tier: 3, nudge: [16, -8] },
  { placeId: "ruxu", tier: 2 },
  { placeId: "jieting", tier: 3, nudge: [10, 0] },
  { placeId: "qishan", tier: 3 },
  { placeId: "chencang", tier: 2 },
  { placeId: "yiling", tier: 3, battleMapId: "yiling" },
  { placeId: "baidi", tier: 2, battleMapId: "baidi" },
  { placeId: "luofeng", tier: 3 },
  { placeId: "jiameng", tier: 2 },
  { placeId: "dingjun", tier: 3, battleMapId: "dingjun", nudge: [0, 16] },
  { placeId: "fancheng", tier: 2, battleMapId: "fancheng", nudge: [0, -8] },
  { placeId: "maicheng", tier: 3, nudge: [14, 0] },
  { placeId: "tongguan", tier: 2, battleMapId: "tongguan" },
  { placeId: "mianzhu", tier: 2 },
  { placeId: "tianshui", tier: 2 },
  { placeId: "jicheng", tier: 3, nudge: [-8, -4] },
  { placeId: "wuchang", tier: 2 },
  { placeId: "hwando", tier: 2, nudge: [-6, -16] },
  { placeId: "xianping", tier: 2 },
];

function buildNodes(): StrategicNode[] {
  const byId = new Map(PLACES.map((p) => [p.id, p]));
  return NODE_SPECS.map((spec) => {
    const place = byId.get(spec.placeId);
    if (!place) {
      throw new Error(`strategic node placeId not in places.ts: ${spec.placeId}`);
    }
    const projected = projectStrategic(place.lon, place.lat);
    const [dx, dy] = spec.nudge ?? [0, 0];
    const node: StrategicNode = {
      placeId: spec.placeId,
      x: Math.round(projected.x + dx),
      y: Math.round(projected.y + dy),
      tier: spec.tier,
    };
    if (spec.battleMapId) node.battleMapId = spec.battleMapId;
    return node;
  });
}

export const STRATEGIC_NODES: StrategicNode[] = buildNodes();

export const STRATEGIC_EDGES: StrategicEdge[] = [
  // 관중–중원 대로. 낙양–호로관–산조.
  { from: "changan", to: "tongguan", kind: "pass" },
  { from: "tongguan", to: "luoyang", kind: "road" },
  { from: "luoyang", to: "hulao", kind: "pass" },
  { from: "hulao", to: "sishui", kind: "pass" },
  { from: "hulao", to: "suanzao", kind: "road" },
  { from: "luoyang", to: "zhongmou", kind: "road" },
  { from: "zhongmou", to: "xuchang", kind: "road" },
  { from: "zhongmou", to: "guandu", kind: "road" },
  { from: "luoyang", to: "chenliu", kind: "road" },
  { from: "chenliu", to: "suanzao", kind: "road" },
  { from: "chenliu", to: "xuchang", kind: "road" },
  { from: "suanzao", to: "puyang", kind: "road" },
  { from: "guandu", to: "suanzao", kind: "road" },

  // 하북
  { from: "puyang", to: "ye", kind: "road" },
  { from: "ye", to: "pingyuan", kind: "road" },
  { from: "pingyuan", to: "zhuo", kind: "road" },
  { from: "pingyuan", to: "beihai", kind: "road" },
  { from: "ye", to: "zhuo", kind: "road" },

  // 서주
  { from: "xuchang", to: "xiaopei", kind: "road" },
  { from: "xiaopei", to: "xuzhou", kind: "road" },
  { from: "xuzhou", to: "xiapi", kind: "road" },
  { from: "xiaopei", to: "xiapi", kind: "road" },
  { from: "puyang", to: "xiaopei", kind: "road" },

  // 남양–형주
  { from: "xuchang", to: "wan", kind: "road" },
  { from: "wan", to: "nanyang", kind: "road" },
  { from: "wan", to: "bowang", kind: "road" },
  { from: "bowang", to: "xinye", kind: "road" },
  { from: "xinye", to: "xiangyang", kind: "road" },
  { from: "wan", to: "xiangyang", kind: "road" },
  { from: "xiangyang", to: "fancheng", kind: "road" },
  { from: "xiangyang", to: "dangyang", kind: "road" },
  { from: "dangyang", to: "maicheng", kind: "road" },
  { from: "dangyang", to: "jiangling", kind: "road" },
  { from: "xiangyang", to: "jiangling", kind: "road" },
  { from: "fancheng", to: "xinye", kind: "road" },

  // 장강 수로
  { from: "chengdu", to: "baidi", kind: "river" },
  { from: "baidi", to: "yiling", kind: "river" },
  { from: "yiling", to: "jiangling", kind: "river" },
  { from: "jiangling", to: "chibi", kind: "river" },
  { from: "chibi", to: "wuchang", kind: "river" },
  { from: "wuchang", to: "chaisang", kind: "river" },
  { from: "chaisang", to: "lujiang", kind: "river" },
  { from: "lujiang", to: "ruxu", kind: "river" },
  { from: "ruxu", to: "jianye", kind: "river" },
  { from: "chaisang", to: "changsha", kind: "river" },

  // 강동
  { from: "jianye", to: "que", kind: "road" },
  { from: "que", to: "wu", kind: "road" },
  { from: "wu", to: "kuaiji", kind: "road" },
  { from: "jianye", to: "hefei", kind: "road" },
  { from: "hefei", to: "xiaoyaojin", kind: "road" },
  { from: "hefei", to: "ruxu", kind: "road" },
  { from: "hefei", to: "shouchun", kind: "road" },
  { from: "shouchun", to: "xuchang", kind: "road" },
  { from: "lujiang", to: "hefei", kind: "road" },
  { from: "jianye", to: "shouchun", kind: "road" },

  // 촉도·한중·농서
  { from: "changan", to: "hanzhong", kind: "pass" },
  { from: "hanzhong", to: "chengdu", kind: "pass" },
  { from: "changan", to: "chencang", kind: "road" },
  { from: "chencang", to: "hanzhong", kind: "pass" },
  { from: "chencang", to: "wuzhang", kind: "road" },
  { from: "hanzhong", to: "dingjun", kind: "road" },
  { from: "hanzhong", to: "jiameng", kind: "pass" },
  { from: "jiameng", to: "chengdu", kind: "pass" },
  { from: "jiameng", to: "luofeng", kind: "road" },
  { from: "luofeng", to: "mianzhu", kind: "road" },
  { from: "mianzhu", to: "chengdu", kind: "road" },
  { from: "chencang", to: "tianshui", kind: "road" },
  { from: "tianshui", to: "jincheng", kind: "road" },
  { from: "qishan", to: "jieting", kind: "road" },
  { from: "jieting", to: "tianshui", kind: "road" },
  { from: "tianshui", to: "jicheng", kind: "road" },
  { from: "qishan", to: "tianshui", kind: "road" },
  { from: "hanzhong", to: "qishan", kind: "pass" },

  // 한반도. 군현·도읍 사이 기록된 길만. 내륙을 잇지 않는다.
  { from: "gongnae", to: "hwando", kind: "road" },
  { from: "gongnae", to: "xianping", kind: "road" },
  { from: "xianping", to: "lelange", kind: "road" },
  { from: "saroguk", to: "geumgwan", kind: "road" },
];

const nodeIds = new Set(STRATEGIC_NODES.map((n) => n.placeId));
for (const edge of STRATEGIC_EDGES) {
  if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
    throw new Error(`strategic edge endpoints missing: ${edge.from}–${edge.to}`);
  }
}

/**
 * 세력 경계는 연표 근거가 분명한 해만 둔다.
 * 현재 저작 근거가 부족하므로 비운다. 날조하지 않는다.
 */
export const STRATEGIC_TERRITORIES: StrategicTerritory[] = [];
