"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getEpisode, getVolume, getVolumes } from "@/lib/content";
import { loadPrefs } from "@/lib/prefs";

export default function HomePage() {
  const volumes = getVolumes();
  const [resume, setResume] = useState<{ href: string; label: string } | null>(null);

  useEffect(() => {
    const p = loadPrefs();
    if (p.lastEpisodeId) {
      const ep = getEpisode(p.lastEpisodeId);
      if (ep) {
        setResume({ href: `/world?episode=${ep.id}`, label: `${ep.volume}권 · ${ep.title}` });
        return;
      }
    }
    if (p.lastVolume) {
      const v = getVolume(p.lastVolume);
      if (v) setResume({ href: `/volumes/${v.number}`, label: `${v.number}권 ${v.title}` });
    }
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-3 p-2">
      <section className="wood-panel p-6">
      <p className="text-[11px] tracking-[0.35em] text-gold">STRATEGIC SANGOKUSHI</p>
      <h1 className="seal mt-3 text-4xl leading-tight text-gold md:text-6xl">천하동시</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper-2 md:text-base">
        책을 펼친 그 순간, 중원만 움직이지 않습니다. 하북·강동·서량, 그리고 당신이 서 있는
        한반도까지 — 같은 시각의 전장을 조조전 격자로 봅니다.
      </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <Link
          href="/scan"
          className="wood-panel p-6 hover:brightness-110"
        >
          <p className="text-[11px] tracking-widest text-gold">시작 하나</p>
          <h2 className="mt-2 font-serif text-2xl text-gold">책 스캔</h2>
          <p className="mt-2 text-sm text-paper-2">
            표지·권두·회차 제목을 카메라에 비추면 권과 에피소드를 찾습니다. 만화 그림은 저장하지 않습니다.
          </p>
        </Link>
        <Link
          href="/volumes"
          className="wood-panel p-6 hover:brightness-110"
        >
          <p className="text-[11px] tracking-widest text-gold">시작 둘</p>
          <h2 className="mt-2 font-serif text-2xl">권·제목 고르기</h2>
          <p className="mt-2 text-sm text-ash">
            60권 목차에서 직접 고릅니다. 1~10권은 Plot과 동시 사건이 채워져 있습니다.
          </p>
        </Link>
      </div>

      {resume && (
        <Link
          href={resume.href}
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm text-gold"
        >
          이어서 · {resume.label}
        </Link>
      )}

      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <h3 className="font-serif text-lg">1차 완성 권</h3>
          <Link href="/volumes" className="text-xs text-ash hover:text-paper">
            60권 전체
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {volumes.slice(0, 10).map((v) => (
            <Link
              key={v.number}
              href={`/volumes/${v.number}`}
              className="wood-panel px-3 py-3 hover:brightness-110"
            >
              <p className="text-[10px] text-cinnabar">{v.number}권</p>
              <p className="font-serif">{v.title}</p>
              <p className="mt-1 text-[10px] text-ash">
                {v.yearStart}–{v.yearEnd}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
