"use client";

import { useState } from "react";
import Link from "next/link";
import { getVolumes } from "@/lib/content";

const ERAS = [
  { label: "1~10권 군웅할거", from: 1, to: 10 },
  { label: "11~20권 중원쟁패", from: 11, to: 20 },
  { label: "21~30권 삼고초려·적벽", from: 21, to: 30 },
  { label: "31~45권 삼국정립·이릉", from: 31, to: 45 },
  { label: "46~60권 남만·북벌·오장원", from: 46, to: 60 },
];

export default function VolumesPage() {
  const volumes = getVolumes();
  const [jump, setJump] = useState("");

  const goTo = (n: number) => {
    document.getElementById(`vol-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-w-0 px-4 py-6 md:px-8">
      <p className="eik-src tracking-widest" style={{ color: "var(--color-eik-gold)" }}>
        60권 구성 · 대현 전략삼국지
      </p>
      <h1 className="seal mt-1 text-3xl">목차</h1>
      <p className="eik-body mt-2 max-w-xl" style={{ color: "var(--color-eik-text-dim)" }}>
        60권 모두 줄거리·인물·동시 사건이 준비되어 있습니다. 가족용 요약이 기본이고, 본편 수위에서 정사와 연의의 거리를 엽니다.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ERAS.map((era) => (
          <button
            key={era.from}
            type="button"
            onClick={() => goTo(era.from)}
            className="eik-win eik-win--flat min-h-[44px] px-3 py-2 eik-src"
            style={{ color: "var(--color-eik-gold)" }}
          >
            {era.label}
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex max-w-xs items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(jump);
          if (n >= 1 && n <= 60) goTo(n);
        }}
      >
        <label className="eik-src" style={{ color: "var(--color-eik-text-dim)" }}>
          권수 점프
          <input
            type="number"
            min={1}
            max={60}
            value={jump}
            onChange={(e) => setJump(e.target.value)}
            className="eik-win eik-win--flat ml-2 w-20 px-2 py-1"
            style={{ color: "var(--color-eik-text)" }}
          />
        </label>
        <button
          type="submit"
          className="eik-win eik-win--flat min-h-[44px] min-w-[44px] px-3 py-1 eik-src"
          style={{ background: "var(--color-eik-gold)", color: "var(--color-eik-text-ink)" }}
        >
          이동
        </button>
      </form>

      <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {volumes.map((v) => (
          <li key={v.number} id={`vol-${v.number}`}>
            <Link href={`/volumes/${v.number}`} className="eik-win block h-full min-h-[44px] p-3">
              <div className="flex items-baseline justify-between gap-1">
                <span className="eik-src" style={{ color: "var(--color-eik-cinnabar)" }}>
                  {String(v.number).padStart(2, "0")}
                </span>
                <span className="eik-src" style={{ color: "var(--color-eik-text-dim)" }}>
                  {v.complete ? "줄거리 수록" : "목차 개요"} · {v.yearStart}
                </span>
              </div>
              <p className="mt-1 font-serif text-lg leading-tight break-keep">{v.title}</p>
              <p className="eik-src mt-1 line-clamp-2" style={{ color: "var(--color-eik-text-dim)" }}>
                {v.blurb}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
