"use client";

import { useEffect, useRef } from "react";
import { FACTION_BANNER } from "@/lib/eiketsu";
import { ATLAS, kaoCell } from "@/lib/atlas";
import type { Character } from "@/lib/types";

/** 64×80 흉상. kao.png + kaoCell(). 시트에 없으면 초상 사진 또는 낙관. */
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
  const cell = kaoCell(character.id);
  const height = Math.round((size * 80) / 64);
  const portrait = character.portrait;

  useEffect(() => {
    const blit = kaoCell(character.id);
    if (!blit && portrait) return;
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    if (blit) {
      const img = new Image();
      img.src = ATLAS.kao;
      img.onload = () => {
        ctx.clearRect(0, 0, 64, 80);
        ctx.drawImage(img, blit.sx, blit.sy, 64, 80, 0, 0, 64, 80);
      };
      return;
    }
    drawSeal(ctx, character);
  }, [character, portrait]);

  return (
    <figure className="w-fit max-w-full">
      <div className="pixelated overflow-hidden" style={{ width: size, height }}>
        {!cell && character.portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.portrait}
            alt=""
            width={size}
            height={height}
            className="block object-cover object-top"
            style={{ width: size, height }}
          />
        ) : (
          <canvas
            ref={ref}
            width={64}
            height={80}
            className="pixelated block"
            style={{ width: size, height }}
          />
        )}
      </div>
      {caption ? (
        <figcaption className="eik-src mt-1 text-center" style={{ color: "var(--color-eik-gold)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function p(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawSeal(ctx: CanvasRenderingContext2D, ch: Character) {
  const banner = FACTION_BANNER[ch.faction];
  ctx.fillStyle = "#060a14";
  ctx.fillRect(0, 0, 64, 80);
  p(ctx, 4, 6, "#0a1226", 56, 68);
  p(ctx, 6, 8, banner, 52, 6);
  p(ctx, 8, 18, "#14224a", 48, 50);
  ctx.strokeStyle = "#d8b74a";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 22, 44, 42);
  const glyph = (ch.nameHanja || ch.nameKo).slice(0, 1);
  ctx.fillStyle = "#f0ead8";
  ctx.font = "28px 'Noto Serif KR', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, 32, 44);
  ctx.fillStyle = "#d8b74a";
  ctx.font = "8px 'Noto Serif KR', serif";
  ctx.fillText(ch.nameKo.slice(0, 2), 32, 68);
}
