"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { DirectRecord, MatureToggle, subscribePrefs, useMature } from "@/components/MatureContext";
import { SourceBadge } from "@/components/eiketsu";
import { KoreaLocator } from "@/components/KoreaLocator";
import { getEpisode, getEvents } from "@/lib/content";
import { zoneForCoord } from "@/lib/geo-korea";
import { eraToAbsDays, formatEraShort } from "@/lib/clock";
import { loadPrefs } from "@/lib/prefs";
import type { KoreaZone } from "@/lib/types";

const PRESETS: { label: string; lat: number; lon: number }[] = [
  { label: "서울", lat: 37.57, lon: 126.98 },
  { label: "부산", lat: 35.18, lon: 129.08 },
  { label: "경주", lat: 35.84, lon: 129.22 },
  { label: "평양", lat: 39.02, lon: 125.75 },
  { label: "지안(국내성)", lat: 41.12, lon: 126.18 },
];

const YEAR_CHIPS = [
  { year: 184, label: "184 황건" },
  { year: 200, label: "200 관도" },
  { year: 208, label: "208 적벽" },
  { year: 220, label: "220 위 건국" },
  { year: 234, label: "234 오장원" },
];

function getBookYearSnapshot() {
  const id = loadPrefs().lastEpisodeId;
  if (!id) return 194;
  const ep = getEpisode(id);
  return ep?.timeStart.year ?? 194;
}

