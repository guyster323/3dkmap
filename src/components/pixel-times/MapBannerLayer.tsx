"use client";

import type { StrategicNode } from "@/data/terrain";
import type { EventVisual } from "@/data/pixel-times";
import { EventBanner } from "./EventBanner";

const LOGIC_W = 1000;
const LOGIC_H = 700;

export function MapBannerLayer({
  visuals,
  nodes,
  selectedId,
  onOpen,
}: {
  visuals: EventVisual[];
  nodes: StrategicNode[];
  selectedId?: string;
  onOpen: (id: string) => void;
}) {
  const byId = new Map(nodes.map((n) => [n.placeId, n]));
  return (
    <>
      {visuals.map((visual) => {
        const node = byId.get(visual.mapPlaceId ?? visual.placeId);
        if (!node) return null;
        const left = Math.min(78, Math.max(4, (node.x / LOGIC_W) * 100 + 4));
        const top = Math.min(72, Math.max(6, (node.y / LOGIC_H) * 100 - 8));
        return (
          <div
            key={visual.id}
            className="absolute z-20"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <EventBanner visual={visual} selected={selectedId === visual.id} onOpen={() => onOpen(visual.id)} />
          </div>
        );
      })}
    </>
  );
}
