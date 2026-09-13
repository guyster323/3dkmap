"use client";

import type { EventVisual } from "@/data/pixel-times";

export function EventBanner({
  visual,
  selected = false,
  onOpen,
}: {
  visual: EventVisual;
  selected?: boolean;
  onOpen?: () => void;
}) {
  const name = `${visual.dateLabel} ${visual.title}`;
  return (
    <button
      id={`pt-banner-${visual.id}`}
      type="button"
      aria-label={name}
      aria-pressed={selected}
      onClick={onOpen}
      className={`eik-win pointer-events-auto flex min-h-[44px] min-w-[180px] max-w-[280px] gap-2 p-1.5 text-left hover:brightness-110 ${
        selected ? "eik-win--active" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={visual.art.idle}
        alt=""
        width={120}
        height={68}
        className="pixelated h-[68px] w-[120px] shrink-0 object-cover"
      />
      <span className="min-w-0">
        <span className="eik-src block" style={{ color: "var(--color-eik-gold)" }}>
          {visual.dateLabel}
        </span>
        <span className="block font-serif text-[13px] leading-snug break-keep">{visual.title}</span>
        <span className="eik-body mt-0.5 line-clamp-2 block text-[11px] leading-snug">{visual.summary}</span>
      </span>
    </button>
  );
}
