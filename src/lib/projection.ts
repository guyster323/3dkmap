/** Simple equirectangular projection covering late-Han China + the peninsula. */
export const MAP_BOUNDS = {
  minLon: 100,
  maxLon: 132,
  minLat: 21,
  maxLat: 44,
};

export function project(lon: number, lat: number): { x: number; y: number } {
  const { minLon, maxLon, minLat, maxLat } = MAP_BOUNDS;
  const x = ((lon - minLon) / (maxLon - minLon)) * 100;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
  return { x, y };
}

export function unproject(x: number, y: number): { lon: number; lat: number } {
  const { minLon, maxLon, minLat, maxLat } = MAP_BOUNDS;
  const lon = minLon + (x / 100) * (maxLon - minLon);
  const lat = maxLat - (y / 100) * (maxLat - minLat);
  return { lon, lat };
}
