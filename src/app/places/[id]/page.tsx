import Link from "next/link";
import { notFound } from "next/navigation";
import { TileMap } from "@/components/TileMap";
import { getAllEpisodes, getEvents, getPlace } from "@/lib/content";
import { REGION_LABEL } from "@/lib/types";

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPlace(id);
  if (!p) notFound();
  const eps = getAllEpisodes().filter((e) => e.placeIds.includes(p.id));
  const evs = getEvents().filter((e) => e.placeId === p.id);

  return (
    <main className="px-4 py-6 md:px-8">
      <Link href="/world" className="text-xs text-ash">
        ← 세계
      </Link>
      <p className="mt-3 text-[11px] tracking-widest text-gold">
        {REGION_LABEL[p.region]} · {p.kind}
      </p>
      <h1 className="seal text-3xl">
        {p.nameKo} <span className="text-lg text-ash">{p.nameHanja}</span>
      </h1>
      <p className="mt-1 text-sm text-ash">오늘날 {p.modernName}</p>
      {p.note && <p className="mt-3 max-w-xl text-sm text-paper-2">{p.note}</p>}

      <div className="mt-5">
        <TileMap places={[p]} liveEvents={evs} selectedId={p.id} />
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-lg">관련 에피소드</h2>
        <ul className="mt-3 space-y-1">
          {eps.map((e) => (
            <li key={e.id}>
              <Link href={`/episodes/${e.id}`} className="text-gold hover:underline">
                {e.volume}권 · {e.title}
              </Link>
            </li>
          ))}
          {eps.length === 0 && <li className="text-sm text-ash">1차 Plot에 직접 묶인 회차는 없습니다.</li>}
        </ul>
      </section>
    </main>
  );
}
