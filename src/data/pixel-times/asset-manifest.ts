/** Declared Pixel Times asset sizes. Code owns dimensions; AI does not. */

export const PT_SIZE = {
  portrait: { w: 64, h: 80 },
  sceneActor: { w: 48, h: 64 },
  mapOfficer: { w: 32, h: 64 },
  worldTile: { w: 16, h: 16 },
  battleTile: { w: 32, h: 32 },
  eventBanner: { w: 320, h: 180 },
  sceneBackground: { w: 480, h: 270 },
} as const;

export const PT_PATH = {
  portraits: "/assets/pixel-times/portraits/",
  sceneActors: "/assets/pixel-times/scene-actors/",
  mapSprites: "/assets/pixel-times/map-sprites/",
  banners: "/assets/pixel-times/event-banners/",
  backgrounds: "/assets/pixel-times/scene-backgrounds/",
  terrain: "/assets/pixel-times/terrain/",
  masters: "/assets/pixel-times/masters/",
  portraitAtlas: "/assets/pixel-times/portrait-atlas.png",
  sceneActorAtlas: "/assets/pixel-times/scene-actors.png",
  mapCharacterAtlas: "/assets/pixel-times/map-characters.png",
} as const;

export type PtManifestEntry = {
  path: string;
  w: number;
  h: number;
  required: boolean;
};

/** Assets that WAVE 4+ must produce. WAVE 1 entries are declared, not yet required. */
export const PT_MANIFEST: PtManifestEntry[] = [
  { path: PT_PATH.portraitAtlas, w: 512, h: 720, required: false },
  { path: PT_PATH.sceneActorAtlas, w: 192, h: 576, required: false },
  { path: PT_PATH.mapCharacterAtlas, w: 128, h: 576, required: false },
];
