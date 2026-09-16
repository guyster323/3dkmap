"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
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
import {
  episodeFocusNodeId,
  eventVisualsOnMap,
  getEventScene,
  resolveStrategicNodeId,
  type TreeId,
} from "@/data/pixel-times";
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
import { eraToAbsDays, eventIsLive } from "@/lib/clock";
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
  const [focusPlaceId, setFocusPlaceId] = useState<string | undefined>(
    episodeFocusNodeId(episode.id, episode.placeIds),
  );
  const [zoom, setZoom] = useState<1 | 2>(1);
  const [regionFilter, setRegionFilter] = useState<RegionId | null>(null);
  const [openTree, setOpenTree] = useState<TreeId | null>(null);
  const [pickedPerson, setPickedPerson] = useState<string | undefined>(episode.characterIds[0]);
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
    const mapped = resolveStrategicNodeId(placeId);
    if (mapped) setFocusPlaceId(mapped);
  };

  return (
    <main className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <StrategicMapCanvas
          fill
          zoom={zoom}
          focusPlaceId={focusPlaceId}
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
      </div>

      <div className="pointer-events-none relative z-20 flex h-full min-h-0 flex-col">
        <header className="pointer-events-auto shrink-0 p-1">
          <div className="eik-win min-w-0 px-2 py-0">
            <div className="flex min-w-0 items-center gap-1">
              <Link
                href="/"
                className="eik-src flex min-h-[44px] shrink-0 items-center whitespace-nowrap pr-2"
                style={{ color: "var(--color-eik-gold)" }}
              >
                Pixel Times
              </Link>
              <div className="min-w-0 flex-1">
                {volume ? <VolumeTitleplate volume={volume} compact /> : null}
                <p className="eik-src truncate" style={{ color: "var(--color-eik-text-dim)" }}>
                  전역도 · {episode.order}장 {episode.title}
                </p>
              </div>
              <EpisodeStepper
                hasPrevEpisode={Boolean(around.prev)}
                hasNextEpisode={Boolean(around.next)}
                hasNextVolume={Boolean(around.nextVolume)}
                onPrevEpisode={() => around.prev && goEpisode(around.prev.id)}
                onNextEpisode={() => around.next && goEpisode(around.next.id)}
                onNextVolume={() => around.nextVolume && goEpisode(around.nextVolume.id)}
              />
            </div>
            <div className="flex min-w-0 items-center gap-1">
              {around.list.length > 0 ? (
                <div className="min-w-0 flex-1">
                  <VolumeTimeline episodes={around.list} activeId={episode.id} onSelect={goEpisode} />
                </div>
              ) : (
                <div className="min-w-0 flex-1" />
              )}
              <QuotePlate episode={episode} characterId={pickedPerson} />
              <MatureToggle />
            </div>
          </div>
        </header>

        <div className="relative min-h-0 flex-1">
          <div className="pointer-events-auto absolute left-1 top-1 z-30 max-h-[calc(100%-0.5rem)]">
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
                people: <PeopleTree onPick={setPickedPerson} />,
              }}
            </TreeDock>
          </div>
          <div className="pointer-events-none absolute inset-x-1 bottom-1 z-20 flex flex-col gap-1 pb-[env(safe-area-inset-bottom,0px)] md:inset-x-auto md:left-1 md:right-1 md:flex-row md:items-end md:justify-between">
            <div className="pointer-events-auto flex flex-wrap gap-1">
              <button
                type="button"
                className="eik-win eik-win--flat min-h-[44px] px-2 eik-src"
                style={{ color: "var(--color-eik-gold)" }}
                onClick={() => {
                  setZoom(1);
                  setFocusPlaceId(undefined);
                }}
              >
                전체 지도
              </button>
              <button
                type="button"
                className="eik-win eik-win--flat min-h-[44px] px-2 eik-src"
                style={{ color: "var(--color-eik-gold)" }}
                onClick={() => {
                  setZoom(1);
                  setFocusPlaceId(episodeFocusNodeId(episode.id, episode.placeIds));
                  setSelectedPlace(episode.placeIds[0]);
                }}
              >
                현재 장 위치
              </button>
              <button
                type="button"
                className="eik-win eik-win--flat min-h-[44px] min-w-[44px] px-2 eik-src"
                style={{ color: "var(--color-eik-gold)" }}
                aria-pressed={zoom === 2}
                onClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
              >
                {zoom === 2 ? "1×" : "2×"}
              </button>
            </div>
            <EikChronicle live={live} mature={mature} selectedPlace={selectedPlace} onPick={focusPlace} />
          </div>
        </div>
      </div>
      {scene ? <EventSceneOverlay scene={scene} onClose={closeScene} /> : null}
    </main>
  );
}

function QuotePlate({ episode, characterId }: { episode: Episode; characterId?: string }) {
  const c = getCharacter(characterId ?? episode.characterIds[0]);
  if (!c) return null;
  return (
    <div className="eik-win eik-win--flat flex max-w-[120px] shrink-0 items-center gap-1 p-1 md:max-w-[160px] md:gap-2">
      <KaoPortrait character={c} size={32} />
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
    <aside className="pointer-events-auto relative z-10 max-h-[18vh] w-full min-w-0 overflow-hidden md:max-h-[28vh] md:w-[220px]">
      <div className="eik-win flex max-h-[18vh] min-w-0 flex-col overflow-hidden md:max-h-[28vh]">
        <p className="eik-nameplate m-2">그 시각 사건 {live.length ? live.length : ""}</p>
        <ul className="scroll-thin min-w-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
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
          <p className="eik-src" style={{ color: active ? "var(--color-eik-text-ink)" : "var(--color-eik-gold)" }}>
            {place ? place.nameKo : REGION_LABEL[ev.region]}
          </p>
          <p className="font-serif text-sm leading-snug break-keep">{ev.headline}</p>
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