export default function MePage() {
  const { mature } = useMature();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [preset, setPreset] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "ask" | "ok" | "deny">("idle");
  const bookYear = useSyncExternalStore(subscribePrefs, getBookYearSnapshot, () => 194);
  const [yearOverride, setYearOverride] = useState<number | undefined>(undefined);
  const year = yearOverride ?? bookYear;

  const zone: KoreaZone | null = coords ? zoneForCoord(coords.lat, coords.lon) : null;

  const koreaEvents = useMemo(() => getEvents().filter((e) => e.region === "korea"), []);
  const koreaYears = useMemo(
    () => [...new Set(koreaEvents.map((e) => e.timeStart.year))].sort((a, b) => a - b),
    [koreaEvents],
  );

  const events = useMemo(() => {
    const abs = eraToAbsDays({ year, month: 6, day: 15 });
    return koreaEvents.filter((e) => {
      return eraToAbsDays(e.timeStart) <= abs && abs <= eraToAbsDays(e.timeEnd) + 360;
    });
  }, [year, koreaEvents]);

  const nearestYear = useMemo(() => {
    if (!koreaYears.length) return null;
    return koreaYears.reduce((best, y) => (Math.abs(y - year) < Math.abs(best - year) ? y : best));
  }, [koreaYears, year]);

  const askGps = () => {
    if (!navigator.geolocation) {
      setStatus("deny");
      return;
    }
    setStatus("ask");
    setPreset(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("ok");
      },
      () => setStatus("deny"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const pickPreset = (p: (typeof PRESETS)[number]) => {
    setCoords({ lat: p.lat, lon: p.lon });
    setPreset(p.label);
    setStatus("ok");
  };

  const syncBookYear = () => {
    const ep = loadPrefs().lastEpisodeId ? getEpisode(loadPrefs().lastEpisodeId!) : undefined;
    if (ep) setYearOverride(ep.timeStart.year);
  };

  const inKorea = coords ? coords.lat > 33 && coords.lat < 44 && coords.lon > 124 && coords.lon < 132 : true;

  return (
    <main className="min-w-0 px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eik-src tracking-widest" style={{ color: "var(--color-eik-jade)" }}>
            MY LOCATION · 한반도
          </p>
          <h1 className="seal mt-1 text-3xl">지금 당신이 있는 땅에서</h1>
        </div>
        <MatureToggle />
      </div>
      <p className="eik-body mt-3 max-w-xl" style={{ color: "var(--color-eik-text-dim)" }}>
        삼국지의 전장은 중원입니다. 여기서는 같은 해 고구려·삼한·한 군현에서 일어난 일을
        삼국사기·후한서로 붙입니다. 기록이 없으면 없다고 말합니다.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={askGps}
          className="min-h-[44px] px-4 py-2 text-sm"
          style={{ background: "var(--color-eik-jade)", color: "var(--color-eik-text)" }}
        >
          {status === "ask" ? "위치를 묻는 중…" : "내 위치 쓰기"}
        </button>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            aria-pressed={preset === p.label}
            onClick={() => pickPreset(p)}
            className="eik-win eik-win--flat min-h-[44px] px-3 py-2 eik-src"
            style={
              preset === p.label
                ? { background: "var(--color-eik-gold)", color: "var(--color-eik-text-ink)" }
                : { color: "var(--color-eik-gold)" }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      {status === "deny" && (
        <p className="eik-body mt-3" style={{ color: "var(--color-eik-cinnabar)" }}>
          위치 권한이 없습니다. 위 도시 중 하나를 고르세요.
        </p>
      )}

      <div className="eik-src mt-6" style={{ color: "var(--color-eik-text-dim)" }}>
        <p>기준 연도 (읽는 에피소드와 맞춤)</p>
        <div className="mt-1 flex max-w-md items-center gap-2">
          <button
            type="button"
            onClick={() => setYearOverride(Math.max(184, year - 1))}
            className="eik-win eik-win--flat min-h-[44px] px-3"
            style={{ color: "var(--color-eik-gold)" }}
          >
            1년 전
          </button>
          <input
            type="range"
            min={184}
            max={263}
            value={year}
            onChange={(e) => setYearOverride(Number(e.target.value))}
            aria-label="기준 연도"
            className="block w-full"
          />
          <button
            type="button"
            onClick={() => setYearOverride(Math.min(263, year + 1))}
            className="eik-win eik-win--flat min-h-[44px] px-3"
            style={{ color: "var(--color-eik-gold)" }}
          >
            1년 뒤
          </button>
        </div>
        <span style={{ color: "var(--color-eik-text)" }}>서기 {year}년</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {YEAR_CHIPS.map((c) => (
          <button
            key={c.year}
            type="button"
            onClick={() => setYearOverride(c.year)}
            className="eik-win eik-win--flat min-h-[44px] px-2 py-1 eik-src"
            style={
              year === c.year
                ? { background: "var(--color-eik-gold)", color: "var(--color-eik-text-ink)" }
                : { color: "var(--color-eik-gold)" }
            }
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          onClick={syncBookYear}
          className="eik-win eik-win--flat min-h-[44px] px-2 py-1 eik-src"
          style={{ color: "var(--color-eik-gold)" }}
        >
          읽던 권 연도로
        </button>
      </div>

      {coords && (
        <section className="eik-win mt-6 p-4">
          <p className="eik-src tracking-widest" style={{ color: "var(--color-eik-gold)" }}>
            비정
          </p>
          <h2 className="font-serif text-2xl">
            {zone ? `${zone.nameKo} · ${zone.nameHanja}` : "한반도 바깥"}
          </h2>
          {zone && (
            <p className="eik-body mt-1" style={{ color: "var(--color-eik-text-dim)" }}>
              {zone.regionHint}
            </p>
          )}
          <p className="eik-src mt-2" style={{ color: "var(--color-eik-text-dim)" }}>
            {coords.lat.toFixed(2)}°N {coords.lon.toFixed(2)}°E
            {!inKorea && " · 1차는 한반도만 대응합니다."}
          </p>
          <div className="mt-3">
            <KoreaLocator lat={coords.lat} lon={coords.lon} zoneName={zone?.nameKo} />
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-lg">서기 {year}년 전후 한반도 속보</h2>
        <ul className="mt-3 space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="eik-win p-4">
              <p className="eik-src" style={{ color: "var(--color-eik-gold)" }}>
                {formatEraShort(ev.timeStart)}
              </p>
              <p className="font-serif text-lg break-keep">{ev.headline}</p>
              <p className="eik-body mt-2">{ev.bodyFamily}</p>
              {mature && ev.bodyFull && ev.bodyFull !== ev.bodyFamily && <DirectRecord text={ev.bodyFull} />}
              {ev.estimated && (
                <p className="eik-src mt-1" style={{ color: "var(--color-eik-text-dim)" }}>
                  시기 추정 · 월 단위 기록 없음
                </p>
              )}
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {ev.sources.map((s) => (
                  <li key={`${s.kind}-${s.ref}`} className="min-w-0 max-w-full">
                    <SourceBadge kind={s.kind} cite={s.ref} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {events.length === 0 && (
            <li className="eik-win p-4 eik-body" style={{ color: "var(--color-eik-text-dim)" }}>
              이 해의 구체 전투 기록은 고서에 없습니다. 빈칸을 채우지 않습니다.
              {nearestYear != null && nearestYear !== year && (
                <button
                  type="button"
                  onClick={() => setYearOverride(nearestYear)}
                  className="mt-2 block min-h-[44px]"
                  style={{ color: "var(--color-eik-gold)" }}
                >
                  가장 가까운 기록: 서기 {nearestYear}년 (
                  {nearestYear > year ? `${nearestYear - year}년 뒤` : `${year - nearestYear}년 앞`}) 보기 ▶
                </button>
              )}
            </li>
          )}
        </ul>
      </section>

      <p className="eik-src mt-8" style={{ color: "var(--color-eik-text-dim)" }}>
        중원의 같은 시각이 더 중요합니다.{" "}
        <Link href="/world" style={{ color: "var(--color-eik-gold)" }}>
          전쟁상황실로
        </Link>
      </p>
    </main>
  );
}
