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

/** 전역도 논리 좌표 (0..1000, 0..700). `project` 결과의 ×10, ×7. */
export function projectStrategic(lon: number, lat: number): { x: number; y: number } {
  const { x, y } = project(lon, lat);
  return { x: x * 10, y: y * 7 };
}
