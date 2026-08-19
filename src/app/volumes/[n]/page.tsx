import Link from "next/link";
import { notFound } from "next/navigation";
import { eventsForVolumeYears, firstEpisodeOfVolume, getEpisodesByVolume, getVolume } from "@/lib/content";
import { formatEraShort } from "@/lib/clock";

export default async function VolumePage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const num = Number(n);
  const volume = getVolume(num);
  if (!volume) notFound();
  const episodes = getEpisodesByVolume(num);
  const first = firstEpisodeOfVolume(num);
  const events = eventsForVolumeYears(volume);

  return (
    <main className="px-4 py-6 md:px-8">
      <Link href="/volumes" className="text-xs text-ash hover:text-paper">
        ← 목차
      </Link>
      <p className="mt-3 text-[11px] tracking-widest text-cinnabar">{volume.number}권</p>
      <h1 className="seal text-3xl md:text-4xl">{volume.title}</h1>
      <p className="mt-2 text-sm text-ash">
        서기 {volume.yearStart}–{volume.yearEnd} · {volume.complete ? "Plot 완성" : "목차만"}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper-2">{volume.blurb}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {first && (
          <Link
            href={`/world?episode=${first.id}`}
            className="rounded-full bg-cinnabar px-4 py-2 text-sm text-paper"
          >
            이 권의 세계 열기
          </Link>
        )}
        {!first && (
          <Link
            href={`/world?year=${volume.yearStart}`}
            className="rounded-full bg-cinnabar px-4 py-2 text-sm text-paper"
          >
            이 연대의 세계
          </Link>
        )}
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-lg">세부 에피소드</h2>
        {episodes.length === 0 ? (
          <p className="mt-3 rounded-xl border border-paper/10 bg-ink-2 p-4 text-sm text-ash">
            이 권의 Plot은 다음 단계에서 채워집니다. 위 버튼으로 {volume.yearStart}년 전후의 동시
            사건은 볼 수 있습니다.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {episodes.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/episodes/${e.id}`}
                  className="block rounded-xl border border-paper/10 bg-ink-2 p-4 hover:border-gold/40"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-serif text-lg">{e.title}</p>
                    <span className="shrink-0 text-[11px] text-ash">{formatEraShort(e.timeStart)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ash">{e.plotFamily}</p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-lg">이 연대의 다른 땅</h2>
        <ul className="mt-3 space-y-2">
          {events.slice(0, 8).map((ev) => (
            <li key={ev.id} className="rounded-lg border border-paper/10 px-3 py-2 text-sm">
              <span className="text-gold">{ev.headline}</span>
            </li>
          ))}
          {events.length === 0 && <li className="text-sm text-ash">아직 매핑된 동시 사건이 없습니다.</li>}
        </ul>
      </section>
    </main>
  );
}
