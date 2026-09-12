import Link from "next/link";
import { notFound } from "next/navigation";
import { HistoricalMap } from "@/components/HistoricalMap";
import { getAllEpisodes, getEvents, getPlace, getPlaces } from "@/lib/content";
import { REGION_LABEL } from "@/lib/types";

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPlace(id);
  if (!p) notFound();
  const eps = getAllEpisodes().filter((e) => e.placeIds.includes(p.id));
  const evs = getEvents().filter((e) => e.placeId === p.id);
  const allPlaces = getPlaces();

  return (
    <main className="min-w-0 px-4 py-6 md:px-8">
      <Link href="/world" className="eik-src inline-flex min-h-[44px] items-center" style={{ color: "var(--color-eik-text-dim)" }}>
        ← 세계
      </Link>
      <p className="eik-src mt-3 tracking-widest" style={{ color: "var(--color-eik-gold)" }}>
        {REGION_LABEL[p.region]} · {p.kind}
      </p>
      <h1 className="seal text-3xl">
        {p.nameKo} <span className="text-lg" style={{ color: "var(--color-eik-text-dim)" }}>{p.nameHanja}</span>
      </h1>
      <p className="eik-src mt-1" style={{ color: "var(--color-eik-text-dim)" }}>
        오늘날 {p.modernName}
      </p>
      {p.note && <p className="eik-body mt-3 max-w-xl">{p.note}</p>}

      <div className="mt-5 min-h-[280px]">
        <HistoricalMap places={allPlaces} liveEvents={evs} selectedId={p.id} />
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-lg">관련 에피소드</h2>
        <ul className="mt-3 space-y-1">
          {eps.map((e) => (
            <li key={e.id}>
              <Link
                href={`/episodes/${e.id}`}
                className="inline-flex min-h-[44px] items-center"
                style={{ color: "var(--color-eik-gold)" }}
              >
                {e.volume}권 · {e.title}
              </Link>
            </li>
          ))}
          {eps.length === 0 && (
            <li className="eik-body" style={{ color: "var(--color-eik-text-dim)" }}>
              이 장소와 직접 묶인 회차는 없습니다.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
