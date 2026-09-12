import type { ReactNode } from "react";
import type { SourceRef } from "@/lib/types";
import { EikWindow } from "./Window";
import { NamePlate } from "./NamePlate";
import { SourceBadge } from "./SourceBadge";

export type DialogueBoxProps = {
  name: string;
  body: string;
  sources?: SourceRef[];
  portrait?: ReactNode;
  className?: string;
};

/** 대화 씬. 좌측 kao 슬롯 + 우측 명패와 본문 + 하단 사료 뱃지 줄. */
export function DialogueBox({ name, body, sources, portrait, className = "" }: DialogueBoxProps) {
  return (
    <EikWindow className={className}>
      <div className="flex min-w-0 gap-3">
        <div
          className="eik-win eik-win--flat pixelated shrink-0 overflow-hidden"
          style={{ width: 64, height: 80 }}
          aria-hidden={portrait ? undefined : true}
        >
          {portrait ?? (
            <div className="h-full w-full" style={{ background: "var(--color-eik-void)" }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <NamePlate>{name}</NamePlate>
          <p className="eik-body mt-2 min-w-0 break-keep">{body}</p>
        </div>
      </div>
      {sources && sources.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {sources.map((s) => (
            <li key={`${s.kind}-${s.ref}`} className="min-w-0 max-w-full">
              <SourceBadge kind={s.kind} cite={s.ref} />
            </li>
          ))}
        </ul>
      ) : null}
    </EikWindow>
  );
}
