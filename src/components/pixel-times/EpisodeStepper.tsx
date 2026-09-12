"use client";

export function EpisodeStepper({
  hasPrevEpisode,
  hasNextEpisode,
  hasNextVolume,
  onPrevEpisode,
  onNextEpisode,
  onNextVolume,
}: {
  hasPrevEpisode: boolean;
  hasNextEpisode: boolean;
  hasNextVolume: boolean;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  onNextVolume?: () => void;
}) {
  const btn = "eik-win eik-win--flat min-h-[44px] min-w-[44px] px-3 eik-src disabled:opacity-40";
  const gold = { color: "var(--color-eik-gold)" } as const;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="sr-only">시계 정지</p>
      <button type="button" className={btn} style={gold} disabled={!hasPrevEpisode} onClick={onPrevEpisode} aria-label="이전 장">
        ◀
      </button>
      <button type="button" className={btn} style={gold} disabled={!hasNextEpisode} onClick={onNextEpisode} aria-label="다음 장">
        ▶
      </button>
      <button type="button" className={btn} style={gold} disabled={!hasNextVolume} onClick={onNextVolume} aria-label="다음 권">
        ▶▶▶
      </button>
    </div>
  );
}
