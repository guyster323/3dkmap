import type { SourceKind } from "@/lib/types";

export const SOURCE_KIND_CLASS: Record<SourceKind, string> = {
  연의: "cinnabar border-eik-cinnabar bg-eik-cinnabar/15 text-[#e06d53]",
  정사: "border-[#6a8caf] bg-[#6a8caf]/15 text-[#9ec0e0]",
  자치통감: "border-[#3d7a8a] bg-[#3d7a8a]/15 text-[#7eb8c4]",
  후한서: "border-[#7a6a9a] bg-[#7a6a9a]/15 text-[#b8a8d0]",
  삼국사기: "border-eik-jade bg-eik-jade/15 text-[#6ec4b0]",
  삼국유사: "border-[#2f6b4a] bg-[#2f6b4a]/15 text-[#7ab898]",
  주석: "border-eik-gold bg-eik-gold/15 text-eik-gold",
};

export const SOURCE_KIND_COLOR: Record<SourceKind, string> = {
  연의: "#c23b22",
  정사: "#6a8caf",
  자치통감: "#3d7a8a",
  후한서: "#7a6a9a",
  삼국사기: "#3d8b7a",
  삼국유사: "#2f6b4a",
  주석: "#d8b74a",
};

const KIND_GLOSS: Record<SourceKind, string> = {
  연의: "나관중 계통의 통속 서사",
  정사: "진수 삼국지 관찬 기록",
  후한서: "범엽 후한서",
  자치통감: "사마광 자치통감",
  삼국사기: "김부식 삼국사기",
  삼국유사: "일연 삼국유사",
  주석: "배송지 주 등 주석",
};

export type SourceBadgeProps = {
  kind: SourceKind;
  cite?: string;
  className?: string;
};

/** 사료 뱃지. 연의는 cinnabar 계열을 유지한다. cite 는 SourceRef.ref (React ref 와 이름 충돌 회피). */
export function SourceBadge({ kind, cite, className = "" }: SourceBadgeProps) {
  const title = cite ? `${KIND_GLOSS[kind]} · ${cite}` : KIND_GLOSS[kind];
  return (
    <span
      title={title}
      className={[
        "eik-src inline-flex max-w-full items-center gap-1 rounded-none border px-1.5 py-0.5",
        SOURCE_KIND_CLASS[kind],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{kind}</span>
      {cite ? (
        <span className="min-w-0 break-all" style={{ color: "var(--color-eik-text)" }}>
          {cite}
        </span>
      ) : null}
    </span>
  );
}
