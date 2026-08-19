"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { WorldDashboard } from "@/components/WorldDashboard";
import { firstEpisodeOfVolume, getAllEpisodes, getEpisode } from "@/lib/content";
import type { Episode } from "@/lib/types";

function WorldInner() {
  const sp = useSearchParams();
  const id = sp.get("episode");
  const year = Number(sp.get("year") ?? 0);
  let episode: Episode | undefined = id ? getEpisode(id) : undefined;
  if (!episode && year) {
    episode = getAllEpisodes().find((e) => e.timeStart.year === year) ?? firstEpisodeOfVolume(1);
  }
  if (!episode) episode = firstEpisodeOfVolume(1);

  if (!episode) {
    return <p className="p-6 text-ash">열 수 있는 에피소드가 없습니다.</p>;
  }

  return <WorldDashboard episode={episode} />;
}

export default function WorldPage() {
  return (
    <Suspense fallback={<p className="p-6 text-ash">천하를 펼치는 중…</p>}>
      <WorldInner />
    </Suspense>
  );
}
