import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllEpisodes, getCharacter } from "@/lib/content";
import { UnitPanel } from "@/components/eiketsu";
import { KaoPortrait } from "@/components/KaoPortrait";

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCharacter(id);
  if (!c) notFound();
  const eps = getAllEpisodes().filter((e) => e.characterIds.includes(c.id));

  return (
    <main className="min-w-0 px-4 py-6 md:px-8">
      <Link href="/volumes" className="eik-src inline-flex min-h-[44px] items-center" style={{ color: "var(--color-eik-text-dim)" }}>
        ← 목차
      </Link>
      <h1 className="seal mt-4 text-3xl">
        {c.nameKo} <span className="text-lg" style={{ color: "var(--color-eik-text-dim)" }}>{c.nameHanja}</span>
      </h1>
      <div className="mt-4 max-w-xl">
        <UnitPanel
          title="인물"
          character={c}
          portrait={<KaoPortrait character={c} size={64} caption="" />}
        />
      </div>
      <p className="eik-body mt-5 max-w-2xl">{c.bioFamily}</p>
      {c.bioFull && (
        <p className="eik-body mt-3 max-w-2xl" style={{ color: "var(--color-eik-text-dim)" }}>
          {c.bioFull}
        </p>
      )}
      <section className="mt-8">
        <h2 className="font-serif text-lg">등장 에피소드</h2>
        <ul className="mt-3 space-y-2">
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
        </ul>
      </section>
    </main>
  );
}
