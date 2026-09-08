"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TileMap } from "@/components/TileMap";
import { KaoPortrait } from "@/components/KaoPortrait";
import { WoodPanel } from "@/components/WoodPanel";
import { SourceChips } from "@/components/SourceChips";
import { MatureToggle, useMature } from "@/components/MatureContext";
import { eventsOverlapping, getCharacter, getPlace, getVolume } from "@/lib/content";
import { eraToAbsDays, eventIsLive, formatEra } from "@/lib/clock";
import { REGION_LABEL, type Episode, type Place, type RegionId, type WorldEvent } from "@/lib/types";

const STRIPS: RegionId[] = ["zhongyuan", "hebei", "jiangdong", "xiliang", "korea"];

export function WorldDashboard({ episode }: { episode: Episode }) {
  const volume = getVolume(episode.volume);
  const slice = eraToAbsDays(episode.timeStart);
  const live = useMemo(
    () => eventsOverlapping(slice - 10, slice + 40).filter((e) => eventIsLive(e, slice)),
    [slice],
  );
  const [selectedPlace, setSelectedPlace] = useState<string | undefined>(episode.placeIds[0]);
  const { mature } = useMature();
  const placeIds = new Set([
    ...episode.placeIds,
    ...live.map((e) => e.placeId).filter((id): id is string => Boolean(id)),
  ]);
  const mapPlaces = [...placeIds].map((id) => getPlace(id)).filter((p): p is Place => Boolean(p));
  const selectedEvent = live.find((e) => e.placeId === selectedPlace) ?? live[0];
  const kao = selectedEvent?.characterIds?.[0] ? getCharacter(selectedEvent.characterIds[0]) : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 md:p-0">
      <WoodPanel>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] tracking-widest text-gold">전투맵 · 턴 대기</p>
            <h1 className="seal mt-1 text-xl text-gold md:text-2xl">{formatEra(episode.timeStart)}</h1>
            <p className="mt-1 text-xs text-paper-2">
              {volume ? `${volume.number}권 ${volume.title}` : ""} · {episode.title}
              <span className="ml-2 text-gold">시계 정지</span>
            </p>
          </div>
          <MatureToggle />
        </div>
        <p className="mt-2 text-sm text-paper">
          {episode.plotFamily.slice(0, 80)}
          {episode.plotFamily.length > 80 ? "…" : ""}
          <Link href={`/episodes/${episode.id}`} className="ml-2 text-gold">
            Plot
          </Link>
        </p>
      </WoodPanel>

      <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.85fr)]">
        <div className="flex min-h-[300px] flex-col gap-2">
          <TileMap
            places={mapPlaces}
            liveEvents={live}
            selectedId={selectedPlace}
            onSelect={setSelectedPlace}
          />
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
            {STRIPS.map((r) => {
              const ev = live.filter((e) => e.region === r).sort((a, b) => b.importance - a.importance)[0];
              return (
                <div key={r} className="wood-panel px-2 py-1.5">
                  <p className="text-[10px] text-gold">{REGION_LABEL[r]}</p>
                  <p className="line-clamp-2 font-serif text-[11px] leading-snug">
                    {ev ? ev.headline.split(" — ")[1] ?? ev.headline : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <WoodPanel title="선택 거점" className="flex max-h-[70vh] flex-col lg:max-h-none">
          {kao && (
            <div className="mb-3 flex justify-center">
              <KaoPortrait character={kao} size={96} />
            </div>
          )}
          <ul className="scroll-thin flex-1 space-y-2 overflow-y-auto">
            {live.map((ev) => (
              <EventRow
                key={ev.id}
                ev={ev}
                mature={mature}
                active={ev.placeId === selectedPlace}
                onPick={() => ev.placeId && setSelectedPlace(ev.placeId)}
              />
            ))}
            {!live.length && <li className="text-sm text-ash">이 순간에 매핑된 동시 사건이 없습니다.</li>}
          </ul>
        </WoodPanel>
      </div>
    </div>
  );
}

function EventRow({
  ev,
  mature,
  active,
  onPick,
}: {
  ev: WorldEvent;
  mature: boolean;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className={`w-full px-2 py-2 text-left ${active ? "gold-btn" : "wood-inlay"}`}
      >
        <div className="mb-1 flex justify-between text-[10px]">
          <span className={active ? "text-ink" : "text-gold"}>{REGION_LABEL[ev.region]}</span>
          <span>대기</span>
        </div>
        <p className="font-serif text-sm leading-snug">{ev.headline}</p>
        <p className={`mt-1 text-xs leading-relaxed ${active ? "text-ink-3" : "text-ash"}`}>
          {mature && ev.bodyFull ? ev.bodyFull : ev.bodyFamily}
        </p>
        <div className="mt-1">
          <SourceChips sources={ev.sources} />
        </div>
      </button>
    </li>
  );
}
