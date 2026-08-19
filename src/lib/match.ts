import type { Episode, Volume } from "./types";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .replace(/제?(\d+)권/g, "$1");
}

function score(query: string, target: string): number {
  const q = normalize(query);
  const t = normalize(target);
  if (!q || !t) return 0;
  if (t.includes(q) || q.includes(t)) return Math.min(q.length, t.length) / Math.max(q.length, t.length);
  let hits = 0;
  for (let i = 0; i < q.length - 1; i++) {
    if (t.includes(q.slice(i, i + 2))) hits++;
  }
  return hits / Math.max(1, q.length - 1);
}

export type ScanHit = {
  kind: "volume" | "episode";
  volume: number;
  episodeId?: string;
  title: string;
  confidence: number;
};

export function matchScan(
  text: string,
  volumes: Volume[],
  episodes: Episode[],
): ScanHit[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const volHits: ScanHit[] = volumes.map((v) => {
    const labels = [`${v.number}권`, `제${v.number}권`, v.title, `전략삼국지${v.number}`, `삼국지${v.number}`];
    const confidence = Math.max(...labels.map((l) => score(cleaned, l)), score(cleaned, `${v.number}${v.title}`));
    return { kind: "volume", volume: v.number, title: v.title, confidence };
  });

  const epHits: ScanHit[] = episodes.map((e) => {
    const labels = [e.title, ...e.aliases];
    const confidence = Math.max(...labels.map((l) => score(cleaned, l)));
    return {
      kind: "episode",
      volume: e.volume,
      episodeId: e.id,
      title: e.title,
      confidence,
    };
  });

  return [...epHits, ...volHits]
    .filter((h) => h.confidence >= 0.28)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}
