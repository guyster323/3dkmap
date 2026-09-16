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
    <ol className="flex min-h-[44px] min-w-0 items-center overflow-x-auto scroll-thin">
      {episodes.map((ep, i) => {
        const on = ep.id === activeId;
        return (
          <li key={ep.id} className="flex shrink-0 items-center">
            {i > 0 ? (
              <span aria-hidden="true" className="h-px w-3" style={{ background: "var(--color-eik-gold-dim)" }} />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect?.(ep.id)}
              className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center px-1"
              style={{ color: on ? "var(--color-eik-cinnabar)" : "var(--color-eik-text-dim)" }}
              aria-current={on ? "step" : undefined}
              aria-label={`${ep.order}장 ${ep.title}`}
            >
              <span
                aria-hidden="true"
                className="block h-1.5 w-1.5 rotate-45"
                style={{ background: on ? "var(--color-eik-cinnabar)" : "var(--color-eik-gold-dim)" }}
              />
              <span className="eik-src mt-0.5 max-w-[7em] truncate">
                {on ? `${ep.order}장 ${ep.title}` : `${ep.order}장`}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
