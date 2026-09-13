"use client";

import { useEffect, useRef } from "react";
import { ATLAS, officerCell, ptActorCell, unitCell } from "@/lib/atlas";
import { getCharacter } from "@/lib/content";
import type { SceneActor } from "@/data/pixel-times";

export function SceneActorSprite({ actor }: { actor: SceneActor }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const character = getCharacter(actor.characterId);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    let frame: 0 | 1 = 0;
    let last = 0;
    let cancelled = false;
    const officers = new Image();
    const units = new Image();
    const actors = new Image();
    officers.src = ATLAS.officers;
    units.src = ATLAS.units;
    actors.src = ATLAS.ptActors;
    const w = ATLAS.ptActorW;
    const h = ATLAS.ptActorH;

    const blit = () => {
      const dir = actor.dir;
      const pt = ptActorCell(actor.characterId, frame);
      if (pt && actors.complete && actors.naturalWidth) {
        ctx.clearRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(actors, pt.sx, pt.sy, w, h, 0, 0, w, h);
        return;
      }
      const named = officerCell(actor.characterId, dir, frame);
      const cell = named ?? unitCell("lord", character?.faction ?? "other", dir, frame);
      const sheet = named ? officers : units;
      if (!sheet.complete) return;
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sheet, cell.sx, cell.sy, ATLAS.unitW, ATLAS.unitH, 8, 0, ATLAS.unitW, ATLAS.unitH);
    };

    let raf = 0;
    const tick = (t: number) => {
      if (cancelled) return;
      if (t - last > 400) {
        frame = frame === 0 ? 1 : 0;
        last = t;
        blit();
      }
      raf = requestAnimationFrame(tick);
    };
    officers.onload = blit;
    units.onload = blit;
    actors.onload = blit;
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [actor, character]);

  return (
    <canvas
      ref={ref}
      width={ATLAS.ptActorW}
      height={ATLAS.ptActorH}
      data-anim="idle-2"
      data-actor={actor.characterId}
      className="pixelated pointer-events-none block"
      style={{ width: ATLAS.ptActorW * 2, height: ATLAS.ptActorH * 2, imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
