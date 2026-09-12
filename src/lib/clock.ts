import type { EraDate, WorldEvent } from "./types";

const SEASON_MONTH: Record<NonNullable<EraDate["season"]>, number> = {
  spring: 2,
  summer: 5,
  autumn: 8,
  winter: 11,
};

export function eraToAbsDays(d: EraDate): number {
  const month = d.month ?? (d.season ? SEASON_MONTH[d.season] : 6);
  const day = d.day ?? 15;
  // 1-indexed month/day into a 360-day year. Using `day` (not day-1) used to
  // round-trip 15 → 16 because absDaysToEra does `(rem % 30) + 1`.
  return d.year * 360 + (month - 1) * 30 + (day - 1);
}

export function absDaysToEra(abs: number): EraDate {
  const year = Math.floor(abs / 360);
  const rem = abs - year * 360;
  const month = Math.min(12, Math.floor(rem / 30) + 1);
  const day = (rem % 30) + 1;
  const season: EraDate["season"] =
    month <= 3 ? "spring" : month <= 6 ? "summer" : month <= 9 ? "autumn" : "winter";
  return { year, month, day, season, nianhao: nianhaoFor(year) };
}

export function nianhaoFor(year: number): string {
  if (year >= 263) return "염흥 원년 무렵";
  if (year >= 258) return `경요 ${year - 257}년`;
  if (year >= 238) return `연희 ${year - 237}년`;
  if (year >= 223) return `건흥 ${year - 222}년`;
  if (year === 222) return "장무 2년";
  if (year === 221) return "장무 원년";
  if (year === 220) return "연강·황초 원년";
  if (year >= 196) return `건안 ${year - 195}년`;
  if (year === 195) return "흥평 2년";
  if (year === 194) return "흥평 원년";
  if (year === 193) return "초평 4년";
  if (year === 192) return "초평 3년";
  if (year === 191) return "초평 2년";
  if (year === 190) return "초평 원년";
  if (year === 189) return "중평 6년 · 소녕 · 영한";
  if (year >= 184 && year <= 188) return `중평 ${year - 183}년`;
  if (year >= 178) return `광화 ${year - 177}년`;
  return `${year}년`;
}

export function formatEra(d: EraDate): string {
  const nh = d.nianhao ?? nianhaoFor(d.year);
  const seasonKo =
    d.season === "spring"
      ? "봄"
      : d.season === "summer"
        ? "여름"
        : d.season === "autumn"
          ? "가을"
          : d.season === "winter"
            ? "겨울"
            : "";
  const md = d.month ? `${d.month}월${d.day ? ` ${d.day}일` : ""}` : seasonKo;
  return `${nh}${md ? ` · ${md}` : ""} · 서기 ${d.year}년`;
}

export function formatEraShort(d: EraDate): string {
  const nh = d.nianhao ?? nianhaoFor(d.year);
  return `${nh} · ${d.year}`;
}

export function eventIsLive(ev: WorldEvent, clock: number): boolean {
  return eraToAbsDays(ev.timeStart) <= clock && clock <= eraToAbsDays(ev.timeEnd);
}
