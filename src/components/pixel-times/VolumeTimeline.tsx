"use client";

import type { Episode } from "@/lib/types";

export function VolumeTimeline({
  episodes,
  activeId,
  onSelect,
}: {
  episodes: Episode[];
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <ol className="flex min-h-[44px] min-w-0 items-center gap-1 overflow-x-auto scroll-thin">
      {episodes.map((ep, i) => {
        const on = ep.id === activeId;
        return (
          <li key={ep.id} className="flex min-w-0 items-center gap-1">
            {i > 0 ? (
              <span aria-hidden="true" className="eik-src" style={{ color: "var(--color-eik-gold-dim)" }}>
                ──
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onSelect?.(ep.id)}
              className="eik-win eik-win--flat min-h-[44px] whitespace-nowrap px-2 py-1 eik-src"
              style={on ? { background: "var(--color-eik-gold)", color: "var(--color-eik-text-ink)" } : undefined}
              aria-current={on ? "step" : undefined}
            >
              {ep.order}장 {ep.title}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
