import { BATTLE_MAPS } from "./battle-maps";
import type { BattleMap } from "./types";

export {
  TERRAIN_CHAR,
  type TerrainChar,
  type TerrainKind,
  type BattleMap,
  type BattleMapMarker,
  type StrategicNode,
  type StrategicEdge,
  type StrategicTerritory,
} from "./types";
export { BATTLE_MAPS } from "./battle-maps";
export { STRATEGIC_NODES, STRATEGIC_EDGES, STRATEGIC_TERRITORIES } from "./strategic";

/** 저작된 전투맵. 없으면 null (절차적 fallback 은 WP4). */
export function getBattleMap(placeId: string): BattleMap | null {
  return BATTLE_MAPS.find((m) => m.placeId === placeId) ?? null;
}
