import type { EventScene, SceneActor, SceneOp } from "@/data/pixel-times";

export type SpeakOp = Extract<SceneOp, { t: "speak" }>;

export type SceneFrame = {
  actors: SceneActor[];
  speak: SpeakOp | null;
  speakIndex: number;
  speakCount: number;
  done: boolean;
};

export function speakOps(scene: EventScene): SpeakOp[] {
  return scene.timeline.filter((op): op is SpeakOp => op.t === "speak");
}

/** Apply timeline ops through the Nth speak (0-based). Shipped scene stepper. */
export function frameAtSpeak(scene: EventScene, speakIndex: number): SceneFrame {
  const speaks = speakOps(scene);
  const speakCount = speaks.length;
  const clamped = speakCount === 0 ? 0 : Math.max(0, Math.min(speakIndex, speakCount - 1));
  const live = new Map<string, SceneActor>();
  for (const a of scene.actors) live.set(a.id, { ...a });

  let seen = -1;
  let speak: SpeakOp | null = null;
  for (const op of scene.timeline) {
    if (op.t === "enter") {
      const prev = live.get(op.actorId);
      live.set(op.actorId, {
        id: op.actorId,
        characterId: prev?.characterId ?? op.actorId,
        col: op.col,
        row: op.row,
        dir: op.dir ?? prev?.dir ?? 0,
      });
    } else if (op.t === "exit") {
      live.delete(op.actorId);
    } else if (op.t === "move") {
      const cur = live.get(op.actorId);
      if (cur) live.set(op.actorId, { ...cur, col: op.col, row: op.row });
    } else if (op.t === "face") {
      const cur = live.get(op.actorId);
      if (cur) live.set(op.actorId, { ...cur, dir: op.dir });
    } else if (op.t === "speak") {
      seen += 1;
      if (seen === clamped) {
        speak = op;
        break;
      }
    }
  }

  return {
    actors: [...live.values()],
    speak,
    speakIndex: clamped,
    speakCount,
    done: speakCount === 0 || clamped >= speakCount - 1,
  };
}
