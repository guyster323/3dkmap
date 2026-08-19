import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllEpisodes, getCharacter } from "@/lib/content";
import { FACTION_LABEL } from "@/lib/types";

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCharacter(id);
  if (!c) notFound();
  const eps = getAllEpisodes().filter((e) => e.characterIds.includes(c.id));

  return (
    <main className="px-4 py-6 md:px-8">
      <Link href="/volumes" className="text-xs text-ash">
        ← 목차
      </Link>
      <div className="mt-4 flex gap-4">
        <div className="h-28 w-28 overflow-hidden rounded-2xl border border-paper/10 bg-ink-3">
          {c.portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.portrait} alt={c.nameKo} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center font-serif text-3xl text-gold">
              {c.nameKo.slice(0, 1)}
            </span>
          )}
        </div>
        <div>
          <p className="text-[11px] text-gold">{FACTION_LABEL[c.faction]}</p>
          <h1 className="seal text-3xl">
            {c.nameKo} <span className="text-lg text-ash">{c.nameHanja}</span>
          </h1>
          {c.courtesy && <p className="text-sm text-ash">자 {c.courtesy}</p>}
        </div>
      </div>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-paper-2">{c.bioFamily}</p>
      {c.bioFull && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ash">{c.bioFull}</p>}
      <section className="mt-8">
        <h2 className="font-serif text-lg">등장 에피소드</h2>
        <ul className="mt-3 space-y-2">
          {eps.map((e) => (
            <li key={e.id}>
              <Link href={`/episodes/${e.id}`} className="text-gold hover:underline">
                {e.volume}권 · {e.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
