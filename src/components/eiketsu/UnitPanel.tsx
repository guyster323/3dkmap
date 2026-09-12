import type { ReactNode } from "react";
import { FACTION_LABEL, type Character } from "@/lib/types";
import { EikWindow } from "./Window";

export type UnitPanelCharacter = Pick<
  Character,
  "nameKo" | "nameHanja" | "courtesy" | "faction" | "firstVolume"
>;

export type UnitPanelProps = {
  character: UnitPanelCharacter;
  portrait?: ReactNode;
  title?: string;
  className?: string;
};

function SealPlaceholder({ hanja, nameKo }: { hanja: string; nameKo: string }) {
  const glyph = (hanja || nameKo).slice(0, 1);
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center"
      style={{ background: "var(--color-eik-void)" }}
      aria-hidden
    >
      <span className="font-serif text-[28px] leading-none" style={{ color: "var(--color-eik-text)" }}>
        {glyph}
      </span>
      <span className="mt-1 font-serif text-[10px] tracking-widest" style={{ color: "var(--color-eik-gold)" }}>
        {nameKo.slice(0, 2)}
      </span>
    </div>
  );
}

/** 인물 정보창. kao 는 WP1 슬롯(portrait)으로 비워 두고, 없으면 낙관 자리표시자. */
export function UnitPanel({ character, portrait, title = "인물", className = "" }: UnitPanelProps) {
  return (
    <EikWindow title={title} className={className}>
      <div className="flex min-w-0 gap-3">
        <div
          className="eik-win eik-win--flat pixelated shrink-0 overflow-hidden"
          style={{ width: 64, height: 80 }}
        >
          {portrait ?? <SealPlaceholder hanja={character.nameHanja} nameKo={character.nameKo} />}
        </div>
        <dl className="eik-body min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="sr-only">이름</dt>
            <dd className="break-keep font-bold" style={{ color: "var(--color-eik-text)" }}>
              {character.nameKo}
            </dd>
            <dt className="sr-only">한자</dt>
            <dd className="break-keep font-serif" style={{ color: "var(--color-eik-gold)" }}>
              {character.nameHanja}
            </dd>
          </div>
          <div className="mt-1 flex min-w-0 gap-2">
            <dt className="shrink-0" style={{ color: "var(--color-eik-text-dim)" }}>
              자
            </dt>
            <dd className="min-w-0 break-keep">{character.courtesy ?? "—"}</dd>
          </div>
          <div className="mt-0.5 flex min-w-0 gap-2">
            <dt className="shrink-0" style={{ color: "var(--color-eik-text-dim)" }}>
              진영
            </dt>
            <dd className="min-w-0 break-keep">{FACTION_LABEL[character.faction]}</dd>
          </div>
          <div className="mt-0.5 flex min-w-0 gap-2">
            <dt className="shrink-0" style={{ color: "var(--color-eik-text-dim)" }}>
              첫 등장
            </dt>
            <dd className="eik-stat min-w-0">{character.firstVolume}권</dd>
          </div>
        </dl>
      </div>
    </EikWindow>
  );
}
