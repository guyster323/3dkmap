"use client";

import type { StrategicNode } from "@/data/terrain";
import type { EventVisual } from "@/data/pixel-times";
import { EventBanner } from "./EventBanner";

const LOGIC_W = 1000;
const LOGIC_H = 700;

type Box = { left: number; top: number; w: number; h: number };

function overlaps(a: Box, b: Box) {
  return a.left < b.left + b.w && b.left < a.left + a.w && a.top < b.top + b.h && b.top < a.top + b.h;
}

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
  const placed: Box[] = [];
  const items: { visual: EventVisual; compact: boolean; ax: number; ay: number; box: Box }[] = [];

  for (let i = 0; i < visuals.length; i++) {
    const visual = visuals[i];
    const node = byId.get(visual.mapPlaceId ?? visual.placeId);
    if (!node) continue;
    const compact = i > 0;
    const ax = (node.x / LOGIC_W) * 100;
    const ay = (node.y / LOGIC_H) * 100;
    const w = compact ? 16 : 24;
    const h = compact ? 7 : 12;
    const corners: [number, number][] = [
      [3, -h - 1],
      [3, 3],
      [-w - 3, -h - 1],
      [-w - 3, 3],
    ];
    let box: Box = { left: ax + 3, top: ay + 3, w, h };
    let placedOk = false;
    for (const [dx, dy] of corners) {
      const cand: Box = {
        left: Math.min(100 - w, Math.max(0, ax + dx)),
        top: Math.min(100 - h, Math.max(0, ay + dy)),
        w,
        h,
      };
      if (placed.some((p) => overlaps(cand, p))) continue;
      box = cand;
      placedOk = true;
      break;
    }
    if (!placedOk) {
      box = {
        left: Math.min(100 - w, Math.max(0, ax + 3)),
        top: Math.min(100 - h, Math.max(0, ay + 3)),
        w,
        h,
      };
    }
    placed.push(box);
    items.push({ visual, compact, ax, ay, box });
  }

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {items.map((it) => (
          <line
            key={it.visual.id}
            x1={it.box.left + it.box.w / 2}
            y1={it.box.top + it.box.h / 2}
            x2={it.ax}
            y2={it.ay}
            stroke="var(--color-eik-gold-dim)"
            strokeWidth="0.35"
          />
        ))}
      </svg>
      {items.map((it) => (
        <div
          key={it.visual.id}
          className="absolute z-20"
          style={{ left: `${it.box.left}%`, top: `${it.box.top}%` }}
        >
          <EventBanner
            visual={it.visual}
            selected={selectedId === it.visual.id}
            onOpen={() => onOpen(it.visual.id)}
            compact={it.compact}
          />
        </div>
      ))}
    </>
  );
}
