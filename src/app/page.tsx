"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CommandWindow, EikWindow } from "@/components/eiketsu";
import { subscribePrefs } from "@/components/MatureContext";
import { getEpisode, getVolume, getVolumes } from "@/lib/content";
import { loadPrefs } from "@/lib/prefs";

const LANDMARK_VOLUMES = [1, 5, 11, 21, 26, 35, 41, 45, 49, 59];

type Resume = { href: string; label: string } | null;

function computeResume(): Resume {
  const p = loadPrefs();
  if (p.lastEpisodeId) {
    const ep = getEpisode(p.lastEpisodeId);
    if (ep) return { href: `/world?episode=${ep.id}`, label: `${ep.volume}권 · ${ep.title}` };
  }
  if (p.lastVolume) {
    const v = getVolume(p.lastVolume);
    if (v) return { href: `/volumes/${v.number}`, label: `${v.number}권 ${v.title}` };
  }
  return null;
}

let cachedResume: Resume = null;

function getResumeSnapshot(): Resume {
  const next = computeResume();
  if (
    cachedResume === next ||
    (cachedResume !== null &&
      next !== null &&
      cachedResume.href === next.href &&
      cachedResume.label === next.label)
  ) {
    return cachedResume;
  }
  cachedResume = next;
  return next;
}

function getResumeServerSnapshot(): Resume {
  return null;
}

export default function HomePage() {
  const volumes = getVolumes();
  const resume = useSyncExternalStore(subscribePrefs, getResumeSnapshot, getResumeServerSnapshot);

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-3 p-2">
      <EikWindow>
        <p className="eik-src tracking-[0.35em]" style={{ color: "var(--color-eik-gold)" }}>
          STRATEGIC SANGOKUSHI
        </p>
        <h1 className="seal mt-3 text-4xl leading-tight md:text-6xl" style={{ color: "var(--color-eik-gold)" }}>
          Pixel Times
        </h1>
        <p className="eik-src mt-2" style={{ color: "var(--color-eik-gold-dim)" }}>
          픽셀 타임즈 · 전략 삼국지 동무
        </p>
        <p className="eik-body mt-3 max-w-xl">
          책을 펼친 그 순간, 중원만 움직이지 않습니다. 하북·강동·서량, 그리고 당신이 서 있는
          한반도까지 — 같은 시각의 전장을 조조전 격자로 봅니다.
        </p>
      </EikWindow>

      <CommandWindow
        title="시작"
        items={[
          { id: "scan", label: "책 스캔", href: "/scan" },
          { id: "volumes", label: "권·제목 고르기", href: "/volumes" },
          {
            id: "resume",
            label: resume ? `이어서 · ${resume.label}` : "이어서",
            href: resume?.href,
            disabled: !resume,
          },
        ]}
      />

      <EikWindow title="황건에서 오장원까지">
        <div className="mb-3 flex items-end justify-between gap-2">
          <p className="eik-src" style={{ color: "var(--color-eik-text-dim)" }}>
            랜드마크 권
          </p>
          <Link href="/volumes" className="eik-src min-h-[44px] inline-flex items-center" style={{ color: "var(--color-eik-text-dim)" }}>
            60권 전체
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {volumes
            .filter((v) => LANDMARK_VOLUMES.includes(v.number))
            .map((v) => (
              <Link
                key={v.number}
                href={`/volumes/${v.number}`}
                className="eik-win eik-win--flat min-h-[44px] px-3 py-3"
              >
                <p className="eik-src" style={{ color: "var(--color-eik-cinnabar)" }}>
                  {v.number}권
                </p>
                <p className="font-serif break-keep">{v.title}</p>
                <p className="eik-src mt-1" style={{ color: "var(--color-eik-text-dim)" }}>
                  {v.yearStart}–{v.yearEnd}
                </p>
              </Link>
            ))}
        </div>
      </EikWindow>
    </main>
  );
}
