"use client";

import { useEffect, useRef } from "react";
import { FACTION_BANNER } from "@/lib/eiketsu";
import { ATLAS, kaoCell } from "@/lib/atlas";
import type { Character } from "@/lib/types";
import { PortraitFrame } from "@/components/WoodPanel";

/** 64×80 흉상. 영걸전 FACEDAT 칸 비율. */
export function KaoPortrait({
  character,
  size = 80,
  caption,
}: {
  character: Character;
  size?: number;
  caption?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const cell = kaoCell(character.id);
    if (cell) {
      const img = new Image();
      img.src = ATLAS.kao;
      img.onload = () => {
        ctx.clearRect(0, 0, 64, 80);
        ctx.drawImage(img, cell.sx, cell.sy, 64, 80, 0, 0, 64, 80);
      };
      return;
    }
    drawKao(ctx, character);
  }, [character]);

  return (
    <PortraitFrame caption={caption ?? `${character.nameKo} ${character.nameHanja}`}>
      <canvas
        ref={ref}
        width={64}
        height={80}
        className="pixelated block"
        style={{ width: size, height: Math.round((size * 80) / 64) }}
      />
    </PortraitFrame>
  );
}

function p(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawKao(ctx: CanvasRenderingContext2D, ch: Character) {
  const banner = FACTION_BANNER[ch.faction];
  ctx.fillStyle = "#1a120c";
  ctx.fillRect(0, 0, 64, 80);
  p(ctx, 8, 48, banner, 48, 32);
  p(ctx, 18, 14, "#ead9b6", 28, 36);
  p(ctx, 16, 8, "#1a120c", 32, 10);
  if (ch.id === "guan-yu") {
    p(ctx, 22, 44, "#6b2a2a", 20, 18);
    p(ctx, 20, 22, "#c23b22", 4, 2);
    p(ctx, 40, 22, "#c23b22", 4, 2);
  } else if (ch.id === "zhang-fei") {
    p(ctx, 20, 40, "#1a120c", 24, 10);
    p(ctx, 24, 20, "#1a120c", 3, 3);
    p(ctx, 37, 20, "#1a120c", 3, 3);
  } else if (ch.id === "cao-cao") {
    p(ctx, 18, 10, "#3a2818", 28, 8);
    p(ctx, 28, 22, "#1a120c", 8, 2);
  } else if (ch.id === "lu-bu") {
    p(ctx, 14, 6, banner, 36, 12);
    p(ctx, 12, 8, "#c9a227", 4, 8);
    p(ctx, 48, 8, "#c9a227", 4, 8);
  } else if (ch.id === "dong-zhuo") {
    p(ctx, 16, 10, "#3a2818", 32, 14);
    p(ctx, 22, 42, "#5a3a22", 20, 8);
  } else if (ch.id === "sun-jian") {
    p(ctx, 16, 6, "#6b4a2a", 32, 12);
    p(ctx, 28, 4, "#c9a227", 8, 4);
  } else if (ch.id === "gogukcheon") {
    p(ctx, 18, 6, "#3d8b7a", 28, 10);
    p(ctx, 14, 8, "#c9a227", 6, 10);
    p(ctx, 44, 8, "#c9a227", 6, 10);
  } else {
    p(ctx, 20, 10, "#3a2818", 24, 8);
  }
  p(ctx, 26, 28, "#1a120c", 3, 3);
  p(ctx, 36, 28, "#1a120c", 3, 3);
  p(ctx, 30, 36, "#8a2a18", 4, 2);
}
