import { CommandWindow } from "./CommandWindow";
import { DialogueBox } from "./DialogueBox";
import { EikWindow } from "./Window";
import { NamePlate } from "./NamePlate";
import { SourceBadge } from "./SourceBadge";
import { StatBar } from "./StatBar";
import { TerrainPanel } from "./TerrainPanel";
import { UnitPanel } from "./UnitPanel";
import type { SourceKind } from "@/lib/types";

const SOURCE_KINDS: SourceKind[] = ["연의", "정사", "자치통감", "후한서", "삼국사기", "삼국유사", "주석"];

/** WP5 가 붙일 시각 확인용. 라우트는 만들지 않는다. */
export function EiketsuGallery() {
  return (
    <div
      className="mx-auto flex w-full max-w-[375px] flex-col gap-4 p-3"
      style={{ background: "var(--color-eik-void)", color: "var(--color-eik-text)" }}
    >
      <p className="eik-era break-keep">영제 중평 원년 삼월</p>

      <EikWindow title="창틀">
        <p className="eik-body">기본 4겹 창틀.</p>
      </EikWindow>
      <EikWindow title="활성" active>
        <p className="eik-body">금테를 밝힌 활성 창.</p>
      </EikWindow>
      <EikWindow title="평면" variant="flat">
        <p className="eik-body">중첩 창 안쪽용 단색.</p>
      </EikWindow>

      <div>
        <NamePlate>단독 명패</NamePlate>
      </div>

      <CommandWindow
        title="명령"
        items={[
          { id: "plot", label: "줄거리" },
          { id: "people", label: "인물" },
          { id: "sources", label: "사료" },
          { id: "same-time", label: "같은 시각" },
          { id: "rating", label: "수위", disabled: true },
        ]}
      />

      <UnitPanel
        character={{
          nameKo: "유비",
          nameHanja: "劉備",
          courtesy: "현덕",
          faction: "liu",
          firstVolume: 1,
        }}
      />

      <TerrainPanel
        place={{
          nameKo: "관도",
          nameHanja: "官渡",
          modernName: "중무 관두",
          note: "황하 남안 평지. 토성이 남는다.",
        }}
        terrain="평지"
      />

      <DialogueBox
        name="관우"
        body="연의는 형제의 의를 앞세우고, 정사는 그 오만과 용맹을 함께 적는다."
        sources={[
          { kind: "연의", ref: "삼국지연의 1회" },
          { kind: "정사", ref: "관우전" },
        ]}
      />

      <EikWindow title="게이지">
        <div className="flex flex-col gap-3">
          <StatBar label="중요도" value={5} max={5} />
          <StatBar label="중요도" value={3} max={5} />
          <StatBar label="권 완성" value={1} max={5} />
        </div>
      </EikWindow>

      <EikWindow title="사료">
        <ul className="flex flex-wrap gap-1.5">
          {SOURCE_KINDS.map((kind) => (
            <li key={kind} className="min-w-0 max-w-full">
              <SourceBadge kind={kind} cite="보기" />
            </li>
          ))}
        </ul>
      </EikWindow>
    </div>
  );
}
