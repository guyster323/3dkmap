import { CHARACTERS } from "@/data/characters";
import { EPISODES as EPISODES_EARLY } from "@/data/episodes";
import { EPISODES_MID } from "@/data/episodes-mid";
import { EPISODES_LATE } from "@/data/episodes-late";
import { EVENTS } from "@/data/events";
import { PLACES } from "@/data/places";
import { VOLUMES } from "@/data/volumes";
import { eraToAbsDays } from "./clock";
import type { Character, Episode, Place, Volume, WorldEvent } from "./types";

const EPISODES: Episode[] = [...EPISODES_EARLY, ...EPISODES_MID, ...EPISODES_LATE];

export function getVolumes(): Volume[] {
  return VOLUMES;
}

export function getVolume(n: number): Volume | undefined {
  return VOLUMES.find((v) => v.number === n);
}

export function getEpisodesByVolume(n: number): Episode[] {
  return EPISODES.filter((e) => e.volume === n).sort((a, b) => a.order - b.order);
}

export function getEpisode(id: string): Episode | undefined {
  return EPISODES.find((e) => e.id === id);
}

export function getAllEpisodes(): Episode[] {
  return EPISODES;
}

export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

export function getPlaces(): Place[] {
  return PLACES;
}

export function getPlacesByIds(ids: string[]): Place[] {
  return ids.map(getPlace).filter((p): p is Place => Boolean(p));
}

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

export function getCharacters(): Character[] {
  return CHARACTERS;
}

export function getCharactersByIds(ids: string[]): Character[] {
  return ids.map(getCharacter).filter((c): c is Character => Boolean(c));
}

export function getEvents(): WorldEvent[] {
  return EVENTS;
}

export function eventsOverlapping(start: number, end: number): WorldEvent[] {
  return EVENTS.filter((ev) => {
    const s = eraToAbsDays(ev.timeStart);
    const e = eraToAbsDays(ev.timeEnd);
    return s < end && e > start;
  }).sort((a, b) => eraToAbsDays(a.timeStart) - eraToAbsDays(b.timeStart));
}

export function eventsForVolumeYears(volume: Volume): WorldEvent[] {
  const start = eraToAbsDays({ year: volume.yearStart, month: 1, day: 1 });
  const end = eraToAbsDays({ year: volume.yearEnd, month: 12, day: 30 });
  return eventsOverlapping(start, end);
}

export function firstEpisodeOfVolume(n: number): Episode | undefined {
  return getEpisodesByVolume(n)[0];
}

export function episodeNearestYear(year: number): Episode | undefined {
  const all = getAllEpisodes();
  if (!all.length) return undefined;
  return all.reduce((best, e) => {
    const d = Math.abs(e.timeStart.year - year);
    const bd = Math.abs(best.timeStart.year - year);
    if (d < bd) return e;
    if (d === bd && e.timeStart.year <= year && best.timeStart.year > year) return e;
    return best;
  });
}

export function catalogIssues(): string[] {
  const issues: string[] = [];
  const charIds = new Set(CHARACTERS.map((c) => c.id));
  const placeIds = new Set(PLACES.map((p) => p.id));
  const epIds = new Set(EPISODES.map((e) => e.id));
  const volNums = new Set(VOLUMES.map((v) => v.number));
  const seenEp = new Set<string>();

  for (const e of EPISODES) {
    if (seenEp.has(e.id)) issues.push(`duplicate episode id ${e.id}`);
    seenEp.add(e.id);
    if (!volNums.has(e.volume)) issues.push(`${e.id}: unknown volume ${e.volume}`);
    for (const id of e.characterIds) {
      if (!charIds.has(id)) issues.push(`${e.id}: missing character ${id}`);
    }
    for (const id of e.placeIds) {
      if (!placeIds.has(id)) issues.push(`${e.id}: missing place ${id}`);
    }
  }

  for (const ev of EVENTS) {
    if (ev.placeId && !placeIds.has(ev.placeId)) issues.push(`${ev.id}: missing place ${ev.placeId}`);
    for (const id of ev.characterIds ?? []) {
      if (!charIds.has(id)) issues.push(`${ev.id}: missing character ${id}`);
    }
    if (ev.relatedEpisodeId && !epIds.has(ev.relatedEpisodeId)) {
      issues.push(`${ev.id}: missing episode ${ev.relatedEpisodeId}`);
    }
  }

  if (VOLUMES.length !== 60) issues.push(`expected 60 volumes, got ${VOLUMES.length}`);
  for (let n = 1; n <= 60; n++) {
    if (!volNums.has(n)) issues.push(`missing volume ${n}`);
    if (!EPISODES.some((e) => e.volume === n)) issues.push(`volume ${n} has no episodes`);
  }
  for (const v of VOLUMES) {
    if (v.complete && !EPISODES.some((e) => e.volume === v.number)) {
      issues.push(`volume ${v.number} marked complete without episodes`);
    }
  }
  const epKinds = new Set(EPISODES.flatMap((e) => e.sources.map((s) => s.kind)));
  const evKinds = new Set(EVENTS.flatMap((e) => e.sources.map((s) => s.kind)));
  if (!epKinds.has("연의")) issues.push("no 연의 chips on episodes");
  if (!epKinds.has("정사")) issues.push("no 정사 chips on episodes");
  if (!evKinds.has("삼국사기")) issues.push("no 삼국사기 chips on events");
  return issues;
}

export function searchCatalog(q: string): { volumes: Volume[]; episodes: Episode[] } {
  const n = q.trim().toLowerCase();
  if (!n) return { volumes: [], episodes: [] };
  const volumes = VOLUMES.filter(
    (v) => v.title.includes(q.trim()) || String(v.number) === q.trim() || `제${v.number}권`.includes(q.trim()),
  );
  const episodes = EPISODES.filter(
    (e) => e.title.includes(q.trim()) || e.aliases.some((a) => a.includes(q.trim())),
  );
  return { volumes, episodes };
}
