"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { MatureToggle, useMature } from "@/components/MatureContext";
import { SourceChips } from "@/components/SourceChips";
import { KaoPortrait } from "@/components/KaoPortrait";
import { getCharactersByIds, getEpisode, getPlacesByIds, getVolume } from "@/lib/content";
import { formatEra } from "@/lib/clock";
import { FACTION_LABEL } from "@/lib/types";
import { savePrefs } from "@/lib/prefs";

export default function EpisodePage() {
  const { id } = useParams<{ id: string }>();
  const episode = getEpisode(id);
  const { mature } = useMature();

  useEffect(() => {
    if (episode) savePrefs({ lastEpisodeId: episode.id, lastVolume: episode.volume });
  }, [episode]);

  if (!episode) {
    return (
      <main className="px-4 py-10">
        <p className="text-ash">에피소드를 찾지 못했습니다.</p>
        <Link href="/volumes" className="mt-3 inline-block text-gold">
          목차로
        </Link>
      </main>
    );
  }

  const volume = getVolume(episode.volume);
  const chars = getCharactersByIds(episode.characterIds);
  const places = getPlacesByIds(episode.placeIds);
  const body = mature && episode.plotFull ? episode.plotFull : episode.plotFamily;

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/volumes/${episode.volume}`} className="text-xs text-ash hover:text-paper">
          ← {volume ? `${volume.number}권 ${volume.title}` : "목차"}
        </Link>
        <MatureToggle />
      </div>
      <p className="mt-4 text-[11px] tracking-widest text-cinnabar">PLOT</p>
      <h1 className="seal mt-1 text-3xl md:text-4xl">{episode.title}</h1>
      <p className="mt-2 text-sm text-ash">{formatEra(episode.timeStart)}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/world?episode=${episode.id}`}
          className="gold-btn px-4 py-2 text-sm"
        >
          같은 시각 천하 보기
        </Link>
        <Link href="/me" className="wood-inlay px-4 py-2 text-sm text-gold">
          내 위치의 동시대
        </Link>
      </div>

      <article className="mt-6 max-w-2xl text-[15px] leading-relaxed text-paper-2">{body}</article>
      {episode.plotFull && !mature && (
        <p className="mt-3 text-xs text-ash">정사와 연의가 갈리는 부분, 잔혹한 기록은 「본편 수위」를 여세요.</p>
      )}

      <div className="mt-6">
        <SourceChips sources={episode.sources} />
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-lg">등장인물</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {chars.map((c) => (
            <li key={c.id}>
              <Link
                href={`/characters/${c.id}`}
                className="wood-panel flex gap-3 p-3 hover:brightness-110"
              >
                <KaoPortrait character={c} size={64} caption="" />
                <div>
                  <p className="font-serif">
                    {c.nameKo}{" "}
                    <span className="text-xs text-ash">{c.nameHanja}</span>
                  </p>
                  <p className="text-[11px] text-gold">{FACTION_LABEL[c.faction]}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ash">{c.bioFamily}</p>
                </div>
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
                className="inline-block rounded-full border border-paper/15 px-3 py-1 text-sm hover:border-gold/50"
              >
                {p.nameKo}
                <span className="ml-1 text-[11px] text-ash">{p.modernName}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}