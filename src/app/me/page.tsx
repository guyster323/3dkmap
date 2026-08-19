"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MatureToggle, useMature } from "@/components/MatureContext";
import { SourceChips } from "@/components/SourceChips";
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

export default function MePage() {
  const { mature } = useMature();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "ask" | "ok" | "deny">("idle");
  const [year, setYear] = useState(194);

  useEffect(() => {
    const ep = loadPrefs().lastEpisodeId ? getEpisode(loadPrefs().lastEpisodeId!) : undefined;
    if (ep) setYear(ep.timeStart.year);
  }, []);

  const zone: KoreaZone | null = coords ? zoneForCoord(coords.lat, coords.lon) : null;

  const events = useMemo(() => {
    const abs = eraToAbsDays({ year, month: 6, day: 15 });
    return getEvents().filter((e) => {
      if (e.region !== "korea") return false;
      return eraToAbsDays(e.timeStart) <= abs && abs <= eraToAbsDays(e.timeEnd) + 360;
    });
  }, [year]);

  const askGps = () => {
    if (!navigator.geolocation) {
      setStatus("deny");
      return;
    }
    setStatus("ask");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("ok");
      },
      () => setStatus("deny"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const inKorea = coords ? coords.lat > 33 && coords.lat < 44 && coords.lon > 124 && coords.lon < 132 : true;

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] tracking-widest text-bamboo">MY LOCATION · 한반도</p>
          <h1 className="seal mt-1 text-3xl">지금 당신이 있는 땅에서</h1>
        </div>
        <MatureToggle />
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ash">
        삼국지의 전장은 중원입니다. 여기서는 같은 해 고구려·삼한·한 군현에서 일어난 일을
        삼국사기·후한서로 붙입니다. 기록이 없으면 없다고 말합니다.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={askGps}
          className="rounded-full bg-bamboo px-4 py-2 text-sm text-paper"
        >
          {status === "ask" ? "위치를 묻는 중…" : "내 위치 쓰기"}
        </button>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setCoords({ lat: p.lat, lon: p.lon });
              setStatus("ok");
            }}
            className="rounded-full border border-paper/15 px-3 py-2 text-xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {status === "deny" && (
        <p className="mt-3 text-sm text-cinnabar">위치 권한이 없습니다. 위 도시 중 하나를 고르세요.</p>
      )}

      <label className="mt-6 block text-xs text-ash">
        기준 연도 (읽는 에피소드와 맞춤)
        <input
          type="range"
          min={184}
          max={220}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="mt-1 block w-full max-w-md accent-bamboo"
        />
        <span className="text-paper">서기 {year}년</span>
      </label>

      {coords && (
        <section className="mt-6 rounded-2xl border border-bamboo/40 bg-bamboo/10 p-4">
          <p className="text-[11px] tracking-widest text-gold">비정</p>
          <h2 className="font-serif text-2xl">
            {zone ? `${zone.nameKo} · ${zone.nameHanja}` : "한반도 바깥"}
          </h2>
          {zone && <p className="mt-1 text-sm text-ash">{zone.regionHint}</p>}
          <p className="mt-2 text-xs text-ash">
            {coords.lat.toFixed(2)}°N {coords.lon.toFixed(2)}°E
            {!inKorea && " · 1차는 한반도만 대응합니다."}
          </p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-lg">서기 {year}년 전후 한반도 속보</h2>
        <ul className="mt-3 space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="rounded-xl border border-paper/10 bg-ink-2 p-4">
              <p className="text-[11px] text-gold">{formatEraShort(ev.timeStart)}</p>
              <p className="font-serif text-lg">{ev.headline}</p>
              <p className="mt-2 text-sm leading-relaxed text-paper-2">
                {mature && ev.bodyFull ? ev.bodyFull : ev.bodyFamily}
              </p>
              {ev.estimated && <p className="mt-1 text-[11px] text-ash">시기 추정 · 월 단위 기록 없음</p>}
              <div className="mt-2">
                <SourceChips sources={ev.sources} />
              </div>
            </li>
          ))}
          {events.length === 0 && (
            <li className="rounded-xl border border-paper/10 p-4 text-sm text-ash">
              이 해의 구체 전투 기록은 고서에 없습니다. 빈칸을 채우지 않습니다.
            </li>
          )}
        </ul>
      </section>

      <p className="mt-8 text-xs text-ash">
        중원의 같은 시각이 더 중요합니다.{" "}
        <Link href="/world" className="text-gold">
          전쟁상황실로
        </Link>
      </p>
    </main>
  );
}
