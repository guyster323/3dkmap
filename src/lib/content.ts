import { CHARACTERS } from "@/data/characters";
import { EPISODES } from "@/data/episodes";
import { EVENTS } from "@/data/events";
import { PLACES } from "@/data/places";
import { VOLUMES } from "@/data/volumes";
import { eraToAbsDays } from "./clock";
import type { Character, Episode, Place, Volume, WorldEvent } from "./types";

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
