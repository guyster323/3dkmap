"use client";

import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StrategicMapCanvas } from "@/components/StrategicMapCanvas";
import { SourceBadge } from "@/components/eiketsu";
import { KaoPortrait } from "@/components/KaoPortrait";
import { DirectRecord, MatureToggle, useMature, notifyPrefs } from "@/components/MatureContext";
import {
  BookTree,
  EpisodeStepper,
  EventSceneOverlay,
  EventTree,
  MapBannerLayer,
  PeopleTree,
  RegionTree,
  TreeDock,
  VolumeTimeline,
  VolumeTitleplate,
} from "@/components/pixel-times";
import { STRATEGIC_EDGES, STRATEGIC_NODES, STRATEGIC_TERRITORIES } from "@/data/terrain";
import { eventVisualsOnMap, getEventScene, type TreeId } from "@/data/pixel-times";
import {
  episodeNearestYear,
  episodesAround,
  eventsOverlapping,
  firstEpisodeOfVolume,
  getCharacter,
  getEpisode,
  getPlace,
  getVolume,
} from "@/lib/content";
import { eraToAbsDays, eventIsLive, formatEra } from "@/lib/clock";
import { savePrefs } from "@/lib/prefs";
import { REGION_LABEL, type Episode, type RegionId, type WorldEvent } from "@/lib/types";

function WorldInner() {
  const sp = useSearchParams();
  const id = sp.get("episode");
  const sceneId = sp.get("scene");
  const year = Number(sp.get("year") ?? 0);
  let episode: Episode | undefined = id ? getEpisode(id) : undefined;
  if (!episode && year) episode = episodeNearestYear(year);
  if (!episode) episode = firstEpisodeOfVolume(1);

  if (!episode) {
    return <p className="p-6" style={{ color: "var(--color-eik-text-dim)" }}>열 수 있는 에피소드가 없습니다.</p>;
  }

  return <StrategicWorld key={episode.id} episode={episode} sceneId={sceneId} />;
}

function StrategicWorld({ episode, sceneId }: { episode: Episode; sceneId: string | null }) {
  const router = useRouter();
  const volume = getVolume(episode.volume);
  const around = episodesAround(episode.id);
  const clock = eraToAbsDays(episode.timeStart);
  const [selectedPlace, setSelectedPlace] = useState<string | undefined>(episode.placeIds[0]);
  const [regionFilter, setRegionFilter] = useState<RegionId | null>(null);
  const [openTree, setOpenTree] = useState<TreeId | null>(null);
  const { mature } = useMature();

  const liveAll = useMemo(
    () => eventsOverlapping(clock - 10, clock + 40).filter((e) => eventIsLive(e, clock)),
    [clock],
  );
  const live = regionFilter ? liveAll.filter((e) => e.region === regionFilter) : liveAll;
  const highlight = liveAll.map((e) => e.placeId).filter((pid): pid is string => Boolean(pid));
  const banners = eventVisualsOnMap(
    episode.id,
    liveAll.map((e) => e.id),
  );
  const scene = sceneId ? getEventScene(sceneId) : undefined;

  const goEpisode = (id: string) => {
    const next = getEpisode(id);
    if (!next) return;
    savePrefs({ lastEpisodeId: next.id, lastVolume: next.volume });
    notifyPrefs();
    router.push(`/world?episode=${next.id}`);
  };

  const openScene = (id: string) => {
    router.push(`/world?episode=${episode.id}&scene=${id}`);
  };

  const closeScene = () => {
    const opener = sceneId ? document.getElementById(`pt-banner-${sceneId}`) : null;
    router.push(`/world?episode=${episode.id}`);
    window.setTimeout(() => opener?.focus(), 0);
  };

  const openPlace = (placeId: string) => {
    setSelectedPlace(placeId);
    router.push(`/world/${placeId}?episode=${episode.id}`);
  };

  const focusPlace = (placeId: string) => {
    setSelectedPlace(placeId);
  };

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
      <header className="relative z-20 min-w-0 p-1 md:absolute md:inset-x-0 md:top-0 md:p-2">
        <div className="eik-win min-w-0 px-2 py-1 md:px-3 md:py-2">
          <div className="flex min-w-0 flex-wrap items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="eik-src tracking-widest" style={{ color: "var(--color-eik-gold)" }}>
                전역도
              </p>
              {volume ? <VolumeTitleplate volume={volume} /> : null}
              <p className="eik-src mt-1" style={{ color: "var(--color-eik-text-dim)" }}>
                {formatEra(episode.timeStart)} · {episode.title}
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <QuotePlate episode={episode} />
              <EpisodeStepper
                hasPrevEpisode={Boolean(around.prev)}
                hasNextEpisode={Boolean(around.next)}
                hasNextVolume={Boolean(around.nextVolume)}
                onPrevEpisode={() => around.prev && goEpisode(around.prev.id)}
                onNextEpisode={() => around.next && goEpisode(around.next.id)}
                onNextVolume={() => around.nextVolume && goEpisode(around.nextVolume.id)}
              />
              <MatureToggle />
            </div>
          </div>
          {around.list.length > 0 ? (
            <div className="mt-2 min-w-0">
              <VolumeTimeline episodes={around.list} activeId={episode.id} onSelect={goEpisode} />
            </div>
          ) : null}
        </div>
      </header>

      <div className="relative z-20 min-w-0 px-2 pb-2 md:absolute md:left-2 md:top-36 md:z-30 md:max-h-[70%] md:overflow-y-auto md:pb-0">
        <TreeDock openId={openTree} onOpen={setOpenTree}>
          {{
            book: <BookTree current={episode} onPickEpisode={goEpisode} />,
            region: (
              <RegionTree
                filter={regionFilter}
                onFilter={setRegionFilter}
                onFocusPlace={focusPlace}
              />
            ),
            event: <EventTree events={live} onPick={(pid) => pid && focusPlace(pid)} />,
            people: <PeopleTree />,
          }}
        </TreeDock>
      </div>

      <div className="relative min-w-0 w-full">
        <StrategicMapCanvas
          nodes={STRATEGIC_NODES}
          edges={STRATEGIC_EDGES}
          territories={STRATEGIC_TERRITORIES}
          selectedPlaceId={selectedPlace}
          highlight={highlight}
          onSelect={openPlace}
          overlay={
            <MapBannerLayer
              visuals={banners}
              nodes={STRATEGIC_NODES}
              selectedId={sceneId ?? undefined}
              onOpen={openScene}
            />
          }
        />
        <EikChronicle live={live} mature={mature} selectedPlace={selectedPlace} onPick={focusPlace} />
      </div>
      {scene ? <EventSceneOverlay scene={scene} onClose={closeScene} /> : null}
    </main>
  );
}

