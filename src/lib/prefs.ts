const KEY = "3kdmap.prefs.v1";

export type Prefs = {
  mature: boolean;
  lastEpisodeId?: string;
  lastVolume?: number;
  speed: 0 | 1 | 10;
};

const DEFAULTS: Prefs = { mature: false, speed: 1 };

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(p: Partial<Prefs>): Prefs {
  const next = { ...loadPrefs(), ...p };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
