"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { DirectRecord, MatureHint, MatureToggle, notifyPrefs, useMature } from "@/components/MatureContext";
import { DialogueBox, UnitPanel } from "@/components/eiketsu";
import { KaoPortrait } from "@/components/KaoPortrait";
import { getCharactersByIds, getEpisode, getPlacesByIds, getVolume } from "@/lib/content";
import { formatEra } from "@/lib/clock";
import { savePrefs } from "@/lib/prefs";

export default function EpisodePage() {
  const { id } = useParams<{ id: string }>();
  const episode = getEpisode(id);
  const { mature } = useMature();

  useEffect(() => {
    if (!episode) return;
    savePrefs({ lastEpisodeId: episode.id, lastVolume: episode.volume });
    notifyPrefs();
  }, [episode]);

  if (!episode) {
    return (
      <main className="px-4 py-10">
        <p style={{ color: "var(--color-eik-text-dim)" }}>에피소드를 찾지 못했습니다.</p>
        <Link href="/volumes" className="mt-3 inline-flex min-h-[44px] items-center" style={{ color: "var(--color-eik-gold)" }}>
          목차로
        </Link>
      </main>
    );
  }

  const volume = getVolume(episode.volume);
  const chars = getCharactersByIds(episode.characterIds);
  const places = getPlacesByIds(episode.placeIds);
  const extra = mature && episode.plotFull && episode.plotFull !== episode.plotFamily;
  const speaker = chars[0];

  return (
    <main className="min-w-0 px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/volumes/${episode.volume}`}
          className="eik-src min-h-[44px] inline-flex items-center"
          style={{ color: "var(--color-eik-text-dim)" }}
        >
          ← {volume ? `${volume.number}권 ${volume.title}` : "목차"}
        </Link>
        <MatureToggle />
      </div>
      <p className="eik-src mt-4 tracking-widest" style={{ color: "var(--color-eik-cinnabar)" }}>
        줄거리
      </p>
      <h1 className="seal mt-1 text-3xl md:text-4xl">{episode.title}</h1>
      <p className="eik-src mt-2" style={{ color: "var(--color-eik-text-dim)" }}>
        {formatEra(episode.timeStart)}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/world?episode=${episode.id}`}
          className="eik-win eik-win--flat inline-flex min-h-[44px] items-center px-4 py-2 text-sm"
          style={{ background: "var(--color-eik-gold)", color: "var(--color-eik-text-ink)" }}
        >
          같은 시각 천하 보기
        </Link>
        <Link
          href="/me"
          className="eik-win eik-win--flat inline-flex min-h-[44px] items-center px-4 py-2 text-sm"
          style={{ color: "var(--color-eik-gold)" }}
        >
          내 위치의 동시대
        </Link>
      </div>

      <div className="mt-6 max-w-2xl">
        <DialogueBox
          name={speaker?.nameKo ?? episode.title}
          body={episode.plotFamily}
          sources={episode.sources}
          portrait={speaker ? <KaoPortrait character={speaker} size={64} caption="" /> : undefined}
        />
      </div>
      {extra && <DirectRecord text={episode.plotFull!} />}
      {episode.plotFull && !mature && <MatureHint />}

      <section className="mt-8">
        <h2 className="font-serif text-lg">등장인물</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {chars.map((c) => (
            <li key={c.id}>
              <Link href={`/characters/${c.id}`} className="block min-w-0">
                <UnitPanel
                  character={c}
                  portrait={<KaoPortrait character={c} size={64} caption="" />}
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-lg">장소</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {places.map((p) => (
            <li key={p.id}>
              <Link
                href={`/places/${p.id}`}
                className="eik-win eik-win--flat inline-flex min-h-[44px] items-center px-3 py-1 text-sm"
              >
                {p.nameKo}
                <span className="ml-1 eik-src" style={{ color: "var(--color-eik-text-dim)" }}>
                  {p.modernName}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
