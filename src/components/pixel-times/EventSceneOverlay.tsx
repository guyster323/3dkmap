"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DialogueBox } from "@/components/eiketsu";
import { KaoPortrait } from "@/components/KaoPortrait";
import { getCharacter } from "@/lib/content";
import { frameAtSpeak } from "@/lib/scene-engine";
import type { EventScene } from "@/data/pixel-times";
import { SceneActorSprite } from "./SceneActorSprite";

export function EventSceneOverlay({
  scene,
  onClose,
}: {
  scene: EventScene;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [speakIndex, setSpeakIndex] = useState(0);
  const frame = useMemo(() => frameAtSpeak(scene, speakIndex), [scene, speakIndex]);
  const speaker = frame.speak ? getCharacter(frame.speak.actorId) : undefined;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,10,20,0.72)] p-2"
    >
      <div className="eik-win flex max-h-[100dvh] w-full max-w-3xl min-w-0 flex-col overflow-y-auto">
        <div className="flex min-h-[44px] items-center justify-between gap-2 px-3 py-2">
          <h2 id={titleId} className="eik-era min-w-0 break-keep">
            {scene.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="eik-win eik-win--flat min-h-[44px] min-w-[44px] px-3 eik-src"
            style={{ color: "var(--color-eik-gold)" }}
            aria-label="장면 닫기"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="relative mx-2 mb-2 min-h-[180px] overflow-hidden" style={{ background: "var(--color-eik-void)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scene.background}
            alt=""
            className="pixelated block h-auto w-full"
            width={480}
            height={270}
          />
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-4">
            {frame.actors.map((actor) => (
              <SceneActorSprite key={actor.id} actor={actor} />
            ))}
          </div>
        </div>

        {frame.speak ? (
          <div className="px-2 pb-2">
            <DialogueBox
              name={frame.speak.name}
              body={frame.speak.body}
              sources={frame.speak.sources}
              portrait={speaker ? <KaoPortrait character={speaker} size={64} /> : undefined}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-3">
          <button
            type="button"
            className="eik-win eik-win--flat min-h-[44px] px-3 eik-src disabled:opacity-40"
            style={{ color: "var(--color-eik-gold)" }}
            disabled={frame.done}
            onClick={() => setSpeakIndex((i) => i + 1)}
          >
            다음 대사
          </button>
          <Link
            href={`/episodes/${scene.episodeId}`}
            className="eik-src inline-flex min-h-[44px] items-center"
            style={{ color: "var(--color-eik-gold)" }}
          >
            이 장면의 자세히 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
