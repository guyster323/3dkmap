"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { BattleMapCanvas } from "@/components/BattleMapCanvas";
import { KaoPortrait } from "@/components/KaoPortrait";
import { CommandWindow, TerrainPanel, UnitPanel } from "@/components/eiketsu";
import { MatureToggle, useMature } from "@/components/MatureContext";
import { episodeNearestYear, firstEpisodeOfVolume, getAllEpisodes, getCharactersByIds, getEpisode, getEvents, getPlace, getVolume } from "@/lib/content";
import { eraToAbsDays, eventIsLive, formatEra } from "@/lib/clock";
import { isApproximateMap, resolveBattleMap, type MapUnit } from "@/lib/eiketsu";
import type { Character, Place, PlaceKind } from "@/lib/types";

const KIND_TERRAIN: Record<PlaceKind, string> = {
  city: "성시",
  palace: "궁성",
  pass: "관문",
  battlefield: "전장",
  river: "하천",
  region: "지역",
};

function unitsOnMap(place: Place, characters: Character[]): MapUnit[] {
  const map = resolveBattleMap(place);
  const spots = map.markers.length
    ? map.markers.map((m) => ({ col: m.col, row: m.row }))
    : [{ col: 12, row: 9 }];
  return characters.slice(0, 8).map((c, i) => {
    const spot = spots[i % spots.length];
    const col = Math.max(0, Math.min(map.cols - 1, spot.col + (i % 3) - 1));
    const row = Math.max(0, Math.min(map.rows - 1, spot.row + Math.floor(i / 3)));
    return {
      id: c.id,
      col,
      row,
      kind: "lord" as const,
      faction: c.faction,
      characterId: c.id,
      dir: 0 as const,
      label: c.nameKo,
    };
  });
}

function BattleInner() {
  const { placeId } = useParams<{ placeId: string }>();
  const sp = useSearchParams();
  const { setMature } = useMature();
  const place = getPlace(placeId);

  const queryEp = sp.get("episode");
  const year = Number(sp.get("year") ?? 0);
  let episode = queryEp ? getEpisode(queryEp) : undefined;
  if (!episode && year) episode = episodeNearestYear(year);
  if (!episode && place) {
    episode = getAllEpisodes().find((e) => e.placeIds.includes(place.id)) ?? firstEpisodeOfVolume(1);
  }
  if (!episode) episode = firstEpisodeOfVolume(1);

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const map = place ? resolveBattleMap(place) : null;
  const clock = episode ? eraToAbsDays(episode.timeStart) : 0;
  const liveHere = getEvents().filter((e) => e.placeId === placeId && eventIsLive(e, clock));
  const characters = getCharactersByIds([
    ...new Set([
      ...(episode?.characterIds ?? []),
      ...liveHere.flatMap((e) => e.characterIds ?? []),
    ]),
  ]);
  const units = place ? unitsOnMap(place, characters) : [];
  const selectedChar: Character | undefined =
    characters.find((c) => c.id === selectedId) ?? characters[0];
  const volume = episode ? getVolume(episode.volume) : undefined;
  const terrain =
    map && place ? (isApproximateMap(map) ? "약식 지형" : KIND_TERRAIN[place.kind]) : "—";

  if (!place || !map) {
    return (
      <main className="p-4">
        <p style={{ color: "var(--color-eik-text-dim)" }}>이 거점을 찾지 못했습니다.</p>
        <Link href="/world" className="mt-3 inline-flex min-h-[44px] items-center" style={{ color: "var(--color-eik-gold)" }}>
          전역도로
        </Link>
      </main>
    );
  }

  const worldHref = episode ? `/world?episode=${episode.id}` : "/world";

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-x-hidden p-2 md:p-0">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="eik-src tracking-widest" style={{ color: "var(--color-eik-gold)" }}>
            전투맵
          </p>
          <h1 className="eik-era mt-1 break-keep" style={{ color: "var(--color-eik-gold)" }}>
            {place.nameKo}
            <span className="ml-2 font-serif text-lg" style={{ color: "var(--color-eik-text-dim)" }}>
              {place.nameHanja}
            </span>
          </h1>
          {episode && (
            <p className="eik-src mt-1">
              {formatEra(episode.timeStart)}
              {volume ? ` · ${volume.number}권 ${volume.title}` : ""}
            </p>
          )}
        </div>
        <MatureToggle />
      </div>

      <BattleMapCanvas
        map={map}
        units={units}
        selectedId={selectedId}
        onSelect={setSelectedId}
        highlight={units.map((u) => u.id)}
      />

      <div className="grid min-w-0 gap-2 lg:grid-cols-2">
        {selectedChar ? (
          <UnitPanel
            character={selectedChar}
            portrait={<KaoPortrait character={selectedChar} size={64} caption="" />}
          />
        ) : null}
        <TerrainPanel place={place} terrain={terrain} />
      </div>

      <CommandWindow
        title="명령"
        items={[
          {
            id: "plot",
            label: "줄거리",
            href: episode ? `/episodes/${episode.id}` : undefined,
            disabled: !episode,
          },
          {
            id: "people",
            label: "인물",
            href: selectedChar ? `/characters/${selectedChar.id}` : undefined,
            disabled: !selectedChar,
          },
          {
            id: "sources",
            label: "사료",
            href: episode ? `/episodes/${episode.id}` : undefined,
            disabled: !episode,
          },
          { id: "same-time", label: "같은 시각", href: worldHref },
          {
            id: "rating",
            label: "수위",
            onPick: () => setMature(true),
          },
        ]}
      />
    </main>
  );
}

export default function BattlePlacePage() {
  return (
    <Suspense fallback={<p className="p-6" style={{ color: "var(--color-eik-text-dim)" }}>거점을 여는 중…</p>}>
      <BattleInner />
    </Suspense>
  );
}
