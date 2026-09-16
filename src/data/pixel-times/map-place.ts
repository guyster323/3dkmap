import { STRATEGIC_NODES } from "@/data/terrain";
import { getPlace } from "@/lib/content";
import { projectStrategic } from "@/lib/projection";
import { getEpisodeCameraHint } from "./book-timelines";
import { EVENT_VISUALS } from "./event-visuals";

const NODE_IDS = new Set(STRATEGIC_NODES.map((n) => n.placeId));

/** Catalog place id → node on the world graph. Off-graph ids (도원, 기주) map by visual, then nearest lon/lat. */
export function resolveStrategicNodeId(placeId: string | undefined): string | undefined {
  if (!placeId) return undefined;
  if (NODE_IDS.has(placeId)) return placeId;
  const visual = Object.values(EVENT_VISUALS).find((v) => v.placeId === placeId && v.mapPlaceId);
  if (visual?.mapPlaceId && NODE_IDS.has(visual.mapPlaceId)) return visual.mapPlaceId;
  const place = getPlace(placeId);
  if (!place) return undefined;
  const p = projectStrategic(place.lon, place.lat);
  let best: string | undefined;
  let bestD = Infinity;
  for (const n of STRATEGIC_NODES) {
    const dx = n.x - p.x;
    const dy = n.y - p.y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = n.placeId;
    }
  }
  return best;
}

export function episodeFocusNodeId(episodeId: string, placeIds: string[]): string {
  const hint = getEpisodeCameraHint(episodeId);
  if (hint) {
    for (const id of hint.focusPlaceIds) {
      const mapped = resolveStrategicNodeId(id);
      if (mapped) return mapped;
    }
  }
  for (const id of placeIds) {
    const mapped = resolveStrategicNodeId(id);
    if (mapped) return mapped;
  }
  return "luoyang";
}
