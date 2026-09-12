/** Volume chapter marks for the top timeline. Join on volume / episode.id. */

export type BookTimeline = {
  volume: number;
  episodeIds: string[];
};

/** Derived at runtime from getEpisodesByVolume; this file only holds camera hints. */
export type EpisodeCameraHint = {
  episodeId: string;
  focusPlaceIds: string[];
};

export const EPISODE_CAMERA_HINTS: Record<string, EpisodeCameraHint> = {
  "v01-e04": { episodeId: "v01-e04", focusPlaceIds: ["taoyuan", "zhuo"] },
  "v05-e03": { episodeId: "v05-e03", focusPlaceIds: ["hulao"] },
  "v26-e01": { episodeId: "v26-e01", focusPlaceIds: ["chibi"] },
};

export function getEpisodeCameraHint(episodeId: string): EpisodeCameraHint | undefined {
  return EPISODE_CAMERA_HINTS[episodeId];
}
