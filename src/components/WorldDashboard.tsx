"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { HistoricalMap } from "@/components/HistoricalMap";
import { SourceChips } from "@/components/SourceChips";
import { MatureToggle, useMature } from "@/components/MatureContext";
import { eventsOverlapping, getEpisode, getPlace, getPlaces, getVolume } from "@/lib/content";
import {
  DEFAULT_DAYS_PER_SECOND,
  FAST_DAYS_PER_SECOND,
  absDaysToEra,
  clampClock,
  eraToAbsDays,
  eventIsLive,
  eventJustFired,
  formatEra,
} from "@/lib/clock";
import { REGION_LABEL, type Episode, type RegionId, type WorldEvent } from "@/lib/types";

const STRIPS: RegionId[] = ["zhongyuan", "hebei", "jiangdong", "xiliang", "korea"];

export function WorldDashboard({ episode }: { episode: Episode }) {
  const volume = getVolume(episode.volume);
  const min = eraToAbsDays(episode.timeStart);
  const max = Math.max(min + 40, eraToAbsDays(episode.timeEnd) + 20);
  const windowEvents = useMemo(() => eventsOverlapping(min - 20, max + 80), [min, max]);

  const [clock, setClock] = useState(min);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 10>(1);
  const [feed, setFeed] = useState<WorldEvent[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<string | undefined>(episode.placeIds[0]);
  const prev = useRef(min);
  const { mature } = useMature();

  useEffect(() => {
    setClock(min);
    prev.current = min;
    setFeed(
      windowEvents
        .filter((e) => eraToAbsDays(e.timeStart) <= min)
        .sort((a, b) => eraToAbsDays(b.timeStart) - eraToAbsDays(a.timeStart))
        .slice(0, 8),
    );
  }, [episode.id, min, windowEvents]);

  useEffect(() => {
    if (!playing) return;
    const ms = 1000 / (speed === 10 ? FAST_DAYS_PER_SECOND : DEFAULT_DAYS_PER_SECOND);
    const id = window.setInterval(() => {
      setClock((c) => {
        const next = clampClock(c + 1, min, max);
        if (next >= max) setPlaying(false);
        return next;
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [playing, speed, min, max]);

  useEffect(() => {
    const fired = windowEvents.filter((e) => eventJustFired(e, prev.current, clock));
    if (fired.length) {
      setFeed((old) => [...fired.reverse(), ...old].slice(0, 24));
    }
    prev.current = clock;
  }, [clock, windowEvents]);

  const live = windowEvents.filter((e) => eventIsLive(e, clock));
  const era = absDaysToEra(clock);
  const mapPlaces = getPlaces().filter((p) =>
    live.some((e) => e.placeId === p.id) || episode.placeIds.includes(p.id),
  );

  const selectedEvent = live.find((e) => e.placeId === selectedPlace) ?? live[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:p-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-widest text-cinnabar">WORLDVIEW · 전쟁상황실</p>
          <h1 className="seal mt-1 text-2xl md:text-3xl">{formatEra(era)}</h1>
          <p className="mt-1 text-xs text-ash">
            {volume ? `${volume.number}권 ${volume.title}` : ""} · {episode.title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MatureToggle />
          <ClockControls
            playing={playing}
            speed={speed}
            progress={(clock - min) / Math.max(1, max - min)}
            onToggle={() => setPlaying((p) => !p)}
            onSpeed={() => setSpeed((s) => (s === 1 ? 10 : 1))}
            onScrub={(t) => {
              setPlaying(false);
              setClock(Math.round(min + t * (max - min)));
            }}
          />
        </div>
      </header>

      <p className="rounded-xl border border-cinnabar/30 bg-cinnabar/10 px-3 py-2 text-sm">
        <span className="mr-2 text-[10px] tracking-widest text-cinnabar">읽는 이야기</span>
        {episode.plotFamily.slice(0, 90)}
        {episode.plotFamily.length > 90 ? "…" : ""}
        <Link href={`/episodes/${episode.id}`} className="ml-2 text-gold underline-offset-2 hover:underline">
          Plot
        </Link>
      </p>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
        <div className="flex min-h-[320px] flex-col gap-2">
          <p className="text-[11px] tracking-widest text-gold">같은 시각 다른 땅</p>
          <HistoricalMap
            places={mapPlaces.length ? mapPlaces : getPlaces()}
            liveEvents={live}
            selectedId={selectedPlace}
            onSelect={setSelectedPlace}
          />
          <RegionStrips live={live} />
        </div>

        <aside className="flex max-h-[70vh] flex-col rounded-2xl border border-paper/10 bg-ink-2/80 lg:max-h-none">
          <div className="border-b border-paper/10 px-3 py-2 text-[11px] tracking-widest text-ash">
            속보 · LIVE {live.length}
          </div>
          <ul className="scroll-thin flex-1 space-y-2 overflow-y-auto p-3">
            {(feed.length ? feed : live).map((ev, i) => (
              <li
                key={ev.id + i}
                className={`ticker-in rounded-lg border px-3 py-2 ${
                  eventIsLive(ev, clock)
                    ? "border-live/40 bg-live/5"
                    : "border-paper/10 bg-ink-3/40"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gold">{REGION_LABEL[ev.region]}</span>
                  {eventIsLive(ev, clock) && (
                    <span className="text-[10px] text-live">LIVE</span>
                  )}
                </div>
                <p className="font-serif text-sm leading-snug">{ev.headline}</p>
                <p className="mt-1 text-xs leading-relaxed text-ash">
                  {mature && ev.bodyFull ? ev.bodyFull : ev.bodyFamily}
                </p>
                {ev.estimated && (
                  <p className="mt-1 text-[10px] text-ash/70">시기 추정</p>
                )}
                <div className="mt-1.5">
                  <SourceChips sources={ev.sources} />
                </div>
              </li>
            ))}
            {!feed.length && !live.length && (
              <li className="px-2 py-8 text-center text-sm text-ash">이 구간에 아직 속보가 없습니다.</li>
            )}
          </ul>
          {selectedEvent && (
            <div className="border-t border-paper/10 px-3 py-2 text-[11px] text-ash">
              선택: {getPlace(selectedEvent.placeId ?? "")?.nameKo ?? "—"}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ClockControls({
  playing,
  speed,
  progress,
  onToggle,
  onSpeed,
  onScrub,
}: {
  playing: boolean;
  speed: 1 | 10;
  progress: number;
  onToggle: () => void;
  onSpeed: () => void;
  onScrub: (t: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-paper/15 bg-ink-2 px-2 py-1">
      <button type="button" onClick={onToggle} className="min-w-10 px-2 text-xs text-paper">
        {playing ? "일시정지" : "재생"}
      </button>
      <button type="button" onClick={onSpeed} className="px-2 text-xs text-gold">
        {speed}×
      </button>
      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(progress * 1000)}
        onChange={(e) => onScrub(Number(e.target.value) / 1000)}
        className="h-1 w-28 accent-cinnabar md:w-40"
        aria-label="시간 스크럽"
      />
    </div>
  );
}

function RegionStrips({ live }: { live: WorldEvent[] }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
      {STRIPS.map((r) => {
        const ev = live
          .filter((e) => e.region === r)
          .sort((a, b) => b.importance - a.importance)[0];
        return (
          <div key={r} className="rounded-lg border border-paper/10 bg-ink-2 px-2 py-1.5">
            <p className="text-[10px] tracking-wider text-ash">{REGION_LABEL[r]}</p>
            <p className="mt-0.5 line-clamp-2 font-serif text-[12px] leading-snug">
              {ev ? ev.headline.split(" — ")[1] ?? ev.headline : "기록 없음"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
