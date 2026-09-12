/** Landmark / army / ship overlays. Join on placeId. Do not invent territories. */

export type CityTier = 1 | 2 | 3 | 4;

export type StrategicOverlay = {
  placeId: string;
  cityTier?: CityTier;
  landmark?: string;
  army?: string;
  ship?: string;
};

export const STRATEGIC_OVERLAYS: Record<string, StrategicOverlay> = {
  luoyang: { placeId: "luoyang", cityTier: 4 },
  changan: { placeId: "changan", cityTier: 4 },
  xuchang: { placeId: "xuchang", cityTier: 3 },
  ye: { placeId: "ye", cityTier: 3 },
  chengdu: { placeId: "chengdu", cityTier: 4 },
  jianye: { placeId: "jianye", cityTier: 3 },
  gongnae: { placeId: "gongnae", cityTier: 3 },
  hulao: { placeId: "hulao", cityTier: 2, landmark: "pass-gate" },
  chibi: { placeId: "chibi", cityTier: 1, ship: "yangtze-fleet" },
  zhuo: { placeId: "zhuo", cityTier: 2 },
  taoyuan: { placeId: "taoyuan", cityTier: 1 },
};

export function getStrategicOverlay(placeId: string): StrategicOverlay | undefined {
  return STRATEGIC_OVERLAYS[placeId];
}
