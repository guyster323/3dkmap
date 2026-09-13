"use client";

import { useEffect, useRef } from "react";
import { ATLAS, officerCell, unitCell } from "@/lib/atlas";
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
    officers.src = ATLAS.officers;
    units.src = ATLAS.units;

    const blit = () => {
      const dir = actor.dir;
      const named = officerCell(actor.characterId, dir, frame);
      const cell = named ?? unitCell("lord", character?.faction ?? "other", dir, frame);
      const sheet = named ? officers : units;
      if (!sheet.complete) return;
      ctx.clearRect(0, 0, ATLAS.unitW, ATLAS.unitH);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sheet, cell.sx, cell.sy, ATLAS.unitW, ATLAS.unitH, 0, 0, ATLAS.unitW, ATLAS.unitH);
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
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [actor, character]);

  return (
    <canvas
      ref={ref}
      width={ATLAS.unitW}
      height={ATLAS.unitH}
      data-anim="idle-2"
      data-actor={actor.characterId}
      className="pixelated pointer-events-none block"
      style={{ width: ATLAS.unitW * 2, height: ATLAS.unitH * 2, imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
