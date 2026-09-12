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
  const prev = getVolume(num - 1);
  const next = getVolume(num + 1);

  const pager = (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
      {prev ? (
        <Link
          href={`/volumes/${prev.number}`}
          className="eik-win eik-win--flat inline-flex min-h-[44px] items-center px-3 py-2"
          style={{ color: "var(--color-eik-gold)" }}
        >
          ← {prev.number}권 {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/volumes/${next.number}`}
          className="eik-win eik-win--flat inline-flex min-h-[44px] items-center px-3 py-2"
          style={{ color: "var(--color-eik-gold)" }}
        >
          {next.number}권 {next.title} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );

  return (
    <main className="min-w-0 px-4 py-6 md:px-8">
      <Link href="/volumes" className="eik-src inline-flex min-h-[44px] items-center" style={{ color: "var(--color-eik-text-dim)" }}>
        ← 목차
      </Link>
      {pager}
      <p className="eik-src mt-3 tracking-widest" style={{ color: "var(--color-eik-cinnabar)" }}>
        {volume.number}권
      </p>
      <h1 className="seal text-3xl md:text-4xl">{volume.title}</h1>
      <p className="eik-src mt-2" style={{ color: "var(--color-eik-text-dim)" }}>
        서기 {volume.yearStart}–{volume.yearEnd} · {volume.complete ? "줄거리 수록" : "목차 개요"}
      </p>
      <p className="eik-body mt-3 max-w-2xl">{volume.blurb}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {first && (
          <Link
            href={`/world?episode=${first.id}`}
            className="inline-flex min-h-[44px] items-center px-4 py-2 text-sm"
            style={{ background: "var(--color-eik-cinnabar)", color: "var(--color-eik-text)" }}
          >
            이 권의 세계 열기
          </Link>
        )}
        {!first && (
          <Link
            href={`/world?year=${volume.yearStart}`}
            className="inline-flex min-h-[44px] items-center px-4 py-2 text-sm"
            style={{ background: "var(--color-eik-cinnabar)", color: "var(--color-eik-text)" }}
          >
            이 연대의 세계
          </Link>
        )}
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-lg">세부 에피소드</h2>
        {episodes.length === 0 ? (
          <p className="eik-win eik-win--flat mt-3 p-4 eik-body" style={{ color: "var(--color-eik-text-dim)" }}>
            이 권의 줄거리는 다음 단계에서 채워집니다. 위 버튼으로 {volume.yearStart}년 전후의 동시
            사건은 볼 수 있습니다.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {episodes.map((e) => (
              <li key={e.id}>
                <Link href={`/episodes/${e.id}`} className="eik-win eik-win--flat block p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-serif text-lg break-keep">{e.title}</p>
                    <span className="eik-src shrink-0" style={{ color: "var(--color-eik-text-dim)" }}>
                      {formatEraShort(e.timeStart)}
                    </span>
                  </div>
                  <p className="eik-body mt-1 line-clamp-2" style={{ color: "var(--color-eik-text-dim)" }}>
                    {e.plotFamily}
                  </p>
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
            <li key={ev.id}>
              <Link
                href={`/world?year=${ev.timeStart.year}`}
                className="eik-win eik-win--flat block min-h-[44px] px-3 py-2 text-sm"
              >
                <span style={{ color: "var(--color-eik-gold)" }}>{ev.headline}</span>
              </Link>
            </li>
          ))}
          {events.length === 0 && (
            <li className="eik-body" style={{ color: "var(--color-eik-text-dim)" }}>
              아직 매핑된 동시 사건이 없습니다.
            </li>
          )}
        </ul>
      </section>
      {pager}
    </main>
  );
}
