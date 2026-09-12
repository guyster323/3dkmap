"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StrategicMapCanvas } from "@/components/StrategicMapCanvas";
import { EikWindow, SourceBadge } from "@/components/eiketsu";
import { DirectRecord, MatureToggle, useMature } from "@/components/MatureContext";
import { STRATEGIC_EDGES, STRATEGIC_NODES, STRATEGIC_TERRITORIES } from "@/data/terrain";
import { episodeNearestYear, eventsOverlapping, firstEpisodeOfVolume, getEpisode, getEvents, getPlace, getVolume } from "@/lib/content";
import { absDaysToEra, eraToAbsDays, eventIsLive, formatEra } from "@/lib/clock";
import { REGION_LABEL, type Episode, type RegionId, type WorldEvent } from "@/lib/types";

const STRIPS: RegionId[] = ["zhongyuan", "hebei", "jiangdong", "shu", "xiliang", "korea"];

function WorldInner() {
  const sp = useSearchParams();
  const id = sp.get("episode");
  const year = Number(sp.get("year") ?? 0);
  let episode: Episode | undefined = id ? getEpisode(id) : undefined;
  if (!episode && year) episode = episodeNearestYear(year);
  if (!episode) episode = firstEpisodeOfVolume(1);

  if (!episode) {
    return <p className="p-6" style={{ color: "var(--color-eik-text-dim)" }}>열 수 있는 에피소드가 없습니다.</p>;
  }

  return <StrategicWorld key={episode.id} episode={episode} />;
}

function StrategicWorld({ episode }: { episode: Episode }) {
  const router = useRouter();
  const volume = getVolume(episode.volume);
  const marks = useMemo(
    () => [...new Set(getEvents().map((e) => eraToAbsDays(e.timeStart)))].sort((a, b) => a - b),
    [],
  );
  const [clock, setClock] = useState(() => eraToAbsDays(episode.timeStart));
  const [selectedPlace, setSelectedPlace] = useState<string | undefined>(episode.placeIds[0]);
  const [regionFilter, setRegionFilter] = useState<RegionId | null>(null);
  const { mature } = useMature();

  const liveAll = useMemo(
    () => eventsOverlapping(clock - 10, clock + 40).filter((e) => eventIsLive(e, clock)),
    [clock],
  );
  const live = regionFilter ? liveAll.filter((e) => e.region === regionFilter) : liveAll;
  const highlight = liveAll.map((e) => e.placeId).filter((pid): pid is string => Boolean(pid));

  const prevMark = [...marks].reverse().find((m) => m < clock);
  const nextMark = marks.find((m) => m > clock);

  const step = (mark?: number) => {
    if (mark == null) return;
    setClock(mark);
    const ev = getEvents().find((e) => eraToAbsDays(e.timeStart) === mark);
    if (ev?.placeId) setSelectedPlace(ev.placeId);
  };

  const pickRegion = (r: RegionId) => {
    const next = regionFilter === r ? null : r;
    setRegionFilter(next);
    if (next) {
      const ev = liveAll.filter((e) => e.region === next).sort((a, b) => b.importance - a.importance)[0];
      if (ev?.placeId) setSelectedPlace(ev.placeId);
    }
  };

  const openPlace = (placeId: string) => {
    setSelectedPlace(placeId);
    router.push(`/world/${placeId}?episode=${episode.id}`);
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-x-hidden p-2 md:p-0">
      <EikWindow>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="eik-src tracking-widest" style={{ color: "var(--color-eik-gold)" }}>
              전역도
            </p>
            <h1 className="eik-era mt-1 break-keep" style={{ color: "var(--color-eik-gold)" }}>
              {formatEra(absDaysToEra(clock))}
            </h1>
            <p className="eik-src mt-1">
              {volume ? `${volume.number}권 ${volume.title}` : ""} · {episode.title}
              <span className="ml-2" style={{ color: "var(--color-eik-gold)" }}>
                시계 정지
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={prevMark == null}
              onClick={() => step(prevMark)}
              className="eik-win eik-win--flat min-h-[44px] min-w-[44px] px-3 py-2 eik-src disabled:opacity-40"
              style={{ color: "var(--color-eik-gold)" }}
            >
              ◀ 이전 사건
            </button>
            <button
              type="button"
              disabled={nextMark == null}
              onClick={() => step(nextMark)}
              className="eik-win eik-win--flat min-h-[44px] min-w-[44px] px-3 py-2 eik-src disabled:opacity-40"
              style={{ color: "var(--color-eik-gold)" }}
            >
              다음 사건 ▶
            </button>
            <MatureToggle />
          </div>
        </div>
        <p className="eik-body mt-2">
          {episode.plotFamily.slice(0, 80)}
          {episode.plotFamily.length > 80 ? "…" : ""}
          <Link href={`/episodes/${episode.id}`} className="ml-2" style={{ color: "var(--color-eik-gold)" }}>
            줄거리
          </Link>
        </p>
      </EikWindow>

      <div className="grid min-h-0 min-w-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.85fr)]">
        <div className="flex min-h-[300px] min-w-0 flex-col gap-2">
          <StrategicMapCanvas
            nodes={STRATEGIC_NODES}
            edges={STRATEGIC_EDGES}
            territories={STRATEGIC_TERRITORIES}
            selectedPlaceId={selectedPlace}
            highlight={highlight}
            onSelect={openPlace}
          />
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
            {STRIPS.map((r) => {
              const ev = liveAll.filter((e) => e.region === r).sort((a, b) => b.importance - a.importance)[0];
              const on = regionFilter === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => pickRegion(r)}
                  aria-pressed={on}
                  className="eik-win eik-win--flat min-h-[44px] px-2 py-1.5 text-left"
                  style={on ? { boxShadow: "inset 0 0 0 1px #f0dc8a" } : undefined}
                >
                  <p className="eik-src" style={{ color: "var(--color-eik-gold)" }}>
                    {REGION_LABEL[r]}
                  </p>
                  <p className="line-clamp-2 font-serif text-[11px] leading-snug break-keep">
                    {ev ? ev.headline.split(" — ")[1] ?? ev.headline : "—"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <EikWindow title="그 시각 사건" className="flex max-h-[70vh] min-w-0 flex-col lg:max-h-none">
          <ul className="scroll-thin flex-1 space-y-2 overflow-y-auto">
            {live.map((ev) => (
              <EventRow
                key={ev.id}
                ev={ev}
                mature={mature}
                active={ev.placeId === selectedPlace}
                onPick={() => ev.placeId && openPlace(ev.placeId)}
              />
            ))}
            {!live.length && (
              <li className="eik-body" style={{ color: "var(--color-eik-text-dim)" }}>
                이 순간에 매핑된 동시 사건이 없습니다.
              </li>
            )}
          </ul>
        </EikWindow>
      </div>
    </main>
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