function QuotePlate({ episode }: { episode: Episode }) {
  const c = getCharacter(episode.characterIds[0]);
  if (!c) return null;
  return (
    <div className="eik-win eik-win--flat hidden max-w-[200px] items-center gap-2 p-1 md:flex">
      <KaoPortrait character={c} size={40} />
      <p className="eik-src min-w-0 leading-snug break-keep" style={{ color: "var(--color-eik-gold)" }}>
        {c.nameKo}
      </p>
    </div>
  );
}

function EikChronicle({
  live,
  mature,
  selectedPlace,
  onPick,
}: {
  live: WorldEvent[];
  mature: boolean;
  selectedPlace?: string;
  onPick: (placeId: string) => void;
}) {
  return (
    <aside className="pointer-events-auto relative z-10 mx-2 mb-2 mt-2 max-h-[24vh] min-w-0 overflow-hidden lg:absolute lg:bottom-2 lg:right-2 lg:z-10 lg:mx-0 lg:mb-0 lg:mt-0 lg:w-[min(240px,calc(100vw-1rem))]">
      <div className="eik-win flex max-h-[36vh] min-w-0 flex-col overflow-hidden">
        <p className="eik-nameplate m-2">그 시각 사건</p>
        <ul className="scroll-thin min-w-0 flex-1 space-y-2 overflow-y-auto px-2 pb-2">
          {live.map((ev) => (
            <EventRow
              key={ev.id}
              ev={ev}
              mature={mature}
              active={ev.placeId === selectedPlace}
              onPick={() => ev.placeId && onPick(ev.placeId)}
            />
          ))}
          {!live.length && (
            <li className="eik-body" style={{ color: "var(--color-eik-text-dim)" }}>
              이 순간에 매핑된 동시 사건이 없습니다.
            </li>
          )}
        </ul>
      </div>
    </aside>
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
  const extra = mature && ev.bodyFull && ev.bodyFull !== ev.bodyFamily;
  const place = ev.placeId ? getPlace(ev.placeId) : undefined;
  return (
    <li>
      <div
        className="eik-win eik-win--flat w-full px-2 py-2 text-left"
        style={
          active
            ? { background: "var(--color-eik-gold)", color: "var(--color-eik-text-ink)" }
            : undefined
        }
      >
        <button type="button" onClick={onPick} className="min-h-[44px] w-full text-left">
          <div className="mb-1 flex justify-between eik-src">
            <span style={{ color: active ? "var(--color-eik-text-ink)" : "var(--color-eik-gold)" }}>
              {REGION_LABEL[ev.region]}
              {place ? ` · ${place.nameKo}` : ""}
            </span>
            <span>대기</span>
          </div>
          <p className="font-serif text-sm leading-snug break-keep">{ev.headline}</p>
          <p className="eik-body mt-1 text-xs leading-relaxed">{ev.bodyFamily}</p>
        </button>
        {extra && <DirectRecord text={ev.bodyFull!} />}
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {ev.sources.map((s) => (
            <li key={`${s.kind}-${s.ref}`} className="min-w-0 max-w-full">
              <SourceBadge kind={s.kind} cite={s.ref} />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function WorldPage() {
  return (
    <Suspense fallback={<p className="p-6" style={{ color: "var(--color-eik-text-dim)" }}>천하를 펼치는 중…</p>}>
      <WorldInner />
    </Suspense>
  );
}
