"use client";

import type { EventVisual } from "@/data/pixel-times";

export function EventBanner({
  visual,
  selected = false,
  onOpen,
  compact = false,
}: {
  visual: EventVisual;
  selected?: boolean;
  onOpen?: () => void;
  compact?: boolean;
}) {
  const name = `${visual.dateLabel} ${visual.title}`;
  return (
    <button
      id={`pt-banner-${visual.id}`}
      type="button"
      aria-label={name}
      aria-pressed={selected}
      onClick={onOpen}
      className={`eik-win pointer-events-auto flex min-h-[44px] items-center gap-1 overflow-hidden p-1 text-left hover:brightness-110 md:gap-2 md:p-1.5 ${
        selected ? "eik-win--active" : ""
      } ${compact ? "!w-[152px]" : "!w-[152px] md:!w-[240px]"}`}
      style={{ maxWidth: compact ? 152 : 240 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={visual.art.idle}
        alt=""
        width={compact ? 48 : 96}
        height={compact ? 28 : 54}
        className={`pixelated shrink-0 object-cover ${compact ? "h-7 w-12" : "h-7 w-12 md:h-[54px] md:w-[96px]"}`}
      />
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="eik-src block truncate" style={{ color: "var(--color-eik-gold)" }}>
          {visual.dateLabel}
        </span>
        <span className="block truncate font-serif text-[12px] leading-snug break-keep md:text-[13px]">
          {visual.title}
        </span>
        {compact ? null : (
          <span className="eik-body mt-0.5 hidden line-clamp-2 text-[11px] leading-snug md:block">
            {visual.summary}
          </span>
        )}
      </span>
    </button>
  );
}
