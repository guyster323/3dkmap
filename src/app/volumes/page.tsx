import Link from "next/link";
import { getVolumes } from "@/lib/content";

export default function VolumesPage() {
  const volumes = getVolumes();
  return (
    <main className="px-4 py-6 md:px-8">
      <p className="text-[11px] tracking-widest text-gold">60권 구성 · 대현 전략삼국지</p>
      <h1 className="seal mt-1 text-3xl">목차</h1>
      <p className="mt-2 max-w-xl text-sm text-ash">
        1~10권은 Plot·인물·동시 사건이 준비되어 있습니다. 11~60권은 제목과 연대, 대표 핀만 열려 있습니다.
      </p>
      <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {volumes.map((v) => (
          <li key={v.number}>
            <Link
              href={`/volumes/${v.number}`}
              className="block h-full rounded-xl border border-paper/10 bg-ink-2 p-3 hover:border-cinnabar/40"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] text-cinnabar">{String(v.number).padStart(2, "0")}</span>
                <span className="text-[10px] text-ash">
                  {v.complete ? "Plot" : "스텁"} · {v.yearStart}
                </span>
              </div>
              <p className="mt-1 font-serif text-lg leading-tight">{v.title}</p>
              <p className="mt-1 line-clamp-2 text-[11px] text-ash">{v.blurb}</p>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
